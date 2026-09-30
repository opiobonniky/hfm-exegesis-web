#!/usr/bin/env node
/*
 * apply-hardcoded-tt.mjs — wire hardcoded page literals to the `tt()` translator.
 *
 * For every string produced by `find-hardcoded-strings.mjs`, this rewrites the
 * source so the literal is looked up in the generated `hardcoded.{lang}.json`
 * dictionaries at render time:
 *
 *   <Button>Cancel</Button>                  →  <Button>{tt("Cancel")}</Button>
 *   <Input placeholder="Select book..." />   →  <Input placeholder={tt("Select book...")} />
 *   toast.success("Verse copied")            →  toast.success(tt("Verse copied"))
 *
 * Edits are AST-precise (@babel/parser): only the exact node span is replaced,
 * so no formatting or unrelated code is touched. JSX text is replaced with the
 * same string React already rendered (JSX whitespace normalization is replicated
 * by find-hardcoded-strings.mjs), so output is visually identical in English.
 *
 * Usage:
 *   node scripts/apply-hardcoded-tt.mjs --dry-run     # report only
 *   node scripts/apply-hardcoded-tt.mjs                # apply
 *   node scripts/apply-hardcoded-tt.mjs --only Admin   # limit to matching paths
 *
 * Idempotent: already-wired tt("…") calls are left alone, so re-running is safe.
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SOURCE_LIST = resolve(ROOT, 'docs/hardcoded-source.json');
const TT_MODULE = '@/components/languages/hardcodedTranslate';

const SCAN_DIRS = [
  resolve(ROOT, 'src/features'),
  resolve(ROOT, 'src/components'),
  resolve(ROOT, 'src/pages'),
];

/** Never rewrite the i18n plumbing or tests. */
const SKIP_PATHS = ['src/components/languages/', '.test.', '.spec.'];

const LABEL_PROPS = new Set([
  'placeholder', 'title', 'aria-label', 'label', 'buttonText', 'buttonLabel',
  'submitLabel', 'cancelText', 'confirmText', 'actionLabel', 'emptyText',
  'emptyTitle', 'emptyDescription', 'noResultsTitle', 'noResultsDesc', 'loadingText',
  'successText', 'errorText', 'headerText', 'footerText', 'description',
  'subtitle', 'tagline', 'badgeText', 'tooltip', 'helperText', 'hint', 'chipsLabel',
]);

const OBJECT_TEXT_KEYS = new Set(LABEL_PROPS);
const SCRIPTURE_PREVIEW_DESCRIPTIONS = new Set([
  'In the beginning was the Word',
  'The LORD is my shepherd',
  'In the beginning God created',
  'All things work together',
  'I can do all things',
  'They that wait upon the LORD',
]);

function isObjectTextField(name, value, rel) {
  if (rel === 'src/components/AppSidebar.tsx' && name === 'title') return false;
  if (OBJECT_TEXT_KEYS.has(name)) return true;
  if (name === 'desc') return !SCRIPTURE_PREVIEW_DESCRIPTIONS.has(value);
  return name === 'name' && rel === 'src/features/Bible/constants.ts';
}

function normalizeJSXText(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');
}

function walk(node, visit, parent = null) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit, parent);
    return;
  }
  if (typeof node.type === 'string') visit(node, parent);
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const value = node[key];
    if (value && typeof value === 'object') walk(value, visit, node);
  }
}

function collectDisplayExpressionEdits(node, allow, edits) {
  if (!node) return;
  if (node.type === 'StringLiteral') {
    const text = node.value.trim();
    if (allow.has(text)) {
      edits.push({
        start: node.start, end: node.end, kind: 'jsx-expression',
        replacement: `tt(${JSON.stringify(text)})`,
      });
    }
    return;
  }
  if (node.type === 'ConditionalExpression') {
    collectDisplayExpressionEdits(node.consequent, allow, edits);
    collectDisplayExpressionEdits(node.alternate, allow, edits);
    return;
  }
  if (node.type === 'LogicalExpression') {
    collectDisplayExpressionEdits(node.right, allow, edits);
  }
}

function toastCalleeName(callee) {
  if (!callee) return null;
  if (callee.type === 'Identifier' && (callee.name === 'toast' || callee.name === 'sonner')) {
    return callee.name;
  }
  if (callee.type === 'MemberExpression' && callee.object?.type === 'Identifier'
      && callee.object.name === 'toast' && callee.property?.type === 'Identifier') {
    return `toast.${callee.property.name}`;
  }
  return null;
}

/**
 * Collect span edits for one file: [{ start, end, replacement, kind }].
 * Only strings present in the source list are wrapped, which keeps this in
 * lockstep with the dictionaries produced by translate-locales.mjs.
 */
function collectEdits(ast, source, allow, rel) {
  const edits = [];

  walk(ast.program, (node, parent) => {
    if (node.type === 'JSXText') {
      const text = normalizeJSXText(node.value);
      if (allow.has(text)) {
        edits.push({
          start: node.start, end: node.end, kind: 'jsx-text',
          replacement: `{tt(${JSON.stringify(text)})}`,
        });
      }
      return;
    }

    if (node.type === 'JSXAttribute' && node.value?.type === 'StringLiteral') {
      const name = node.name?.name ?? node.name?.value;
      if (LABEL_PROPS.has(name) && allow.has(node.value.value.trim())) {
        edits.push({
          start: node.value.start, end: node.value.end, kind: `attr:${name}`,
          replacement: `{tt(${JSON.stringify(node.value.value.trim())})}`,
        });
      }
      return;
    }

    if (node.type === 'ObjectProperty' && node.value?.type === 'StringLiteral') {
      const name = node.key?.name ?? node.key?.value;
      const text = node.value.value.trim();
      if (isObjectTextField(name, node.value.value, rel) && allow.has(text)) {
        edits.push({
          start: node.value.start, end: node.value.end, kind: `object:${name}`,
          replacement: `tt(${JSON.stringify(text)})`,
        });
      }
      return;
    }

    if (node.type === 'JSXExpressionContainer') {
      const attributeName = parent?.type === 'JSXAttribute'
        ? (parent.name?.name ?? parent.name?.value)
        : null;
      if (!attributeName || LABEL_PROPS.has(attributeName)) {
        collectDisplayExpressionEdits(node.expression, allow, edits);
      }
      return;
    }

    if (node.type === 'CallExpression') {
      const isToast = Boolean(toastCalleeName(node.callee));
      const isTt = node.callee?.type === 'Identifier' && node.callee.name === 'tt';
      if (isToast || isTt) {
        for (const arg of node.arguments) {
          if (arg?.type !== 'StringLiteral') continue;
          const text = arg.value.trim();
          if (isTt) {
            // If a stricter scan removed a false positive (for example a
            // Tailwind class under an object key named `title`), restore the
            // original literal and drop the now-unused import below.
            if (!allow.has(text)) {
              edits.push({
                start: node.start, end: node.end, kind: 'cleanup',
                replacement: JSON.stringify(arg.value),
              });
            }
            continue;
          }
          if (!allow.has(text)) continue;
          edits.push({
            start: arg.start, end: arg.end, kind: 'toast',
            replacement: `tt(${JSON.stringify(text)})`,
          });
        }
      }
    }
  });

  // Apply right-to-left so earlier offsets stay valid.
  return edits.sort((a, b) => b.start - a.start);
}

/** Insert the tt import after the last top-level import, else at the top. */
function addImport(source, ast) {
  const body = ast.program.body;
  let insertAt = 0;
  for (const stmt of body) {
    if (stmt.type === 'ImportDeclaration') {
      insertAt = stmt.end;
    } else if (stmt.type !== 'Comment') {
      break;
    }
  }
  const line = `import { tt } from '${TT_MODULE}';\n`;
  if (insertAt === 0) return `${line}${source}`;
  return `${source.slice(0, insertAt)}\n${line.trimEnd()}${source.slice(insertAt)}`;
}

function collectFiles(filter) {
  const files = [];
  const walkDir = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walkDir(full);
      else if (/\.tsx?$/.test(entry) && !/\.(test|spec)\./.test(entry)) files.push(full);
    }
  };
  for (const dir of SCAN_DIRS) if (existsSync(dir)) walkDir(dir);
  return filter ? files.filter((f) => f.includes(filter)) : files;
}

function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const onlyIdx = argv.indexOf('--only');
  const filter = onlyIdx !== -1 ? argv[onlyIdx + 1] : null;

  if (!existsSync(SOURCE_LIST)) {
    console.error(`Missing ${SOURCE_LIST}. Run: npm run translate:scan`);
    process.exit(1);
  }
  const allow = new Set(JSON.parse(readFileSync(SOURCE_LIST, 'utf8')));
  const files = collectFiles(filter);

  let changedFiles = 0;
  let totalEdits = 0;
  const kinds = {};

  for (const file of files) {
    const rel = file.replace(`${ROOT}/`, '');
    if (SKIP_PATHS.some((s) => rel.includes(s))) continue;

    const source = readFileSync(file, 'utf8');
    const hasTtImport = source.includes(TT_MODULE);

    let ast;
    try {
      ast = parse(source, {
        sourceType: 'module',
        allowReturnOutsideFunction: true,
        errorRecovery: true,
        plugins: ['typescript', 'jsx'],
      });
    } catch {
      console.error(`skip (parse error): ${rel}`);
      continue;
    }

    const edits = collectEdits(ast, source, allow, rel);
    if (!edits.length) continue;

    // Drop overlapping edits defensively (e.g. a JSXText inside an attribute we wrapped).
    const filtered = [];
    let lastStart = Infinity;
    for (const edit of edits) {
      if (edit.end <= lastStart) {
        filtered.push(edit);
        lastStart = edit.start;
      }
    }

    let out = source;
    for (const edit of filtered) {
      out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end);
      kinds[edit.kind] = (kinds[edit.kind] || 0) + 1;
    }
    if (!hasTtImport) out = addImport(out, ast);
    if (!out.includes('tt(')) {
      out = out.replace(new RegExp(`^import \\{ tt \\} from ['"]${TT_MODULE}['"];\\n?`, 'm'), '');
    }

    if (!dryRun) writeFileSync(file, out);
    changedFiles += 1;
    totalEdits += filtered.length;
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}files changed: ${changedFiles}/${files.length}`);
  console.log(`literals wrapped: ${totalEdits}`);
  console.log(`by kind: ${Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' ') || 'none'}`);
  console.log('next: npm run typecheck:app && npm run build');
}

main();

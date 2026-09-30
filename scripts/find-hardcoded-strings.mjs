#!/usr/bin/env node
/*
 * find-hardcoded-strings.mjs — scan web src for English strings that live
 * directly in pages/components instead of src/components/languages/en.json.
 *
 * AST-precise (uses @babel/parser, already a transitive dependency) so it
 * captures every static UI literal, including multi-line JSX text:
 *   1. Static JSX text nodes:  <Button>Save</Button>, <p>Verse Text (auto)</p>
 *   2. Label-ish string props: placeholder="…", title="…", aria-label="…", label="…"
 *   3. Toast messages:         toast("…"), toast.success("…"), toast.error("…")
 *   4. Already-wired calls:    tt("…")   (keeps the list stable after wiring)
 *
 * Outputs:
 *   docs/hardcoded-source.json        — unique texts (sorted by usage) → feeds
 *                                       `translate-locales.mjs --hardcoded`
 *   docs/hardcoded-strings-report.md  — human report with file:line references
 *
 * Every hit is still reviewed before wiring: `apply-hardcoded-tt.mjs` wraps the
 * matching AST nodes in `tt("…")` so the same source list stays valid.
 */

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SCAN_DIRS = [
  resolve(ROOT, 'src/features'),
  resolve(ROOT, 'src/components'),
  resolve(ROOT, 'src/pages'),
  resolve(ROOT, 'src/data'),
];
const OUT_SOURCE = resolve(ROOT, 'docs/hardcoded-source.json');
const OUT_REPORT = resolve(ROOT, 'docs/hardcoded-strings-report.md');
const OUT_EN_DICTIONARY = resolve(ROOT, 'src/components/languages/hardcoded.en.json');

/** Attribute names whose string values are user-facing text. */
const LABEL_PROPS = new Set([
  'placeholder', 'title', 'aria-label', 'label', 'buttonText', 'buttonLabel',
  'submitLabel', 'cancelText', 'confirmText', 'actionLabel', 'emptyText',
  'emptyTitle', 'emptyDescription', 'noResultsTitle', 'noResultsDesc', 'loadingText',
  'successText', 'errorText', 'headerText', 'footerText', 'description',
  'subtitle', 'tagline', 'badgeText', 'tooltip', 'helperText', 'hint', 'chipsLabel',
]);

/** Object fields commonly rendered directly as UI configuration. */
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
  // Color names are rendered as labels; other `name` values include people,
  // voices, and product tiers that must remain proper names.
  return name === 'name' && rel === 'src/features/Bible/constants.ts';
}

/** Bare identifiers that are never user-facing text. */
const STOPLIST = new Set([
  'auto', 'none', 'true', 'false', 'null', 'undefined', 'object', 'string',
  'number', 'boolean', 'function', 'array', 'div', 'span', 'button', 'input',
  'svg', 'html', 'body', 'ltr', 'rtl', 'left', 'right', 'center', 'top',
  'bottom', 'flex', 'grid', 'block', 'inline', 'hidden', 'visible', 'small',
  'medium', 'large', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'is', 'has',
  'do', 'go', 'px', 'em', 'rem', 'vh', 'vw', 'dvh', 'id', 'class', 'className',
  'key', 'style', 'onclick', 'onchange', 'onload', 'www', 'com', 'org', 'net',
  'next', 'prev', 'min', 'max', 'avg', 'sum', 'tot', 'use client', 'client',
]);

/** React's JSX text normalization: trim each line, drop blank lines, join with single space. */
function normalizeJSXText(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ');
}

function looksLikeFileToken(t) {
  return /\.(tsx?|jsx?|json|css|html)$/.test(t) || (t.includes('/') && !t.includes(' '));
}

function looksLikeStylingToken(t) {
  if (/^(?:hsl|rgb|rgba|var)\(/.test(t)) return true;
  const parts = t.split(/\s+/);
  const styling = parts.filter((part) => /^(?:!?\[|(?:sm|md|lg|xl|2xl|dark|hover|focus|focus-visible|group-hover|disabled|data-)[:[]|(?:bg|text|border|font|p|px|py|ps|pe|pt|pb|m|mx|my|ms|me|mt|mb|h|w|min|max|grid|col|row|flex|items|justify|content|self|place|gap|space|rounded|shadow|ring|outline|overflow|object|leading|tracking|transition|duration|ease|opacity|z|inset|start|end|top|bottom|left|right|translate|scale|rotate|cursor|select|whitespace|break|line-clamp|aspect)-)/.test(part));
  return parts.length > 0 && styling.length / parts.length >= 0.5;
}

/** True when a candidate is real user-facing English text worth translating. */
function isTranslatable(t) {
  if (!t) return false;
  const s = t.trim();
  if (s.length < 3 || s.length > 200) return false;
  if (!/[A-Za-z]{2}/.test(s)) return false;                 // needs a real word
  if (/^[\W\d]+$/.test(s)) return false;                    // punctuation/numbers only
  if (s.includes('${') || s.startsWith('`')) return false;  // template dynamic
  if (/^(https?:|mailto:|tel:|data:|blob:|javascript:)/i.test(s)) return false;
  if (looksLikeFileToken(s)) return false;
  if (looksLikeStylingToken(s)) return false;
  if (/^React\.|ComponentProps/.test(s)) return false;      // TS type residue
  if (s !== s.replace(/[🚀❌✅⚠️✨🙏📖🔍🔔📄#'"%+=<>]/g, '')) {
    // keep emoji/symbol-bearing text; only reject if nothing readable remains
    if (!/[A-Za-z]{2}/.test(s.replace(/[^\p{L}\p{N}\s]/gu, ''))) return false;
  }
  if (/\d{2,}/.test(s) && !/[A-Za-z ]{2}/.test(s)) return false; // bare numbers/refs
  const lower = s.toLowerCase();
  if (STOPLIST.has(lower)) return false;
  if (/^\d+[A-Za-z]+\d+$/.test(s)) return false;            // verse refs like 1John3
  return true;
}

/** Minimal AST walk (no @babel/traverse dependency). */
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

function collectDisplayExpressionStrings(node, add) {
  if (!node) return;
  if (node.type === 'StringLiteral') {
    add(node.value, node, 'jsx-expression');
    return;
  }
  if (node.type === 'ConditionalExpression') {
    collectDisplayExpressionStrings(node.consequent, add);
    collectDisplayExpressionStrings(node.alternate, add);
    return;
  }
  if (node.type === 'LogicalExpression') {
    // In `{condition && "Loading..."}`, only the right-hand side is rendered.
    collectDisplayExpressionStrings(node.right, add);
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

function scanFile(absFile) {
  const source = readFileSync(absFile, 'utf8');
  const rel = absFile.replace(`${ROOT}/`, '');
  let ast;
  try {
    ast = parse(source, {
      sourceType: 'module',
      allowReturnOutsideFunction: true,
      errorRecovery: true,
      plugins: ['typescript', 'jsx'],
    });
  } catch {
    return []; // unparsable file — skip rather than emit noise
  }

  const hits = [];
  const add = (text, node, kind) => {
    const cleaned = text.trim();
    if (!isTranslatable(cleaned)) return;
    hits.push({ text: cleaned, kind, line: node.loc?.start?.line ?? 0, ref: rel });
  };

  walk(ast.program, (node, parent) => {
    // Canonical Bible book arrays use English names as stable IDs. Add the
    // names to the dictionary, but do not mutate those source arrays; rendered
    // labels call tt(book) while values/API requests stay English.
    if (node.type === 'VariableDeclarator' && /^BIBLE_BOOKS(?:_|$)/.test(node.id?.name)
        && node.init?.type === 'ArrayExpression') {
      for (const element of node.init.elements) {
        if (element?.type === 'StringLiteral') add(element.value, element, 'static:BIBLE_BOOKS');
      }
      return;
    }
    // 1) Static JSX text (handles multi-line text that JSX collapses to one string)
    if (node.type === 'JSXText') {
      add(normalizeJSXText(node.value), node, 'jsx-text');
      return;
    }
    // 2) Label-ish attribute string values
    if (node.type === 'JSXAttribute' && node.value?.type === 'StringLiteral') {
      const name = node.name?.name ?? node.name?.value;
      if (LABEL_PROPS.has(name)) add(node.value.value, node, `attr:${name}`);
      return;
    }
    // 3) UI configuration objects: { label: "Home", title: "Success", ... }
    if (node.type === 'ObjectProperty' && node.value?.type === 'StringLiteral') {
      const name = node.key?.name ?? node.key?.value;
      if (rel === 'src/components/AppSidebar.tsx' && name === 'title') {
        add(node.value.value, node.value, 'static:NAV');
        return;
      }
      if (isObjectTextField(name, node.value.value, rel)) {
        add(node.value.value, node.value, `object:${name}`);
      }
      return;
    }
    // 4) Direct/conditional strings rendered from JSX expressions. Ignore
    // non-text attributes such as className={condition ? "a" : "b"}.
    if (node.type === 'JSXExpressionContainer') {
      const attributeName = parent?.type === 'JSXAttribute'
        ? (parent.name?.name ?? parent.name?.value)
        : null;
      if (!attributeName || LABEL_PROPS.has(attributeName)) {
        collectDisplayExpressionStrings(node.expression, add);
      }
      return;
    }
    // 5) Toast messages
    if (node.type === 'CallExpression') {
      const name = toastCalleeName(node.callee);
      if (name) {
        for (const arg of node.arguments) {
          if (arg?.type === 'StringLiteral') add(arg.value, arg, name);
        }
        return;
      }
      // 6) Already-wired tt("…") — keeps the source list stable after wiring
      if (node.callee?.type === 'Identifier' && node.callee.name === 'tt'
          && node.arguments[0]?.type === 'StringLiteral') {
        add(node.arguments[0].value, node, 'tt');
      }
    }
  });

  return hits;
}

function collectFiles() {
  const files = [];
  const walkDir = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walkDir(full);
      else if (/\.tsx?$/.test(entry) && !/\.(test|spec)\./.test(entry)) files.push(full);
    }
  };
  for (const dir of SCAN_DIRS) if (existsSync(dir)) walkDir(dir);
  return files;
}

function main() {
  const files = collectFiles();
  const byText = new Map();

  for (const file of files) {
    for (const hit of scanFile(file)) {
      const rec = byText.get(hit.text);
      if (rec) {
        rec.count += 1;
        rec.kinds.add(hit.kind);
        if (rec.refs.length < 6) {
          const ref = `${hit.ref}:${hit.line}`;
          if (!rec.refs.includes(ref)) rec.refs.push(ref);
        }
      } else {
        byText.set(hit.text, { text: hit.text, count: 1, kinds: new Set([hit.kind]), refs: [`${hit.ref}:${hit.line}`] });
      }
    }
  }

  for (const rec of byText.values()) rec.kinds = Array.from(rec.kinds).sort();
  const records = Array.from(byText.values())
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text));

  const sourceTexts = records.map((r) => r.text);
  writeFileSync(OUT_SOURCE, JSON.stringify(sourceTexts, null, 2) + '\n');
  writeFileSync(
    OUT_EN_DICTIONARY,
    JSON.stringify(Object.fromEntries(sourceTexts.map((text) => [text, text])), null, 2) + '\n',
  );

  const lines = [
    '# Hardcoded UI Strings (not in locale JSON)',
    '',
    `> Generated by \`scripts/find-hardcoded-strings.mjs\` (AST scan). Scanned ${files.length} files, found ${records.length} unique strings.`,
    '> Kinds: `jsx-text`, `attr:*`, `toast*`, `tt` (already wired).',
    '',
    '| # | String | Occurrences | Kinds | First refs |',
    '|---|--------|-------------|-------|------------|',
  ];
  records.forEach((r, i) => {
    lines.push(`| ${i + 1} | \`${r.text.replace(/\|/g, '\\|')}\` | ${r.count} | ${r.kinds.join(', ')} | ${r.refs.slice(0, 3).join(', ')} |`);
  });
  writeFileSync(OUT_REPORT, lines.join('\n') + '\n');

  const byKind = {};
  for (const r of records) for (const k of r.kinds) byKind[k] = (byKind[k] || 0) + 1;
  console.log(`Scanned ${files.length} files (AST).`);
  console.log(`Unique candidate strings: ${records.length}`);
  console.log(`By kind: ${Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  console.log(`Source list → ${OUT_SOURCE}`);
  console.log(`English dict → ${OUT_EN_DICTIONARY}`);
  console.log(`Report      → ${OUT_REPORT}`);
}

main();

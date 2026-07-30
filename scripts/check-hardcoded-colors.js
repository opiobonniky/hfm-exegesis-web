#!/usr/bin/env node

/**
 * check-hardcoded-colors.js
 *
 * Scans .tsx/.ts files for structural hardcoded color classes
 * (bg-white, slate, stone, gray) that should use CSS variables instead.
 *
 * Zero external dependencies — uses only Node.js built-ins.
 *
 * Usage:
 *   node scripts/check-hardcoded-colors.js                   # scan all files
 *   node scripts/check-hardcoded-colors.js --verbose          # show per-file context
 *   node scripts/check-hardcoded-colors.js --json             # machine-readable output
 *
 * Exit codes:
 *   0 — no structural hardcoded colors found
 *   1 — violations detected (CI-friendly)
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve, relative, extname } from "path";
import { fileURLToPath } from "url";

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src");

// Directories to scan recursively
const SCAN_DIRS = ["pages", "components"];

// Files/directories to EXCLUDE entirely (standalone brand pages)
const EXCLUDE_PATHS = [
  "pages/Landing.tsx",
  "pages/HimFirstMedia/",
  "components/PublicLayout.tsx",
  "components/trivia/",
];

// Structural hardcoded patterns that SHOULD use CSS variables.
const STRUCTURAL_PATTERNS = [
  /bg-white(?![-/])/g,
  /bg-slate-\d+/g,
  /bg-stone-\d+/g,
  /bg-gray-\d+/g,
  /border-slate-\d+/g,
  /border-stone-\d+/g,
  /border-gray-\d+/g,
  /text-slate-\d+/g,
  /text-stone-\d+/g,
  /text-gray-\d+/g,
];

// Tailwind variant prefixes — only the IMMEDIATELY preceding token is checked
const VARIANT_PREFIXES = [
  "dark:", "hover:", "focus:", "active:",
  "group-hover:", "group-focus:", "peer-",
  "motion-safe:", "motion-reduce:",
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Recursively collect .tsx/.ts files from a directory */
function collectFiles(dirPath, rootPath) {
  const results = [];
  if (!existsSync(dirPath)) return results;
  const entries = readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = resolve(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      results.push(...collectFiles(fullPath, rootPath));
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (ext === ".tsx" || ext === ".ts") {
        const rel = relative(rootPath, fullPath);
        const shouldExclude = EXCLUDE_PATHS.some(
          (p) => rel === p || rel.startsWith(p),
        );
        if (!shouldExclude) {
          results.push(fullPath);
        }
      }
    }
  }
  return results;
}

/**
 * Pre-scan a file's lines to find ranges that should be ignored:
 * - Single-line // comments
 * - Multiline /* ... * / comment blocks
 * - Lines inside <style>...</style> blocks
 */
function findIgnoredRanges(lines) {
  const ignored = new Set();

  // Single-line comments
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    // Only skip if // is at the very start (after optional whitespace)
    if (/^\/\//.test(trimmed)) {
      ignored.add(i);
    }
  }

  // Multiline /* ... */ blocks
  let inBlockComment = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inBlockComment) {
      ignored.add(i);
      const closeIdx = line.indexOf("*/");
      if (closeIdx !== -1) {
        inBlockComment = false;
        const afterClose = line.substring(closeIdx + 2);
        if (afterClose.includes("/*")) {
          inBlockComment = true;
        }
      }
    } else {
      const openIdx = line.indexOf("/*");
      if (openIdx !== -1) {
        ignored.add(i);
        const closeIdx = line.indexOf("*/", openIdx + 2);
        if (closeIdx === -1) {
          inBlockComment = true;
        }
      }
    }
  }

  // Multiline <style>...</style> blocks
  let inStyleBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inStyleBlock) {
      ignored.add(i);
      if (/<\/style>/i.test(line)) {
        inStyleBlock = false;
      }
    } else {
      if (/<style/i.test(line)) {
        ignored.add(i);
        if (!/<\/style>/i.test(line)) {
          inStyleBlock = true;
        }
      }
    }
  }

  return ignored;
}

/**
 * Extract the last CSS class token before the match position in the line.
 * Returns the token as-is (e.g. "dark:", "hover:bg-white", etc.)
 * Only considers characters that appear in Tailwind class names.
 */
function getPrecedingToken(line, matchIndex) {
  const before = line.substring(0, matchIndex);
  // Find the last space/newline before the match
  const lastSpace = before.lastIndexOf(" ");
  const lastNewline = before.lastIndexOf("\n");
  const lastTab = before.lastIndexOf("\t");
  const lastQuote = Math.max(
    before.lastIndexOf('"'),
    before.lastIndexOf("'"),
    before.lastIndexOf("`"),
  );
  const boundary = Math.max(lastSpace, lastNewline, lastTab, lastQuote, 0);
  // Extract the token right before the boundary
  const token = before.substring(boundary).trim();
  return token;
}

/** Check if a single token is a Tailwind variant (e.g. "dark:", "hover:", "focus:bg-white") */
function isVariantToken(token) {
  for (const prefix of VARIANT_PREFIXES) {
    if (token.startsWith(prefix)) return true;
  }
  return false;
}

/** Check if a class string contains a semantic color keyword */
function hasSemanticColor(className) {
  const semantic = [
    "emerald", "red", "rose", "amber", "yellow", "orange",
    "green", "teal", "cyan", "sky", "blue", "indigo",
    "violet", "purple", "fuchsia", "pink", "lime",
  ];
  for (const s of semantic) {
    if (className.includes(s)) return true;
  }
  return false;
}

/** Suggest a CSS variable replacement */
function suggestReplacement(match) {
  if (match.startsWith("bg-white")) return "bg-card";
  if (match.startsWith("bg-")) {
    const shade = parseInt(match.replace(/\D/g, ""), 10) || 0;
    if (shade <= 300) return "bg-muted";
    return "bg-card";
  }
  if (match.startsWith("border-")) return "border-border";
  if (match.startsWith("text-")) {
    const shade = parseInt(match.replace(/\D/g, ""), 10) || 0;
    if (shade >= 800) return "text-foreground";
    if (shade >= 700) return "text-foreground/80";
    if (shade >= 500) return "text-muted-foreground";
    if (shade >= 400) return "text-muted-foreground/70";
    return "text-muted-foreground/50";
  }
  return "/* see THEME_AUDIT.md */";
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

const args = process.argv.slice(2);
const isVerbose = args.includes("--verbose");
const isJson = args.includes("--json");

// Collect files
const allFiles = [];
for (const dir of SCAN_DIRS) {
  const dirPath = resolve(SRC, dir);
  allFiles.push(...collectFiles(dirPath, SRC));
}

const fileResults = [];

// Scan each file
for (const filePath of allFiles) {
  if (!existsSync(filePath)) continue;
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Pre-scan for ignored zones
  const ignoredLines = findIgnoredRanges(lines);

  const matches = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    if (ignoredLines.has(lineIdx)) continue;

    const line = lines[lineIdx];

    for (const regex of STRUCTURAL_PATTERNS) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        const matchedText = match[0];

        // Skip semantic colors
        if (hasSemanticColor(matchedText)) {
          regex.lastIndex = match.index + 1;
          continue;
        }

        // Check if the immediately preceding token is a variant prefix
        const precedingToken = getPrecedingToken(line, match.index);
        if (precedingToken && isVariantToken(precedingToken)) {
          regex.lastIndex = match.index + 1;
          continue;
        }

        matches.push({
          line: lineIdx + 1,
          column: match.index + 1,
          match: matchedText,
          suggestion: suggestReplacement(matchedText),
          context: line.trim().substring(0, 100),
        });

        regex.lastIndex = match.index + 1;
      }
    }
  }

  if (matches.length > 0) {
    fileResults.push({
      file: relative(ROOT, filePath),
      count: matches.length,
      matches,
    });
  }
}

// ─────────────────────────────────────────────
// Output
// ─────────────────────────────────────────────

const totalViolations = fileResults.reduce((sum, f) => sum + f.count, 0);
const totalFiles = fileResults.length;

if (isJson) {
  console.log(
    JSON.stringify(
      {
        scannedFiles: allFiles.length,
        filesWithViolations: totalFiles,
        totalViolations,
        violations: fileResults,
      },
      null,
      2,
    ),
  );
} else if (totalViolations === 0) {
  console.log(
    `✅ No structural hardcoded colors found across ${allFiles.length} files.`,
  );
  process.exit(0);
} else {
  console.log(
    `\n❌ Found ${totalViolations} structural hardcoded color(s) across ${totalFiles}/${allFiles.length} file(s):\n`,
  );

  for (const fileResult of fileResults) {
    console.log(`  ── ${fileResult.file} (${fileResult.count} issues) ──`);
    for (const m of fileResult.matches) {
      console.log(
        `    L${m.line}:${m.column}  ${m.match}  →  ${m.suggestion}`,
      );
      if (isVerbose) {
        console.log(`       ${m.context}`);
      }
    }
    console.log();
  }

  const tip = isVerbose
    ? ""
    : "\n  Add --verbose for context lines.\n";
  console.log(`Tip: Run with --json for machine-readable output.${tip}`);
  process.exit(1);
}

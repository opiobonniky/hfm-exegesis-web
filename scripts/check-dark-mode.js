#!/usr/bin/env node

/**
 * check-dark-mode.js
 *
 * Static dark-mode audit. Scans .tsx/.ts sources for Tailwind classes that
 * render light-only surfaces or lose accent vibrancy when `dark` mode is on:
 *
 *   1. light-surface — opaque light backgrounds, pastel gradients, or light
 *      borders (bg-white, bg-gray-100, to-amber-100, border-blue-200, …) with
 *      no `dark:` counterpart in the same class string.
 *   2. dark-text     — dark text colors (text-gray-700, text-black, …) with
 *      no `dark:` variant, which vanish on dark backgrounds.
 *   3. accent-tint   — chip/badge tints (text-{color}-600/700) missing the
 *      `dark:text-{color}-400` counterpart, which read muddy on dark surfaces.
 *
 * Known pre-existing findings live in scripts/dark-mode-baseline.json so CI
 * only fails on NEW regressions. Regenerate with --update-baseline.
 *
 * Zero external dependencies — uses only Node.js built-ins.
 *
 * Usage:
 *   node scripts/check-dark-mode.js                    # audit all files
 *   node scripts/check-dark-mode.js --verbose          # show every finding
 *   node scripts/check-dark-mode.js --json             # machine-readable output
 *   node scripts/check-dark-mode.js --update-baseline  # accept current state
 *
 * Exit codes:
 *   0 — no new violations beyond the baseline
 *   1 — new violations detected (CI-friendly)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { resolve, join, relative } from "path";
import { fileURLToPath } from "url";

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const SCAN_DIRS = ["src/features", "src/components", "src/hooks", "src/contexts", "src/pages"];
const BASELINE_PATH = resolve(__dirname, "dark-mode-baseline.json");

const EXTENSIONS = [".tsx", ".ts"];
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage", "__tests__"]);

// Class strings that are intentional in both themes (overlays on colored
// banners, translucent whites, highlight-color swatches, shadow tints).
const WHITELIST = [
  /\bbg-white\/\d+/,            // translucent white overlays (bg-white/10 …)
  /\bbg-white\b(?=.*(?:banner|hero|overlay))/i,
  /\b(?:border|ring|divide)-white(?:\/\d+)?\b/, // white hairlines on colored surfaces
  /\btext-white\b/,
  /\bbg-(?:yellow|green|blue|pink|orange)-300\b/, // highlight color swatches
  /\bring-(?:yellow|green|blue|pink|orange)-300\b/,
  /\bbg-gradient|gradient-to/, // handled per-stop; bare "gradient-to" without stops is inert
];

const RULES = [
  {
    id: "light-surface",
    // Opaque light fills & pastel gradient stops/borders (90–300 range incl. hex).
    pattern: /\b(?:bg|from|via|to|border)-(?:white|gray-(?:[1-3]00)|slate-(?:[1-3]00)|zinc-(?:[1-3]00)|stone-(?:[1-3]00)|blue-(?:[1-3]00|400)|indigo-(?:[1-3]00)|amber-(?:[1-3]00)|emerald-(?:[1-3]00)|rose-(?:[1-3]00)|sky-(?:[1-3]00)|violet-(?:[1-3]00)|teal-(?:[1-3]00)|cyan-(?:[1-3]00)|\[#(?:[ef EF])[0-9a-fA-F]{2,6}\])\b/g,
    covered: (cls, all) =>
      all.some((c) => c.startsWith("dark:") && sameProperty(c.slice(5), cls)),
  },
  {
    id: "dark-text",
    pattern: /\btext-(?:gray-(?:[6-9]00)|slate-(?:[7-9]00)|zinc-(?:[7-9]00)|stone-(?:[7-9]00)|black)\b/g,
    covered: (cls, all) =>
      all.some((c) => c.startsWith("dark:") && sameProperty(c.slice(5), cls)),
  },
  {
    id: "accent-tint",
    pattern: /\btext-(?:amber|emerald|rose|sky|violet|indigo|blue|teal|orange|pink|cyan)-(?:600|700)\b/g,
    covered: (cls, all) => {
      const m = cls.match(/text-([a-z]+)-\d00/);
      return m ? all.includes(`dark:text-${m[1]}-400`) : false;
    },
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** true when candidate styles the same CSS property family as the finding */
function sameProperty(candidate, finding) {
  const fam = (c) => {
    if (/^(bg|from|via|to)-/.test(c)) return "surface";
    if (/^border-/.test(c)) return "border";
    if (/^text-/.test(c)) return "text";
    return null;
  };
  return fam(candidate) !== null && fam(candidate) === fam(finding);
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) yield* walk(full);
    } else if (EXTENSIONS.includes(extnameSafe(entry))) {
      yield full;
    }
  }
}

function extnameSafe(name) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i);
}

function isWhitelisted(line) {
  return WHITELIST.some((rx) => rx.test(line));
}

/** class strings inside quotes (single, double, backtick) on one line */
function classStrings(line) {
  const out = [];
  const rx = /["'`]([^"'`\n]+)["'`]/g;
  let m;
  while ((m = rx.exec(line))) out.push(m[1]);
  return out;
}

function auditLine(line) {
  if (line.includes("dark:") || isWhitelisted(line)) return [];
  const findings = [];
  for (const str of classStrings(line)) {
    const classes = str.split(/\s+/);
    for (const rule of RULES) {
      for (const m of str.matchAll(rule.pattern)) {
        if (!rule.covered(m[0], classes)) {
          findings.push(`${rule.id}:${m[0]}`);
        }
      }
    }
  }
  return findings;
}

function scanFile(path) {
  const findings = [];
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const f of auditLine(line)) findings.push({ line: i + 1, finding: f });
  });
  // Dedupe identical line numbers per finding string.
  const seen = new Map();
  for (const f of findings) {
    const arr = seen.get(f.finding) ?? [];
    if (!arr.includes(f.line)) arr.push(f.line);
    seen.set(f.finding, arr);
  }
  return [...seen.entries()].flatMap(([finding, lines]) =>
    lines.map((line) => ({ line, finding })));
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const asJson = args.includes("--json");
const updateBaseline = args.includes("--update-baseline");

const results = {}; // relPath -> [{ line, finding }]
for (const dir of SCAN_DIRS) {
  const abs = resolve(ROOT, dir);
  if (!existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const rel = relative(ROOT, file).replaceAll("\\", "/");
    const findings = scanFile(file);
    if (findings.length) results[rel] = findings;
  }
}

// Flatten to stable keys: "<rel>::<rule>:<class>" (lines deduped per key)
const flat = new Map();
for (const [rel, list] of Object.entries(results)) {
  for (const { line, finding } of list) {
    const key = `${rel}::${finding}`;
    if (!flat.has(key)) flat.set(key, []);
    if (!flat.get(key).includes(line)) flat.get(key).push(line);
  }
}

let baseline = {};
if (existsSync(BASELINE_PATH)) {
  try {
    baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch {
    baseline = {};
  }
}

if (updateBaseline) {
  const accepted = {};
  for (const key of flat.keys()) {
    const [rel, finding] = key.split("::");
    (accepted[rel] ??= []).push(finding);
  }
  writeFileSync(BASELINE_PATH, JSON.stringify(accepted, null, 2) + "\n");
  console.log(`✅ Baseline updated: ${flat.size} known finding(s) in ${flat.size ? new Set([...flat.keys()].map((k) => k.split("::")[0])).size : 0} file(s).`);
  process.exit(0);
}

// Findings not accepted in the baseline = new violations.
const newViolations = [];
for (const [key, lines] of flat.entries()) {
  const [rel, finding] = key.split("::");
  const accepted = (baseline[rel] ?? []).includes(finding);
  if (!accepted) newViolations.push({ rel, finding, lines });
}

if (asJson) {
  console.log(JSON.stringify({ newViolations, totalFindings: flat.size }, null, 2));
  process.exit(newViolations.length ? 1 : 0);
}

if (flat.size === 0) {
  console.log("✅ Dark-mode audit: no findings at all.");
  process.exit(0);
}

if (newViolations.length === 0) {
  console.log(
    `✅ Dark-mode audit: ${flat.size} known finding(s) — all in baseline, no new violations.`,
  );
  process.exit(0);
}

console.log(`❌ Dark-mode audit: ${newViolations.length} NEW violation(s):\n`);
for (const v of newViolations.slice(0, 40)) {
  console.log(`  ${v.rel}  ${v.finding}  (line${v.lines.length > 1 ? `s ${v.lines.slice(0, 4).join(",")}` : ` ${v.lines[0]}`})`);
}
if (newViolations.length > 40) console.log(`  … and ${newViolations.length - 40} more`);
console.log(
  "\nAdd the matching `dark:` variant, or run --update-baseline if intentional.",
);
process.exit(1);

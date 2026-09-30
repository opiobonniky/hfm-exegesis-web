#!/usr/bin/env node
/*
 * translate-locales.mjs — Plan B locale generator (web-only, no backend).
 *
 * Translates `src/components/languages/en.json` into the other 20 locale JSON
 * files using Google Translate directly from this script, and (optionally)
 * translates hardcoded page strings (from `--hardcoded <file>`) into
 * `hardcoded.{lang}.json` dictionaries consumed by the app at runtime.
 *
 * Providers:
 *   cloud — Google Cloud Translation API v2 (recommended; reliable + clean).
 *           Requires an API key: --key <KEY> or env GOOGLE_TRANSLATE_API_KEY.
 *           The key's Cloud project must have "Cloud Translation API" enabled.
 *   gtx   — public translate_a/single endpoint (no key). Works on residential
 *           networks; Google blocks most datacenter/cloud IPs (returns a
 *           "Sorry…" page). Acceptable for a one-time local run.
 *
 * Usage:
 *   node scripts/translate-locales.mjs                          # all languages, cloud
 *   node scripts/translate-locales.mjs --provider gtx           # on your own machine
 *   node scripts/translate-locales.mjs --langs ar,de,fr
 *   node scripts/translate-locales.mjs --hardcoded docs/hardcoded-source.json
 *   node scripts/translate-locales.mjs --dry-run
 *   node scripts/translate-locales.mjs --self-check             # validate flatten/rebuild (no network)
 *
 * A language file is written ONLY when every batch for that language
 * translated successfully. Use --force to write anyway.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const LANGS_DIR = resolve(ROOT, "src/components/languages");
const EN_FILE = resolve(LANGS_DIR, "en.json");
const REPORT_FILE = resolve(ROOT, "docs/translation-generation-report.json");

const ALL_LANGS = [
  "ar", "bn", "de", "el", "es", "fil", "fr", "gu", "hi", "it", "kn",
  "ml", "mr", "ne", "pa", "pt", "ru", "sw", "ta", "te", "ur",
];

// Google's public endpoint uses `tl` for Filipino instead of `fil`.
const GTX_LANG_MAP = { fil: "tl" };

const CLOUD_V2 = "https://translation.googleapis.com/language/translate/v2";
const GTX_URL = "https://translate.googleapis.com/translate_a/single";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const SENTINEL_SEP = "\u27e6SEP\u27e7"; // token separating lines in a gtx payload
const NL_TOKEN = "\u27e6NL\u27e7"; // placeholder for real \n inside a value

// ── CLI ──────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { langs: [], provider: "cloud", key: null, hardcoded: null,
    out: LANGS_DIR, concurrency: 4, delayMs: 200, dryRun: false,
    selfCheck: false, force: false, batchSize: 0, concurrencySet: false, delaySet: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const val = () => argv[++i];
    switch (a) {
      case "--langs": args.langs = val().split(",").map((s) => s.trim()).filter(Boolean); break;
      case "--provider": args.provider = val(); break;
      case "--key": args.key = val(); break;
      case "--hardcoded": args.hardcoded = val(); break;
      case "--out": args.out = resolve(ROOT, val()); break;
      case "--concurrency": args.concurrency = Number.parseInt(val(), 10) || 4; args.concurrencySet = true; break;
      case "--delayMs": args.delayMs = Number.parseInt(val(), 10) || 0; args.delaySet = true; break;
      case "--batchSize": args.batchSize = Number.parseInt(val(), 10) || 0; break;
      case "--dry-run": args.dryRun = true; break;
      case "--self-check": args.selfCheck = true; break;
      case "--force": args.force = true; break;
      case "--help": case "-h":
        console.log(`Usage: node ${basename(process.argv[1])} [options]`);
        console.log("  --langs ar,de,fr      target languages (default: all except en)");
        console.log("  --provider cloud|gtx  translation provider (default: cloud)");
        console.log("  --key KEY             Google Cloud API key (or env GOOGLE_TRANSLATE_API_KEY)");
        console.log("  --hardcoded FILE      JSON array of page literals -> writes hardcoded.{lang}.json");
        console.log("  --out DIR             output dir (default: src/components/languages)");
        console.log("  --dry-run             report only, write nothing");
        console.log("  --self-check          verify flatten/rebuild of en.json (no network)");
        console.log("  --force               write files even if some batches failed");
        process.exit(0);
      default:
        console.error(`Unknown option: ${a}`); process.exit(2);
    }
  }
  return args;
}

// ── JSON helpers ─────────────────────────────────────────────────────────
function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function flatten(obj, prefix, out) {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out.push({ path, value: typeof value === "string" ? value : String(value) });
    }
  }
  return out;
}

function buildTree(entries) {
  const root = {};
  for (const { path, value } of entries) {
    const parts = path.split(".");
    let node = root;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (!node[p] || typeof node[p] !== "object") node[p] = {};
      node = node[p];
    }
    node[parts[parts.length - 1]] = value;
  }
  return root;
}

// ── Filtering + token protection ─────────────────────────────────────────
const NO_LETTERS = /^[^A-Za-z\u00c0-\u024f]*$/;
const ONLY_NUM_REFS = /^[\d\s:.,;()&+[\]]+$/;
// skip pure punctuation/numbers/refs → nothing useful to translate
function isSkippable(text) {
  const t = text.trim();
  if (!t) return true;
  if (NO_LETTERS.test(t)) return true;
  if (ONLY_NUM_REFS.test(t)) return true;
  // verse/url/path-like tokens
  if (/^(\d+[A-Za-z]+\d+|\/[\w./-]+|https?:|\||[A-Za-z]{1,2}\d{1,3}:\d{1,3})$/.test(t)) return true;
  return false;
}

const PLACEHOLDER_PATTERN = /\{\{[^}]+\}\}|\{[^}]{1,32}\}|%(?:[dsifru])/g;

function protectTokens(text) {
  const tokens = [];
  const protectedText = text
    .replace(/\r?\n/g, NL_TOKEN)
    .replace(PLACEHOLDER_PATTERN, (m) => {
      tokens.push(m);
      return `\u27e6${tokens.length - 1}\u27e7`;
    });
  return { text: protectedText, tokens };
}

function restoreTokens(text, tokens) {
  let out = text;
  for (let i = 0; i < tokens.length; i += 1) {
    out = out.split(`\u27e6${i}\u27e7`).join(tokens[i]);
  }
  return out.split(NL_TOKEN).join("\n");
}

function countSentinels(text) {
  return (text.match(/\u27e6\d+\u27e7/g) || []).length;
}

function placeholdersPreserved(text, tokens) {
  const required = new Map();
  for (const token of tokens) required.set(token, (required.get(token) || 0) + 1);
  for (const [token, count] of required) {
    if (text.split(token).length - 1 < count) return false;
  }
  return true;
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value, 16)));
}

// ── Providers ────────────────────────────────────────────────────────────
function cloudProvider(key) {
  return {
    name: 'cloud',
    async translateBatch(texts, lang) {
      const res = await fetch(`${CLOUD_V2}?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ q: texts, source: "en", target: lang, format: "text" }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.error?.message || `cloud ${res.status}`;
        throw new Error(msg);
      }
      return json.data.translations.map((t) => t.translatedText);
    },
  };
}

function gtxProvider() {
  async function single(texts, lang) {
    const tl = GTX_LANG_MAP[lang] || lang;
    const payload = texts.join(SENTINEL_SEP);
    const url = `${GTX_URL}?client=gtx&dt=t&sl=en&tl=${tl}&q=${encodeURIComponent(payload)}`;
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en" } });
    const text = await res.text();
    if (!res.ok || /<html/i.test(text) || /"Sorry"/i.test(text)) {
      throw new Error(`gtx blocked for ${lang} (${res.status})`);
    }
    const json = JSON.parse(text);
    const joined = (json[0] || []).map((seg) => (seg && seg[0]) || "").join("");
    const parts = joined.split(SENTINEL_SEP);
    if (parts.length !== texts.length) {
      throw new Error(`gtx split mismatch for ${lang}: ${parts.length} != ${texts.length}`);
    }
    return parts;
  }

  return {
    name: 'gtx',
    async translateBatch(texts, lang) {
      try {
        return await single(texts, lang);
      } catch {
        // fall back line-by-line
        const out = [];
        for (const t of texts) {
          const [one] = await single([t], lang);
          out.push(one);
        }
        return out;
      }
    },
  };
}

// ── Batching + retries ───────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runPool(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next;
      next += 1;
      results[i] = await tasks[i]();
    }
  }
  const n = Math.max(1, Math.min(limit, tasks.length));
  await Promise.all(Array.from({ length: n }, worker));
  return results;
}

async function translateUnique(uniqueTexts, lang, provider, args) {
  // chunk: cloud uses a count batch; gtx uses a char budget with sentinel separators
  const result = new Array(uniqueTexts.length);
  let failures = 0;

  const chunks = [];
  if (provider.name === "cloud") {
    const size = args.batchSize || 80;
    for (let i = 0; i < uniqueTexts.length; i += size) chunks.push(uniqueTexts.slice(i, i + size));
  } else {
    let cur = [];
    let len = 0;
    const budget = 3200;
    for (const t of uniqueTexts) {
      const add = t.length + 8;
      if (cur.length && len + add > budget) { chunks.push(cur); cur = []; len = 0; }
      cur.push(t); len += add;
    }
    if (cur.length) chunks.push(cur);
  }

  const tasks = chunks.map((chunk) => () => translateChunkWithRetry(chunk, lang, provider, args));

  const chunkResults = await runPool(tasks, args.concurrency);
  chunkResults.forEach((translated, ci) => {
    if (!translated) { failures += 1; return; }
    const offset = chunks.slice(0, ci).reduce((sum, chunk) => sum + chunk.length, 0);
    if (chunks[ci].length !== translated.length) {
      // cloud keeps length; gtx already enforces. Guard anyway.
      for (let i = 0; i < chunks[ci].length; i += 1) {
        const one = translated[i];
        if (one === undefined) { result[offset + i] = { ok: false }; failures += 1; }
        else result[offset + i] = { ok: true, value: one };
      }
      return;
    }
    for (let i = 0; i < chunks[ci].length; i += 1) {
      result[offset + i] = { ok: true, value: translated[i] };
    }
  });

  return { values: result.map((r) => (r && r.ok ? r.value : null)), failures };
}

async function translateChunkWithRetry(chunk, lang, provider, args) {
  const maxAttempts = 3;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const out = await provider.translateBatch(chunk, lang);
      if (args.delayMs) await sleep(args.delayMs);
      return out;
    } catch (error) {
      lastError = error;
      await sleep(800 * attempt ** 2 + Math.random() * 200);
    }
  }
  console.error(`  batch failed for ${lang}: ${lastError?.message}`);
  return null;
}

// ── Per-language corpus translation ──────────────────────────────────────
async function translateLanguage(lang, entries, skippedPaths, provider, args) {
  const entriesByPath = new Map(entries.map((e) => [e.path, e]));
  const allPaths = entries.filter((e) => !skippedPaths.has(e.path)).map((e) => e.path);

  // protect tokens
  const protectedByPath = new Map();
  const tokensByPath = new Map();
  for (const path of allPaths) {
    const { text, tokens } = protectTokens(entriesByPath.get(path).value);
    protectedByPath.set(path, text);
    tokensByPath.set(path, tokens);
  }

  // dedupe by protected text
  const uniqueToPaths = new Map();
  for (const path of allPaths) {
    const t = protectedByPath.get(path);
    if (!uniqueToPaths.has(t)) uniqueToPaths.set(t, []);
    uniqueToPaths.get(t).push(path);
  }
  const uniqueTexts = Array.from(uniqueToPaths.keys());

  const { values, failures } = await translateUnique(uniqueTexts, lang, provider, args);

  let untranslated = 0;
  let tokenFixed = 0;
  const out = new Map(); // path -> translated value
  uniqueToPaths.forEach((paths, text) => {
    const index = uniqueTexts.indexOf(text);
    for (const path of paths) {
      const translated = values[index];
      const tokens = tokensByPath.get(path);
      if (translated == null) {
        out.set(path, entriesByPath.get(path).value); // keep English fallback
        untranslated += 1;
        continue;
      }
      let restored = restoreTokens(decodeHtmlEntities(translated), tokens);
      if (countSentinels(restored) !== 0 || !placeholdersPreserved(restored, tokens)) {
        // sentinel leak → fall back to original text
        restored = entriesByPath.get(path).value;
        tokenFixed += 1;
      } else if (restored === entriesByPath.get(path).value) {
        // untouched (Google sometimes echoes the source) — keep, not a failure
      }
      out.set(path, restored);
    }
  });

  // rebuild tree preserving source order
  const translatedEntries = entries.map((e) => ({
    path: e.path,
    value: skippedPaths.has(e.path) ? e.value : (out.get(e.path) ?? e.value),
  }));
  const tree = buildTree(translatedEntries);

  return {
    lang, tree, total: entries.length, translated: entries.length - skippedPaths.size,
    skipped: skippedPaths.size, untranslated, tokenFixed, failures, ok: failures === 0 && untranslated === 0,
  };
}

// ── Hardcoded dictionaries ───────────────────────────────────────────────
async function translateHardcoded(sourceTexts, lang, provider, args) {
  const unique = Array.from(new Set(sourceTexts.filter((t) => !isSkippable(t) && t.trim())));
  const protectedUnique = unique.map((t) => protectTokens(t).text);
  const { values, failures } = await translateUnique(protectedUnique, lang, provider, args);
  const dict = {};
  unique.forEach((t, i) => {
    const tokens = protectTokens(t).tokens;
    const translated = values[i];
    if (translated == null) { dict[t] = t; return; }
    let restored = restoreTokens(decodeHtmlEntities(translated), tokens);
    if (countSentinels(restored) !== 0 || !placeholdersPreserved(restored, tokens)) restored = t;
    dict[t] = restored.trim() ? restored : t;
  });
  return { dict, failures, total: unique.length };
}

// ── Self check ───────────────────────────────────────────────────────────
async function selfCheck() {
  const en = readJson(EN_FILE);
  const entries = flatten(en, "", []);
  const rebuilt = buildTree(entries.map((e) => ({ path: e.path, value: e.value })));
  const a = JSON.stringify(en);
  const b = JSON.stringify(rebuilt);
  const ok = a === b;
  if (ok) {
    const placeholderSample = 'Hello {{name}}, {count} items cost %s.\nNext';
    const protectedSample = protectTokens(placeholderSample);
    const restoredSample = restoreTokens(protectedSample.text, protectedSample.tokens);
    if (restoredSample !== placeholderSample || !placeholdersPreserved(restoredSample, protectedSample.tokens)) {
      throw new Error('Self-check FAILED — placeholder protect/restore mismatch.');
    }

    const fakeProvider = {
      name: 'cloud',
      translateBatch: async (texts) => texts.map((text) => `translated:${text}`),
    };
    const batchSample = ['one', 'two', 'three', 'four', 'five'];
    const batchResult = await translateUnique(batchSample, 'fr', fakeProvider, {
      batchSize: 2, concurrency: 2, delayMs: 0,
    });
    if (batchResult.values.some((value, index) => value !== `translated:${batchSample[index]}`)) {
      throw new Error('Self-check FAILED — translated batches were written at the wrong offsets.');
    }

    console.log(`Self-check OK — en.json rebuild (${entries.length} leaves), placeholders, and batch offsets.`);
    return true;
  }
  console.error("Self-check FAILED — flatten/rebuild mismatch. Inspect buildTree/flatten.");
  process.exitCode = 1;
  return false;
}

// ── main ─────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const langs = args.langs.length ? args.langs : ALL_LANGS;

  if (args.selfCheck) {
    await selfCheck();
    return;
  }

  if (!existsSync(EN_FILE)) {
    console.error(`Missing ${EN_FILE}`); process.exit(1);
  }

  const provider =
    args.provider === "gtx" ? gtxProvider()
    : cloudProvider(args.key || process.env.GOOGLE_TRANSLATE_API_KEY);

  if (args.provider !== "gtx") {
    const key = args.key || process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!key) {
      console.error(
        "No Google Cloud API key.\n" +
        "  Pass --key <API_KEY> or set GOOGLE_TRANSLATE_API_KEY, e.g.:\n" +
        "    GOOGLE_TRANSLATE_API_KEY=... node scripts/translate-locales.mjs --provider cloud\n" +
        "  (The key's Cloud project must have the Cloud Translation API enabled.)\n" +
        "  Or run with --provider gtx on a machine whose IP Google does not block."
      );
      process.exit(1);
    }
    provider._key = key;
  } else {
    // The free gtx endpoint rate-limits aggressively → be polite by default.
    if (!args.concurrencySet) args.concurrency = 1;
    if (!args.delaySet) args.delayMs = 300;
  }

  const en = readJson(EN_FILE);
  const entries = flatten(en, "", []);
  const skippedPaths = new Set(entries.filter((e) => isSkippable(e.value)).map((e) => e.path));
  const translatable = entries.filter((e) => !skippedPaths.has(e.path));
  const uniqueCorpus = new Set(translatable.map((e) => protectTokens(e.value).text)).size;
  console.log(`Corpus: ${entries.length} leaf strings (${translatable.length} translatable, ~${uniqueCorpus} unique) per language × ${langs.length} languages.`);

  let hardcodedSource = [];
  if (args.hardcoded) {
    if (!existsSync(args.hardcoded)) {
      console.error(`Hardcoded source not found: ${args.hardcoded}`); process.exit(1);
    }
    hardcodedSource = JSON.parse(readFileSync(args.hardcoded, "utf8"));
    if (!Array.isArray(hardcodedSource)) { console.error("hardcoded file must be a JSON array of strings"); process.exit(1); }
    console.log(`Hardcoded: ${hardcodedSource.length} page literals to generate dictionaries for.`);
  }

  const report = { generatedAt: new Date().toISOString(), provider: args.provider, languages: {} };
  let anyFail = false;

  for (const lang of langs) {
    process.stdout.write(`Translating ${lang} … `);
    try {
      const result = await translateLanguage(lang, entries, skippedPaths, provider, args);
      const hardcoded = hardcodedSource.length
        ? await translateHardcoded(hardcodedSource, lang, provider, args)
        : null;

      report.languages[lang] = {
        total: result.total, translated: result.translated, skipped: result.skipped,
        untranslated: result.untranslated, tokenFixed: result.tokenFixed,
        batchFailures: result.failures, ok: result.ok,
        hardcoded: hardcoded ? { total: hardcoded.total, failures: hardcoded.failures } : null,
      };

      if (args.dryRun) {
        console.log(`ok=${result.ok}, translated=${result.translated}/${result.total}, batchFail=${result.failures}`);
        continue;
      }

      if (!result.ok && !args.force) {
        console.log(`FAILED (${result.failures} batches, ${result.untranslated} strings) — not writing. Use --force to write anyway.`);
        anyFail = true;
        continue;
      }

      writeFileSync(resolve(args.out, `${lang}.json`), JSON.stringify(treeToSorted(result.tree), null, 2) + "\n");
      console.log(`ok (${result.translated}/${result.total}; batchFail=${result.failures})`);

      if (hardcoded) {
        if (hardcoded.failures === 0 || args.force) {
          writeFileSync(resolve(args.out, `hardcoded.${lang}.json`), JSON.stringify(hardcoded.dict, null, 2) + "\n");
        }
      }
    } catch (error) {
      console.log(`ERROR: ${error.message}`);
      anyFail = true;
    }
  }

  // en identity dict for the runtime merge
  if (!args.dryRun && hardcodedSource.length) {
    const enDict = Object.fromEntries(hardcodedSource.map((t) => [t, t]));
    writeFileSync(resolve(args.out, "hardcoded.en.json"), JSON.stringify(enDict, null, 2) + "\n");
  }

  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2) + "\n");
  console.log(`\nReport: ${REPORT_FILE}`);
  if (anyFail) { console.error("Some languages failed; see report. Run with --force to write partial results, or fix keys and re-run."); process.exitCode = 1; }
}

function treeToSorted(tree) {
  // JSON.stringify preserves insertion order; insertion order == source order by build
  return tree;
}

main().catch((error) => { console.error(error); process.exit(1); });

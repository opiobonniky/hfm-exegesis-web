#!/usr/bin/env node
/* Validate Plan B output after the Google translation run. */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LANG_DIR = resolve(ROOT, 'src/components/languages');
const REPORT_FILE = resolve(ROOT, 'docs/translation-generation-report.json');
const SOURCE_FILE = resolve(ROOT, 'docs/hardcoded-source.json');
const LANGS = [
  'ar', 'bn', 'de', 'el', 'es', 'fil', 'fr', 'gu', 'hi', 'it', 'kn',
  'ml', 'mr', 'ne', 'pa', 'pt', 'ru', 'sw', 'ta', 'te', 'ur',
];

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

function flatten(obj, prefix = '', out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) flatten(value, path, out);
    else out.set(path, typeof value === 'string' ? value : String(value));
  }
  return out;
}

function placeholders(text) {
  return (text.match(/\{\{[^}]+\}\}|\{[^}]{1,32}\}|%(?:[dsifru])/g) || []).sort();
}

function sameArray(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function main() {
  const errors = [];
  const warnings = [];
  const en = flatten(readJson(resolve(LANG_DIR, 'en.json')));
  const hardcodedSource = readJson(SOURCE_FILE);
  const expectedHardcoded = new Set(hardcodedSource);

  for (const lang of LANGS) {
    const localeFile = resolve(LANG_DIR, `${lang}.json`);
    const hardcodedFile = resolve(LANG_DIR, `hardcoded.${lang}.json`);

    if (!existsSync(localeFile)) {
      errors.push(`${lang}: missing ${lang}.json`);
      continue;
    }
    const locale = flatten(readJson(localeFile));
    const missingPaths = [...en.keys()].filter((path) => !locale.has(path));
    const extraPaths = [...locale.keys()].filter((path) => !en.has(path));
    if (missingPaths.length || extraPaths.length) {
      errors.push(`${lang}: locale structure mismatch (missing=${missingPaths.length}, extra=${extraPaths.length})`);
    }

    let unchanged = 0;
    let compared = 0;
    for (const [path, english] of en) {
      const translated = locale.get(path);
      if (translated === undefined) continue;
      compared += 1;
      if (!translated.trim()) errors.push(`${lang}: blank locale value at ${path}`);
      if (translated === english && /[A-Za-z]{2}/.test(english)) unchanged += 1;
      if (!sameArray(placeholders(english), placeholders(translated))) {
        errors.push(`${lang}: placeholder mismatch at ${path}`);
      }
    }
    const unchangedPct = compared ? Math.round((unchanged / compared) * 100) : 100;
    if (unchangedPct > 40) errors.push(`${lang}: ${unchangedPct}% of locale values still equal English`);
    else if (unchangedPct > 25) warnings.push(`${lang}: ${unchangedPct}% of locale values equal English; review sample`);

    if (!existsSync(hardcodedFile)) {
      errors.push(`${lang}: missing hardcoded.${lang}.json`);
      continue;
    }
    const dict = readJson(hardcodedFile);
    const dictKeys = new Set(Object.keys(dict));
    const missingKeys = [...expectedHardcoded].filter((key) => !dictKeys.has(key));
    const extraKeys = [...dictKeys].filter((key) => !expectedHardcoded.has(key));
    if (missingKeys.length || extraKeys.length) {
      errors.push(`${lang}: hardcoded dictionary mismatch (missing=${missingKeys.length}, extra=${extraKeys.length})`);
    }

    let hardcodedUnchanged = 0;
    for (const source of hardcodedSource) {
      const translated = dict[source];
      if (typeof translated !== 'string' || !translated.trim()) {
        errors.push(`${lang}: missing/blank hardcoded translation for ${JSON.stringify(source)}`);
        continue;
      }
      if (translated === source && /[A-Za-z]{2}/.test(source)) hardcodedUnchanged += 1;
      if (!sameArray(placeholders(source), placeholders(translated))) {
        errors.push(`${lang}: hardcoded placeholder mismatch for ${JSON.stringify(source)}`);
      }
    }
    const hardcodedPct = Math.round((hardcodedUnchanged / hardcodedSource.length) * 100);
    if (hardcodedPct > 40) errors.push(`${lang}: ${hardcodedPct}% of hardcoded strings still equal English`);
    else if (hardcodedPct > 25) warnings.push(`${lang}: ${hardcodedPct}% of hardcoded strings equal English; review sample`);

    console.log(`${lang}: locale=${locale.size}/${en.size}, hardcoded=${dictKeys.size}/${expectedHardcoded.size}, unchanged=${unchangedPct}%/${hardcodedPct}%`);
  }

  if (!existsSync(REPORT_FILE)) {
    errors.push('missing docs/translation-generation-report.json');
  } else {
    const report = readJson(REPORT_FILE);
    if (!['cloud', 'gtx'].includes(report.provider)) errors.push(`unexpected provider in report: ${report.provider}`);
    for (const lang of LANGS) {
      const result = report.languages?.[lang];
      if (!result) errors.push(`${lang}: missing from generation report`);
      else if (!result.ok || result.batchFailures || result.untranslated || result.hardcoded?.failures) {
        errors.push(`${lang}: generation report contains failures`);
      }
    }
  }

  for (const warning of warnings) console.warn(`WARN: ${warning}`);
  if (errors.length) {
    for (const error of errors.slice(0, 100)) console.error(`ERROR: ${error}`);
    if (errors.length > 100) console.error(`ERROR: ...and ${errors.length - 100} more`);
    console.error(`\nTranslation validation failed with ${errors.length} error(s).`);
    process.exit(1);
  }
  console.log(`\nTranslation validation passed: ${LANGS.length} locales, ${en.size} JSON leaves, ${expectedHardcoded.size} hardcoded strings.`);
}

main();

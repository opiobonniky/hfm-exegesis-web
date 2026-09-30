import { SUPPORTED_LANGUAGES, type Language } from './type';

/**
 * Hardcoded page-literal translation.
 *
 * `scripts/find-hardcoded-strings.mjs` finds English strings that are written
 * directly in pages/components (not in the locale JSON). They are translated by
 * `scripts/translate-locales.mjs` into `hardcoded.{lang}.json` dictionaries,
 * which are consumed here:
 *
 *   <Button>{tt("Learn More")}</Button>
 *   <Input placeholder={tt("Select book...")} />
 *   toast.success(tt("Verse copied"));
 *
 * This is a plain module function (not a hook) so it can be used in components,
 * helpers, and module scope without rules-of-hooks concerns. `LanguageProvider`
 * keeps the module in sync with the active language.
 */

/** Text → translation lookups keyed by language code. */
const HARDCODED_MODULES = import.meta.glob<Record<string, string>>(
  './hardcoded.*.json',
  { eager: true, import: 'default' },
);

const LOCALE_MODULES = import.meta.glob<Record<string, unknown>>(
  './*.json',
  { eager: true, import: 'default' },
);

const DICTIONARIES: Record<string, Record<string, string>> = Object.entries(HARDCODED_MODULES)
  .reduce<Record<string, Record<string, string>>>((acc, [path, dict]) => {
    const match = path.match(/hardcoded\.([a-z]{2,3})\.json$/);
    if (match) acc[match[1]] = dict;
    return acc;
  }, {});

function flattenStrings(
  value: Record<string, unknown>,
  prefix = '',
  output: Record<string, string> = {},
): Record<string, string> {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      flattenStrings(child as Record<string, unknown>, path, output);
    } else if (typeof child === 'string') {
      output[path] = child;
    }
  }
  return output;
}

function placeholders(text: string): string[] {
  return (text.match(/\{\{[^}]+\}\}|\{[^}]{1,32}\}|%(?:[dsifru])/g) ?? []).sort();
}

function isSafeFallback(source: string, translated: string): boolean {
  if (!translated.trim() || translated === source) return false;
  if (placeholders(source).join('|') !== placeholders(translated).join('|')) return false;
  const ratio = translated.length / Math.max(source.length, 1);
  return ratio >= 0.3 && ratio <= 2.2;
}

/**
 * Emergency fallback for locales generated before hardcoded dictionaries were
 * introduced. It reverses matching en.json/fr.json paths into English-text →
 * translated-text lookups, while rejecting structurally suspicious values.
 */
const LOCALE_FALLBACKS: Record<string, Record<string, string>> = (() => {
  const locales: Record<string, Record<string, unknown>> = {};
  for (const [path, locale] of Object.entries(LOCALE_MODULES)) {
    const match = path.match(/\/([a-z]{2,3})\.json$/);
    if (match) locales[match[1]] = locale;
  }

  const english = locales.en ? flattenStrings(locales.en) : {};
  const fallbacks: Record<string, Record<string, string>> = {};
  for (const [lang, locale] of Object.entries(locales)) {
    if (lang === 'en') continue;
    const translated = flattenStrings(locale);
    const candidates = new Map<string, Map<string, number>>();
    for (const [path, source] of Object.entries(english)) {
      const target = translated[path];
      if (!target || !isSafeFallback(source, target)) continue;
      const translations = candidates.get(source) ?? new Map<string, number>();
      translations.set(target, (translations.get(target) ?? 0) + 1);
      candidates.set(source, translations);
    }

    fallbacks[lang] = {};
    for (const [source, translations] of candidates) {
      const best = [...translations.entries()].sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return Math.abs(a[0].length / source.length - 1)
          - Math.abs(b[0].length / source.length - 1);
      })[0]?.[0];
      if (best) fallbacks[lang][source] = best;
    }
  }
  return fallbacks;
})();

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem('exegesis-language');
    if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
      return stored as Language;
    }
  } catch { /* localStorage unavailable */ }

  if (typeof navigator !== 'undefined') {
    const browserLanguage = navigator.language?.split('-')[0] ?? '';
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(browserLanguage)) {
      return browserLanguage as Language;
    }
  }
  return 'en';
}

/** Active language for module-scope lookups (kept in sync by LanguageProvider). */
let currentLanguage: Language = getInitialLanguage();

/** Point module-scope `tt` at a language. Called by LanguageProvider on every render. */
export function setRuntimeLanguage(lang: Language): void {
  currentLanguage = lang;
}

/**
 * Translate a hardcoded page literal. Falls back to the original text when no
 * translation exists for the active language.
 */
export function tt(text: string): string {
  return DICTIONARIES[currentLanguage]?.[text]
    ?? LOCALE_FALLBACKS[currentLanguage]?.[text]
    ?? text;
}

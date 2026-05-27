import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language, Translations } from './type';
import { isRtlLanguage } from './localeUtils';
import en from './en.json';

/** Storage key for persisting language preference */
const STORAGE_KEY = 'exegesis-language';

/** Safe deep clone — falls back to JSON round-trip when structuredClone is unavailable */
function deepClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
}

/** Shape of the language context */
interface LanguageContextType {
  /** Current active language code */
  lang: Language;
  /** All translation strings for the active language */
  t: Translations;
  /** Whether the active language is RTL */
  isRtl: boolean;
  /** Whether a new translation is currently loading */
  isLoading: boolean;
  /** Switch to a different language (loads its JSON on the fly) */
  setLanguage: (lang: Language) => Promise<void>;
  /** List of all supported language codes */
  supportedLanguages: Language[];
  /** Progress info for each language */
  translationProgress: Record<Language, number>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

/** Attempt to read a persisted language, falling back to browser preference or English */
function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored as Language;
  } catch { /* localStorage unavailable */ }

  // Respect browser language preference
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.split('-')[0] ?? '';
    const supported = ['en','ar','de','fr','es','pt','hi','bn','ta','te','mr','gu','kn','ml','pa','ur','sw','it','el','ru','ne','fil'];
    if (supported.includes(browserLang)) return browserLang as Language;
  }

  return 'en';
}

/**
 * Recursive deep-merge. Later sources override earlier ones.
 * Only merges plain objects; arrays and primitives are replaced.
 */
function deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
  const output = { ...target };
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(source) as (keyof T)[]) {
      const val = source[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        output[key] = deepMerge(
          (output[key] as Record<string, unknown>) ?? {},
          val as Record<string, unknown>,
        ) as T[keyof T];
      } else if (val !== undefined) {
        output[key] = val as T[keyof T];
      }
    }
  }
  return output;
}

/** Preload a translation JSON file, falling back to English on error */
async function loadTranslation(lang: Language): Promise<Translations> {
  if (lang === 'en') return en as unknown as Translations;

  try {
    const mod = await import(`./${lang}.json`);
    // Merge so any missing keys fall back to English
    return deepMerge(
      deepClone(en) as unknown as Record<string, unknown>,
      mod.default as Record<string, unknown>,
    ) as unknown as Translations;
  } catch (err) {
    console.warn(`[LanguageProvider] Failed to load "${lang}" translations:`, err);
    return en as unknown as Translations;
  }
}

interface Props {
  children: ReactNode;
}

const SUPPORTED_LANGUAGES: Language[] = [
  'en','ar','de','fr','es','pt',
  'hi','bn','ta','te','mr','gu','kn','ml','pa','ur',
  'sw','it','el','ru','ne','fil',
];

export const LanguageProvider: React.FC<Props> = ({ children }) => {
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const [t, setT] = useState<Translations>(en as unknown as Translations);
  const [isLoading, setIsLoading] = useState(false);
  const [progress] = useState<Record<Language, number>>(() => {
    const p = { en: 100 } as Record<Language, number>;
    return p;
  });

  const isRtl = isRtlLanguage(lang);

  const setLanguage = useCallback(async (newLang: Language) => {
    if (newLang === lang) return;
    setIsLoading(true);
    try {
      const translations = await loadTranslation(newLang);
      setLang(newLang);
      setT(translations);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch { /* ignore */ }

      // Update the <html> dir and lang attributes for RTL support
      document.documentElement.lang = newLang;
      document.documentElement.dir = isRtlLanguage(newLang) ? 'rtl' : 'ltr';
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  // Load translations for the initial language (if non-English) on mount
  useEffect(() => {
    const initLang = lang;
    if (initLang !== 'en') {
      loadTranslation(initLang).then((translations) => {
        setT(translations);
      });
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t,
        isRtl,
        isLoading,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        translationProgress: progress,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

/** Hook to access translations and language controls */
export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('[useLanguage] Must be used within a <LanguageProvider>');
  }
  return ctx;
};

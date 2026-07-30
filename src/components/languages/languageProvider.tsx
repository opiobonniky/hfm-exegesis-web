import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Language, Translations } from './type';
import { isRtlLanguage } from './localeUtils';
import en from './en.json';
import ar from './ar.json';
import bn from './bn.json';
import de from './de.json';
import el from './el.json';
import es from './es.json';
import fil from './fil.json';
import fr from './fr.json';
import gu from './gu.json';
import hi from './hi.json';
import it from './it.json';
import kn from './kn.json';
import ml from './ml.json';
import mr from './mr.json';
import ne from './ne.json';
import pa from './pa.json';
import pt from './pt.json';
import ru from './ru.json';
import sw from './sw.json';
import ta from './ta.json';
import te from './te.json';
import ur from './ur.json';

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
  /** Whether a new translation is currently loading (always false with static imports) */
  isLoading: boolean;
  /** Switch to a different language */
  setLanguage: (lang: Language) => Promise<void>;
  /** List of all supported language codes */
  supportedLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

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

/** All translations keyed by language code — statically imported at build time.
 *  Each non-English translation is merged with English so missing keys fall back gracefully. */
const ALL_TRANSLATIONS: Record<Language, Translations> = {
  en: en as unknown as Translations,
  ar: deepMerge(deepClone(en) as unknown as Record<string, unknown>, ar as unknown as Record<string, unknown>) as unknown as Translations,
  bn: deepMerge(deepClone(en) as unknown as Record<string, unknown>, bn as unknown as Record<string, unknown>) as unknown as Translations,
  de: deepMerge(deepClone(en) as unknown as Record<string, unknown>, de as unknown as Record<string, unknown>) as unknown as Translations,
  el: deepMerge(deepClone(en) as unknown as Record<string, unknown>, el as unknown as Record<string, unknown>) as unknown as Translations,
  es: deepMerge(deepClone(en) as unknown as Record<string, unknown>, es as unknown as Record<string, unknown>) as unknown as Translations,
  fil: deepMerge(deepClone(en) as unknown as Record<string, unknown>, fil as unknown as Record<string, unknown>) as unknown as Translations,
  fr: deepMerge(deepClone(en) as unknown as Record<string, unknown>, fr as unknown as Record<string, unknown>) as unknown as Translations,
  gu: deepMerge(deepClone(en) as unknown as Record<string, unknown>, gu as unknown as Record<string, unknown>) as unknown as Translations,
  hi: deepMerge(deepClone(en) as unknown as Record<string, unknown>, hi as unknown as Record<string, unknown>) as unknown as Translations,
  it: deepMerge(deepClone(en) as unknown as Record<string, unknown>, it as unknown as Record<string, unknown>) as unknown as Translations,
  kn: deepMerge(deepClone(en) as unknown as Record<string, unknown>, kn as unknown as Record<string, unknown>) as unknown as Translations,
  ml: deepMerge(deepClone(en) as unknown as Record<string, unknown>, ml as unknown as Record<string, unknown>) as unknown as Translations,
  mr: deepMerge(deepClone(en) as unknown as Record<string, unknown>, mr as unknown as Record<string, unknown>) as unknown as Translations,
  ne: deepMerge(deepClone(en) as unknown as Record<string, unknown>, ne as unknown as Record<string, unknown>) as unknown as Translations,
  pa: deepMerge(deepClone(en) as unknown as Record<string, unknown>, pa as unknown as Record<string, unknown>) as unknown as Translations,
  pt: deepMerge(deepClone(en) as unknown as Record<string, unknown>, pt as unknown as Record<string, unknown>) as unknown as Translations,
  ru: deepMerge(deepClone(en) as unknown as Record<string, unknown>, ru as unknown as Record<string, unknown>) as unknown as Translations,
  sw: deepMerge(deepClone(en) as unknown as Record<string, unknown>, sw as unknown as Record<string, unknown>) as unknown as Translations,
  ta: deepMerge(deepClone(en) as unknown as Record<string, unknown>, ta as unknown as Record<string, unknown>) as unknown as Translations,
  te: deepMerge(deepClone(en) as unknown as Record<string, unknown>, te as unknown as Record<string, unknown>) as unknown as Translations,
  ur: deepMerge(deepClone(en) as unknown as Record<string, unknown>, ur as unknown as Record<string, unknown>) as unknown as Translations,
};

/** Attempt to read a persisted language, falling back to browser preference or English */
function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored as Language;
  } catch { /* localStorage unavailable */ }

  // Respect browser language preference
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.split('-')[0] ?? '';
    const supported = Object.keys(ALL_TRANSLATIONS) as Language[];
    if ((supported as string[]).includes(browserLang)) return browserLang as Language;
  }

  return 'en';
}

const INITIAL_LANG = getInitialLanguage();

interface Props {
  children: ReactNode;
}

const SUPPORTED_LANGUAGES = Object.keys(ALL_TRANSLATIONS) as Language[];

export const LanguageProvider: React.FC<Props> = ({ children }) => {
  const [lang, setLang] = useState<Language>(INITIAL_LANG);
  const [t, setT] = useState<Translations>(ALL_TRANSLATIONS[INITIAL_LANG]);

  const isRtl = isRtlLanguage(lang);

  const setLanguage = useCallback(async (newLang: Language) => {
    if (newLang === lang) return;
    setLang(newLang);
    setT(ALL_TRANSLATIONS[newLang]);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch { /* ignore */ }

    // Update the <html> dir and lang attributes for RTL support
    document.documentElement.lang = newLang;
    document.documentElement.dir = isRtlLanguage(newLang) ? 'rtl' : 'ltr';
  }, [lang]);

  // Initialize <html> attributes on mount for the stored/browser language
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({
    lang,
    t,
    isRtl,
    isLoading: false,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }), [lang, t, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
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

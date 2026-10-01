import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  SUPPORTED_LANGUAGES as SUPPORTED_LANGUAGE_CODES,
  type Language,
  type Translations,
} from './type';
import { isRtlLanguage } from './localeUtils';
import en from './en.json';
import { tt } from './hardcodedTranslate';
import {
  applyGoogleLanguage,
  GOOGLE_TRANSLATE_ELEMENT_ID,
  loadGoogleTranslate,
} from './googleTranslate';

const STORAGE_KEY = 'exegesis-language';
const ENGLISH_TRANSLATIONS = en as unknown as Translations;
const SUPPORTED_LANGUAGES = [...SUPPORTED_LANGUAGE_CODES];

interface LanguageContextType {
  lang: Language;
  /** English source strings; Google Translate Element translates the rendered DOM. */
  t: Translations;
  isRtl: boolean;
  isLoading: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  supportedLanguages: Language[];
  tt: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function isSupportedLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(value);
}

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isSupportedLanguage(stored)) return stored;
  } catch { /* localStorage unavailable */ }

  if (typeof navigator !== 'undefined') {
    const browserLanguage = navigator.language?.split('-')[0] ?? '';
    if (isSupportedLanguage(browserLanguage)) return browserLanguage;
  }
  return 'en';
}

interface Props {
  children: ReactNode;
}

export const LanguageProvider: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState(lang !== 'en');
  const isRtl = isRtlLanguage(lang);

  const syncGoogleLanguage = useCallback((target: Language) => {
    // Google creates its selector asynchronously; retry briefly for route and
    // Suspense-rendered content without exposing its default UI.
    [0, 150, 500, 1200].forEach((delay) => {
      window.setTimeout(() => applyGoogleLanguage(target), delay);
    });
  }, []);

  useEffect(() => {
    let active = true;
    loadGoogleTranslate(lang)
      .then(() => {
        if (!active) return;
        syncGoogleLanguage(lang);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('[Google Translate]', error);
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [lang, syncGoogleLanguage]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    syncGoogleLanguage(lang);
  }, [lang, isRtl, location.pathname, syncGoogleLanguage]);

  const setLanguage = useCallback(async (newLang: Language) => {
    if (newLang === lang) return;
    setIsLoading(true);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch { /* localStorage unavailable */ }
    setLang(newLang);

    // The widget has no selectable English option. Clear its cookie, then
    // reload once so Google-mutated DOM is replaced by React's English source.
    if (newLang === 'en') {
      applyGoogleLanguage('en');
      window.location.reload();
      return;
    }

    await loadGoogleTranslate(newLang).catch(() => undefined);
    syncGoogleLanguage(newLang);
    window.setTimeout(() => setIsLoading(false), 500);
  }, [lang, syncGoogleLanguage]);

  const value = useMemo<LanguageContextType>(() => ({
    lang,
    t: ENGLISH_TRANSLATIONS,
    isRtl,
    isLoading,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    tt,
  }), [lang, isRtl, isLoading, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      <div id={GOOGLE_TRANSLATE_ELEMENT_ID} aria-hidden="true" />
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('[useLanguage] Must be used within a <LanguageProvider>');
  return ctx;
};

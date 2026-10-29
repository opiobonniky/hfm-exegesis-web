import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
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
import { getPublicPackState, subscribePublicPacks, syncPublicPack, getPackedUiDictionary } from '@/services/publicReadingPacks';
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
  /** Installed authored copy, with English fallback for uncovered strings. */
  t: Translations;
  isRtl: boolean;
  isLoading: boolean;
  translationError: string | null;
  retryTranslation: () => void;
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
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const timers = useRef<number[]>([]);
  const googleStarted = useRef(false);
  const isRtl = isRtlLanguage(lang);
  const uiState = useSyncExternalStore(subscribePublicPacks, () => getPublicPackState('ui', lang));
  const installed = !!uiState.pack;
  const translations = useMemo(() => {
    const dictionary = getPackedUiDictionary(lang);
    const localize = (value: unknown): unknown => {
      if (typeof value === 'string') return dictionary.get(value) ?? value;
      if (Array.isArray(value)) return value.map(localize);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, text]) => [key, localize(text)]));
      return value;
    };
    return localize(ENGLISH_TRANSLATIONS) as Translations;
  }, [lang, uiState]);

  useEffect(() => {
    // UI copy is intentionally downloadable before login/guest entry.
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage disabled */ }
    void syncPublicPack('ui', lang, attempt > 0);
    const retry = () => { void syncPublicPack('ui', lang, true); };
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [lang, attempt]);

  const syncGoogleLanguage = useCallback((target: Language) => {
    // Google creates its selector asynchronously; retry briefly for route and
    // Suspense-rendered content without exposing its default UI.
    timers.current.forEach(window.clearTimeout);
    timers.current = [0, 150, 500, 1200].map((delay) =>
      window.setTimeout(() => applyGoogleLanguage(target), delay));
  }, []);

  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);

  useEffect(() => {
    let active = true;
    setTranslationError(null);
    if (installed) {
      timers.current.forEach(window.clearTimeout);
      applyGoogleLanguage('en');
      // Google mutates text nodes outside React. Recover a clean tree once when
      // an online fallback session upgrades to installed, React-owned copy.
      if (googleStarted.current) window.location.reload();
      setIsLoading(false);
      return;
    }
    if (lang === 'en') {
      applyGoogleLanguage('en');
      setIsLoading(false);
      return;
    }
    if (uiState.stage !== 'failed') return;
    setIsLoading(true);
    loadGoogleTranslate(lang)
      .then(() => {
        if (!active) return;
        googleStarted.current = true;
        syncGoogleLanguage(lang);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('[Google Translate]', error);
        if (active) {
          setIsLoading(false);
          setTranslationError('Translation is temporarily unavailable.');
        }
      });
    return () => { active = false; };
  }, [lang, attempt, syncGoogleLanguage, installed, uiState.stage]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    if (!installed && uiState.stage === 'failed') syncGoogleLanguage(lang);
  }, [lang, isRtl, location.pathname, syncGoogleLanguage, installed, uiState.stage]);

  const setLanguage = useCallback(async (newLang: Language) => {
    if (newLang === lang) return;
    setIsLoading(true);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch { /* localStorage unavailable */ }
    setLang(newLang);

    // The widget has no selectable English option. Clear its cookie, then
    // reload once so Google-mutated DOM is replaced by React's English source.
    if (newLang === 'en' || installed) {
      applyGoogleLanguage('en');
      window.location.reload();
      return;
    }

  }, [lang, installed]);

  const retryTranslation = useCallback(() => setAttempt(value => value + 1), []);

  const value = useMemo<LanguageContextType>(() => ({
    lang,
    t: translations,
    isRtl,
    isLoading,
    translationError,
    retryTranslation,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    tt,
  }), [lang, translations, isRtl, isLoading, translationError, retryTranslation, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      <div id={GOOGLE_TRANSLATE_ELEMENT_ID} aria-hidden="true" />
      {translationError && (
        <div role="status" className="border-b border-border bg-background px-4 py-2 text-center text-sm text-foreground">
          <span>{translationError}</span>{' '}
          <button type="button" onClick={retryTranslation} className="font-semibold underline">Retry translation</button>
        </div>
      )}
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('[useLanguage] Must be used within a <LanguageProvider>');
  return ctx;
};

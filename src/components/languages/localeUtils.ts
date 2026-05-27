import type { Language } from './type';
import { RTL_LANGUAGES } from './type';


/** Returns true if the language uses a right-to-left writing system. */
export const isRtlLanguage = (lang: Language): boolean =>
  RTL_LANGUAGES.includes(lang);

/** Returns the corresponding Intl locale string for a Language code. */
export const getLocale = (lang: Language): string => {
  const localeMap: Partial<Record<Language, string>> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-SA',
    de: 'de-DE',
    pt: 'pt-PT',
    hi: 'hi-IN',
    bn: 'bn-BD',
    ta: 'ta-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    ur: 'ur-PK',
    sw: 'sw-KE',
    it: 'it-IT',
    el: 'el-GR',
    ru: 'ru-RU',
    ne: 'ne-NP',
    fil: 'fil-PH',
  };
  return localeMap[lang] || 'en-US';
};

/** Format a Date according to the active language's locale */
export const formatDate = (
  date: Date | string | number,
  lang: Language,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(getLocale(lang), options).format(d);
};

/** Format a number according to the active language's locale */
export const formatNumber = (
  num: number,
  lang: Language,
  options?: Intl.NumberFormatOptions,
): string => {
  return new Intl.NumberFormat(getLocale(lang), options).format(num);
};

/** Format a date as a relative string (e.g. "3 days ago") */
export const formatRelativeTime = (
  date: Date | string | number,
  lang: Language,
): string => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(getLocale(lang), { numeric: 'auto' });

  if (diffSeconds < 60) return rtf.format(-diffSeconds, 'second');
  if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute');
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  if (diffDays < 7) return rtf.format(-diffDays, 'day');
  if (diffWeeks < 5) return rtf.format(-diffWeeks, 'week');
  if (diffMonths < 12) return rtf.format(-diffMonths, 'month');
  return rtf.format(-diffYears, 'year');
};

/** Human-readable language name (translated into the active language where applicable) */
export const getLanguageName = (lang: Language, displayLang: Language): string => {
  try {
    return new Intl.DisplayNames([getLocale(displayLang)], { type: 'language' }).of(lang) ?? lang;
  } catch {
    return lang;
  }
};

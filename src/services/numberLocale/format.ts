import bundled from './number-locales.json';

export interface NumberLocale {
  schemaVersion: 1;
  language: string;
  locale: string;
  numberingSystem: string;
  digits: string;
  revision?: string;
}

const overrides = new Map<string, NumberLocale>();
let activeLanguage = 'en';

/** Set the app language. Display only; never use this for API values. */
export const setDisplayLanguage = (language: string) => { activeLanguage = language; };
export const getDisplayLanguage = () => activeLanguage;

const hasLanguage = (language: string): language is keyof typeof bundled =>
  Object.prototype.hasOwnProperty.call(bundled, language);

export function getNumberLocale(language = activeLanguage): NumberLocale {
  const selected = hasLanguage(language) ? language : 'en';
  const [locale, numberingSystem, digits] = bundled[selected];
  return overrides.get(selected) || { schemaVersion: 1, language: selected, locale, numberingSystem, digits };
}

export function validNumberLocale(value: unknown, language: string): value is NumberLocale {
  const pack = value as NumberLocale | undefined;
  // A remote update cannot turn display mappings into arbitrary text. Only the
  // exact reviewed mapping for this language can be installed.
  const source = hasLanguage(language) ? bundled[language] : undefined;
  return !!pack && !!source && pack.schemaVersion === 1 && pack.language === language &&
    pack.locale === source[0] && pack.numberingSystem === source[1] && pack.digits === source[2] &&
    Array.from(pack.digits).length === 10 && new Set(Array.from(pack.digits)).size === 10;
}

export const installNumberLocale = (pack: NumberLocale) => {
  if (validNumberLocale(pack, pack.language)) overrides.set(pack.language, pack);
};

const digitSets = [...new Set(Object.values(bundled).map(item => item[2]))];
const reverseDigits = new Map<string, string>(
  digitSets.flatMap(digits => Array.from(digits).map((digit, index) => [digit, String(index)] as const)),
);

/** Presentation only. Never feed the result back into an API/parser. */
export function displayDigits(value: string | number, language = activeLanguage): string {
  const digits = Array.from(getNumberLocale(language).digits);
  return Array.from(String(value), char => {
    const index = reverseDigits.get(char);
    return index === undefined ? char : digits[Number(index)];
  }).join('');
}

// Keep technical segments verbatim even when they appear beside UI copy.
const technical = /(?:https?:\/\/|exegesis:\/\/|www\.)[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\b[GH]\d+\b|\b(?:sk|pk|price|prod|cus|sub)_[A-Za-z0-9_]+\b/gi;

export function displayUiText(value: string | number, language = activeLanguage): string {
  const text = String(value);
  let start = 0;
  let result = '';
  for (const match of text.matchAll(technical)) {
    result += displayDigits(text.slice(start, match.index), language) + match[0];
    start = match.index! + match[0].length;
  }
  return result + displayDigits(text.slice(start), language);
}

export function displayNumber(
  value: number,
  language = activeLanguage,
  options: Intl.NumberFormatOptions = {},
): string {
  const config = getNumberLocale(language);
  try {
    return displayDigits(new Intl.NumberFormat(config.locale, { ...options, numberingSystem: config.numberingSystem }).format(value), language);
  } catch {
    try {
      // Engines without the numberingSystem option still get localized digits.
      return displayDigits(new Intl.NumberFormat(config.locale, options).format(value), language);
    } catch {
      return displayDigits(value, language);
    }
  }
}

export function displayDate(
  value: Date | string | number,
  language = activeLanguage,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  const config = getNumberLocale(language);
  try {
    if (!Intl.DateTimeFormat.supportedLocalesOf([config.locale]).length) throw new Error('Unsupported locale');
    return displayDigits(new Intl.DateTimeFormat(config.locale, { calendar: 'gregory', ...options, numberingSystem: config.numberingSystem }).format(date), language);
  } catch {
    if (options.month && !options.day && !options.year && !options.weekday) return displayDigits(date.getMonth() + 1, language);
    if (options.year && !options.day && !options.month && !options.weekday) return displayDigits(date.getFullYear(), language);
    return displayDigits(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, language);
  }
}

export function displayTime(
  value: Date | string | number,
  language = activeLanguage,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  const config = getNumberLocale(language);
  try {
    if (!Intl.DateTimeFormat.supportedLocalesOf([config.locale]).length) throw new Error('Unsupported locale');
    return displayDigits(new Intl.DateTimeFormat(config.locale, { hour: '2-digit', minute: '2-digit', ...options, numberingSystem: config.numberingSystem }).format(date), language);
  } catch {
    return displayDigits(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`, language);
  }
}

export function displayDateTime(
  value: Date | string | number,
  language = activeLanguage,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return displayDate(value, language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

export function displayDayPeriod(hour: number, language: string, fallback: string): string {
  const config = getNumberLocale(language);
  try {
    if (!Intl.DateTimeFormat.supportedLocalesOf([config.locale]).length) return fallback;
    return new Intl.DateTimeFormat(config.locale, { hour: 'numeric', hour12: true })
      .formatToParts(new Date(2000, 0, 1, hour))
      .find(part => part.type === 'dayPeriod')?.value || fallback;
  } catch {
    return fallback;
  }
}

export function uses12HourClock(language: string): boolean {
  const config = getNumberLocale(language);
  try {
    if (!Intl.DateTimeFormat.supportedLocalesOf([config.locale]).length) return false;
    return new Intl.DateTimeFormat(config.locale, { hour: 'numeric' }).resolvedOptions().hour12 === true;
  } catch {
    return false;
  }
}

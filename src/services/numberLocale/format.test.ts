import { beforeEach, describe, expect, it } from 'vitest';
import {
  displayDate,
  displayDateTime,
  displayDigits,
  displayNumber,
  displayTime,
  displayUiText,
  getNumberLocale,
  installNumberLocale,
  setDisplayLanguage,
  uses12HourClock,
  validNumberLocale,
} from './format';
import bundled from './number-locales.json';

const ARABIC = '٠١٢٣٤٥٦٧٨٩';

beforeEach(() => {
  setDisplayLanguage('en');
});

describe('number locale packs', () => {
  it('bundles a reviewed ten-digit mapping for every supported language', () => {
    expect(Object.keys(bundled)).toHaveLength(39);
    for (const [language, [locale, numberingSystem, digits]] of Object.entries(bundled)) {
      expect(locale, language).toMatch(/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/);
      expect(numberingSystem, language).toBeTruthy();
      expect(Array.from(digits), language).toHaveLength(10);
      expect(new Set(Array.from(digits)).size, language).toBe(10);
    }
  });

  it('converts only ASCII digits and leaves technical values untouched', () => {
    setDisplayLanguage('ar');
    expect(displayDigits('Genesis 1:2—3', 'ar')).toBe('Genesis ١:٢—٣');
    expect(displayUiText('Read John 3:16 at https://example.com/a/1', 'ar'))
      .toBe('Read John ٣:١٦ at https://example.com/a/1');
    expect(displayUiText('Mail user1@example.com or id 123e4567-e89b-12d3-a456-426614174000', 'ar'))
      .toBe('Mail user1@example.com or id 123e4567-e89b-12d3-a456-426614174000');
    expect(displayUiText("Strong's H1234 and G5678 / sk_live_abc123", 'ar'))
      .toBe("Strong's H1234 and G5678 / sk_live_abc123");
  });

  it('uses the locale grouping and family digits for numbers', () => {
    expect(displayNumber(1234567, 'en')).toBe('1,234,567');
    expect(displayNumber(1234, 'ar')).toContain('١');
    expect(displayNumber(1234, 'hi')).toContain('१');
    expect(displayNumber(12.5, 'en', { minimumFractionDigits: 2 })).toBe('12.50');
  });

  it('formats dates and times with the selected language digits', () => {
    const date = new Date(2026, 9, 29, 15, 4);
    const arabicDate = displayDate(date, 'ar', { year: 'numeric', month: 'long', day: 'numeric' });
    const arabicTime = displayTime(date, 'ar');
    const hindiDateTime = displayDateTime(date, 'hi');
    expect(arabicDate).toContain('٢٠٢٦');
    expect(arabicDate).toMatch(/[٠-٩]/);
    expect(arabicTime).toMatch(/[٠-٩]/);
    expect(hindiDateTime).toMatch(/[०-९]/);
    // Gregorian calendar is deliberate: never silently swap calendar years.
    expect(displayDate(date, 'ar', { year: 'numeric' })).toContain('٢٠٢٦');
  });

  it('honours each locale clock convention', () => {
    expect(uses12HourClock('en')).toBe(true);
    expect(uses12HourClock('de')).toBe(false);
  });

  it('rejects altered remote mappings and installs reviewed ones', () => {
    const active = getNumberLocale('ar');
    expect(validNumberLocale({ ...active, digits: '0123456789' }, 'ar')).toBe(false);
    expect(validNumberLocale({ ...active, language: 'hi' }, 'ar')).toBe(false);
    expect(validNumberLocale({ ...active, schemaVersion: 2 } as any, 'ar')).toBe(false);
    expect(validNumberLocale(active, 'ar')).toBe(true);

    installNumberLocale({ ...active, digits: '0123456789' } as any);
    expect(getNumberLocale('ar').digits).toBe(ARABIC);
    installNumberLocale({ ...active, locale: 'ar-EG' });
    expect(getNumberLocale('ar').locale).toBe('ar-SA');
  });

  it('falls back to English for an unknown language', () => {
    expect(getNumberLocale('xx').language).toBe('en');
    expect(displayDigits(42, 'xx')).toBe('42');
    expect(displayDigits('१२', 'hi')).toBe('१२');
  });
});

import { beforeEach, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { TextEncoder } from 'node:util';
import { getPublicPackState, getPackedUiDictionary, sha256, syncPublicPack, validatePublicPack } from './publicReadingPacks';
import { getNumberLocale } from './numberLocale/format';
import { BIBLE_BOOKS } from '@/features/Bible/constants';
import { normalizeBookPrologue } from './bookProloguesApi';

beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto); vi.stubGlobal('TextEncoder', TextEncoder);
  vi.stubGlobal('Response', class { constructor(public body: string) {} });
});
it('refuses incomplete UI translations and broken placeholders', () => {
  const source = { schemaVersion: 1 as const, revision: 'a'.repeat(12), texts: ['Hello {name}'] };
  expect(() => validatePublicPack('ui', 'fr', { schemaVersion: 1, revision: source.revision, language: 'fr', translations: ['Bonjour'] }, source)).toThrow();
  expect(() => validatePublicPack('ui', 'fr', { schemaVersion: 1, revision: source.revision, language: 'fr', translations: [] }, source)).toThrow();
});
it('requires explicit coverage of all 66 overview books and original-edition scripture', () => {
  const pack = { schemaVersion: 1, complete: true, revision: 'a'.repeat(12), language: 'fr', scripturePolicy: 'original-edition', books: {}, bookRevisions: {}, missingBooks: BIBLE_BOOKS.map(book => book.bookName) };
  expect(validatePublicPack('overview', 'fr', pack)).toBeTruthy();
  expect(() => validatePublicPack('overview', 'fr', { ...pack, missingBooks: pack.missingBooks.slice(1) })).toThrow();
  expect(() => validatePublicPack('overview', 'fr', { ...pack, scripturePolicy: 'translated' })).toThrow();
});
it('accepts existing structured Scripture entries and preserves edition attribution', () => {
  const books = { Genesis: { bookName: 'Genesis', designation: 'First', keyScripture: [{ bookName: 'Genesis', chapter: 1, verse: 1, translation: 'KJV', text: 'In the beginning' }] } };
  const pack = { schemaVersion: 1, complete: true, revision: 'a'.repeat(12), language: 'fr', scripturePolicy: 'original-edition', books, bookRevisions: { Genesis: 'b'.repeat(12) }, missingBooks: BIBLE_BOOKS.slice(1).map(book => book.bookName) };
  expect(validatePublicPack('overview', 'fr', pack)).toBeTruthy();
  const display = normalizeBookPrologue(books.Genesis as any);
  expect(display.keyScripture?.[0]).toMatchObject({ reference: 'Genesis 1:1 (KJV)', text: 'In the beginning', translation: 'KJV' });
});
it('installs public UI copy atomically and keeps it after a failed update', async () => {
  const source = { schemaVersion: 1, revision: (await sha256('ui-v1:["Hello {name}"]')).slice(0, 12), texts: ['Hello {name}'] };
  const pack = { schemaVersion: 1, revision: source.revision, language: 'es', translations: ['Hola {name}'] };
  const put = vi.fn();
  vi.stubGlobal('caches', { open: async () => ({ match: async () => undefined, put }) });
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(source) })
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'ready', language: 'es', revision: source.revision }) })
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify(pack) });
  vi.stubGlobal('fetch', fetcher);
  await syncPublicPack('ui', 'es', true);
  expect(getPublicPackState('ui', 'es').stage).toBe('ready');
  expect(getPackedUiDictionary('es').get('Hello {name}')).toBe('Hola {name}');
  expect(put).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls.every(call => call[1].credentials === 'omit')).toBe(true);
  fetcher.mockRejectedValue(new Error('offline'));
  await syncPublicPack('ui', 'es', true);
  expect(getPublicPackState('ui', 'es')).toMatchObject({ stage: 'ready', error: 'offline' });
  expect(getPackedUiDictionary('es').get('Hello {name}')).toBe('Hola {name}');
  expect(put).toHaveBeenCalledTimes(1);
});
it('accepts and installs only the reviewed number mapping for a language', async () => {
  const pack = {
    schemaVersion: 1 as const, revision: 'a'.repeat(12), language: 'ar',
    locale: 'ar-SA', numberingSystem: 'arab', digits: '٠١٢٣٤٥٦٧٨٩',
  };
  expect(validatePublicPack('numbers', 'ar', pack)).toBeTruthy();
  expect(() => validatePublicPack('numbers', 'ar', { ...pack, digits: '0123456789' })).toThrow();
  expect(() => validatePublicPack('numbers', 'ar', { ...pack, digits: '٠١٢٣٤٥٦٧٨' })).toThrow();
  expect(() => validatePublicPack('numbers', 'hi', pack)).toThrow();

  const put = vi.fn();
  vi.stubGlobal('caches', { open: async () => ({ match: async () => undefined, put }) });
  const text = JSON.stringify(pack);
  const fetcher = vi.fn()
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ status: 'ready', language: 'ar', revision: pack.revision, sha256: await sha256(text) }) })
    .mockResolvedValueOnce({ ok: true, text: async () => text });
  vi.stubGlobal('fetch', fetcher);
  await syncPublicPack('numbers', 'ar', true);
  expect(getPublicPackState('numbers', 'ar').stage).toBe('ready');
  expect(getNumberLocale('ar')).toMatchObject({ locale: 'ar-SA', numberingSystem: 'arab', digits: '٠١٢٣٤٥٦٧٨٩' });
  expect(put).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls.every(call => call[1].credentials === 'omit')).toBe(true);
});
it('a failed first installation never advertises offline availability', async () => {
  const put = vi.fn();
  vi.stubGlobal('caches', { open: async () => ({ match: async () => undefined, put }) });
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('not published')));
  await syncPublicPack('overview', 'de', true);
  expect(getPublicPackState('overview', 'de')).toMatchObject({ stage: 'failed', error: 'not published' });
  expect(getPublicPackState('overview', 'de').pack).toBeUndefined();
  expect(put).not.toHaveBeenCalled();
});

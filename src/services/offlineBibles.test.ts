import { beforeEach, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { TextEncoder, TextDecoder } from 'node:util';
import { installOfflineBible, loadOfflineBible, parseBibleXml } from './offlineBibles';
import { GUEST_SESSION_KEY } from './guestSession';

const xml = '<bible><book number="1"><chapter number="1"><verse number="1">In the beginning &amp; forever</verse></chapter></book></bible>';
const metadata = { id: 'KJV', fileId: 'EnglishKJVBible', sha256: 'a'.repeat(64), bookCount: 1, chapterCount: 1, verseCount: 1 };
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear();
  vi.stubGlobal('crypto', webcrypto); vi.stubGlobal('TextEncoder', TextEncoder); vi.stubGlobal('TextDecoder', TextDecoder);
});
it('parses both supported XML formats without changing edition text', () => {
  expect(parseBibleXml(xml, metadata)[0]).toMatchObject({ bookName: 'Genesis', chapterNumber: 1, verses: [{ verseNumber: 1, text: 'In the beginning & forever' }] });
  expect(parseBibleXml('<bible><b n="Genesis"><c n="1"><v n="1">Word</v></c></b></bible>', metadata)[0].verses[0].text).toBe('Word');
});
it('rejects missing content, duplicates, malformed XML and external entity declarations', () => {
  for (const invalid of [xml.replace('</chapter>', '<verse number="1">Duplicate</verse></chapter>'), xml.replace('number="1">In', 'number="0">In'), '<bible>', '<!DOCTYPE bible><bible/>']) {
    expect(() => parseBibleXml(invalid, metadata)).toThrow();
  }
  expect(() => parseBibleXml(xml, { ...metadata, verseCount: 2 })).toThrow('coverage');
});
it('does not download Bible XML before login or guest entry', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  await expect(installOfflineBible('KJV')).rejects.toThrow('Enter as a guest');
  expect(fetcher).not.toHaveBeenCalled();
});
it('leaves an existing installation untouched after a checksum failure', async () => {
  sessionStorage.setItem(GUEST_SESSION_KEY, '1');
  const put = vi.fn(); vi.stubGlobal('caches', { open: async () => ({ put }) });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ data: metadata }) }).mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new TextEncoder().encode(xml).buffer }));
  await expect(installOfflineBible('KJV')).rejects.toThrow('checksum');
  expect(put).not.toHaveBeenCalled();
});
it('installs atomically and reuses a verified edition without a network call', async () => {
  sessionStorage.setItem(GUEST_SESSION_KEY, '1');
  const bytes = new TextEncoder().encode(xml);
  const hash = Buffer.from(await webcrypto.subtle.digest('SHA-256', bytes)).toString('hex');
  const put = vi.fn(); vi.stubGlobal('caches', { open: async () => ({ put }) });
  vi.stubGlobal('Response', class { constructor(public body: string) {} });
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ data: { ...metadata, sha256: hash } }) }).mockResolvedValueOnce({ ok: true, arrayBuffer: async () => bytes.buffer });
  vi.stubGlobal('fetch', fetcher);
  await installOfflineBible('KJV');
  expect(put).toHaveBeenCalledTimes(1);
  expect((await loadOfflineBible('KJV'))?.[0].verses[0].text).toContain('beginning');
  expect(fetcher).toHaveBeenCalledTimes(2);
});

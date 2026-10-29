import { API_BASE_URL } from './api';
import { sha256 } from './publicReadingPacks';
import { BIBLE_BOOKS } from '@/features/Bible/constants';
import { hasGuestSession } from './guestSession';
import type { ChapterVerseData, Translation } from './bibleApi';

const CACHE = 'exegesis-public-packs-v1';
const url = (id: string) => new URL(`/__public_bibles/${encodeURIComponent(id)}`, location.origin).href;
const loaded = new Map<string, ChapterVerseData[]>();
const pending = new Map<string, Promise<void>>();
const safeId = (id: string) => /^[A-Za-z0-9_-]+$/.test(id);
interface BibleMetadata { id: string; fileId: string; sha256: string; bookCount: number; chapterCount: number; verseCount: number }

export function parseBibleXml(xml: string, metadata: BibleMetadata): ChapterVerseData[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Unsupported XML declarations');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid Bible XML');
  const books = [...doc.querySelectorAll('book, b')];
  const chapters: ChapterVerseData[] = [];
  const bookNumbers = new Set<number>();
  let verseCount = 0;
  for (const book of books) {
    const attr = book.getAttribute('number') || book.getAttribute('n') || '';
    const canonical = book.tagName === 'book' ? BIBLE_BOOKS.find(b => b.bookNumber === Number(attr)) :
      BIBLE_BOOKS.find(b => b.bookName.toLowerCase() === (attr === 'Psalm' ? 'Psalms' : attr).toLowerCase());
    if (!canonical || bookNumbers.has(canonical.bookNumber)) throw new Error('Invalid Bible book');
    bookNumbers.add(canonical.bookNumber);
    const seenChapters = new Set<number>();
    for (const chapter of [...book.children].filter(node => ['chapter', 'c'].includes(node.tagName))) {
      const chapterNumber = Number(chapter.getAttribute('number') || chapter.getAttribute('n'));
      if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || seenChapters.has(chapterNumber)) throw new Error('Invalid Bible chapter');
      seenChapters.add(chapterNumber);
      const verses = [...chapter.children].filter(node => ['verse', 'v'].includes(node.tagName)).map(node => ({
        verseNumber: Number(node.getAttribute('number') || node.getAttribute('n')),
        text: node.textContent?.trim() || '',
      }));
      if (!verses.length || new Set(verses.map(v => v.verseNumber)).size !== verses.length ||
          verses.some(v => !Number.isInteger(v.verseNumber) || v.verseNumber < 1 || !v.text)) throw new Error('Incomplete Bible chapter');
      verseCount += verses.length;
      chapters.push({ bookNumber: canonical.bookNumber, bookName: canonical.bookName, chapterNumber, verses });
    }
  }
  if (books.length !== metadata.bookCount || chapters.length !== metadata.chapterCount || verseCount !== metadata.verseCount) throw new Error('Bible coverage does not match edition metadata');
  return chapters;
}

export async function loadOfflineBible(id: string): Promise<ChapterVerseData[] | undefined> {
  if (!safeId(id)) return;
  if (loaded.has(id)) return loaded.get(id);
  try {
    const cache = await caches.open(CACHE);
    const response = await cache.match(url(id));
    if (!response) return;
    const record = await response.json();
    if (record.requestedId !== id || !/^[a-f0-9]{64}$/.test(record.sha256) || await sha256(record.xml) !== record.sha256) return;
    const chapters = parseBibleXml(record.xml, record.metadata);
    loaded.set(id, chapters);
    return chapters;
  } catch { return; }
}

export function installOfflineBible(id: string): Promise<void> {
  if (!safeId(id)) return Promise.reject(new Error('Invalid edition'));
  if (!localStorage.getItem('auth_token') && !hasGuestSession()) return Promise.reject(new Error('Enter as a guest or sign in before downloading a Bible'));
  if (pending.has(id)) return pending.get(id)!;
  const task = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    try {
      const options: RequestInit = { credentials: 'omit', cache: 'no-store', signal: controller.signal };
      const metaResponse = await fetch(`${API_BASE_URL}/translations/${id}/metadata`, options);
      if (!metaResponse.ok) throw new Error('Edition metadata unavailable');
      const { data: metadata } = await metaResponse.json() as { data: BibleMetadata };
      if (!metadata || !/^[a-f0-9]{64}$/.test(metadata.sha256) || ![metadata.id, metadata.fileId].includes(id) ||
          ![metadata.bookCount, metadata.chapterCount, metadata.verseCount].every(value => Number.isInteger(value) && value > 0)) throw new Error('Unverified edition metadata; update the backend');
      const response = await fetch(`${API_BASE_URL}/translations/${id}/download`, options);
      if (!response.ok) throw new Error('Bible download unavailable');
      const bytes = await response.arrayBuffer();
      const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
      if (hash !== metadata.sha256) throw new Error('Bible checksum mismatch');
      const xml = new TextDecoder().decode(bytes);
      const chapters = parseBibleXml(xml, metadata);
      const cache = await caches.open(CACHE);
      await cache.put(url(id), new Response(JSON.stringify({ requestedId: id, metadata, xml, sha256: await sha256(xml) }), { headers: { 'Content-Type': 'application/json' } }));
      loaded.set(id, chapters);
    } finally { clearTimeout(timer); }
  })().finally(() => pending.delete(id));
  pending.set(id, task);
  return task;
}

export async function removeOfflineBible(id: string) {
  const cache = await caches.open(CACHE);
  await cache.delete(url(id));
  loaded.delete(id);
}

export async function storeBibleCatalog(catalog: Translation[]) {
  try {
    const cache = await caches.open(CACHE);
    await cache.put(url('catalog'), new Response(JSON.stringify(catalog), { headers: { 'Content-Type': 'application/json' } }));
  } catch { /* Browser quota/private mode must not break online reading. */ }
}
export async function loadBibleCatalog(): Promise<Translation[]> {
  try {
    const cache = await caches.open(CACHE);
    const response = await cache.match(url('catalog'));
    const catalog = await response?.json();
    return Array.isArray(catalog) ? catalog.filter(item => typeof item?.id === 'string' && typeof item?.name === 'string') : [];
  } catch { return []; }
}

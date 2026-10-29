import { z } from 'zod';
import { API_BASE_URL } from './api';
import { BIBLE_BOOKS } from '@/features/Bible/constants';
import { normalizeBookPrologue, type BookPrologue } from './bookProloguesApi';
import type { BookWithMaxChapter } from './bibleApi';
import { installUiDictionary } from '@/components/languages/uiCopy';

const revision = z.string().regex(/^[a-f0-9]{12}$/);
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const sourceSchema = z.object({ schemaVersion: z.literal(1), revision, texts: z.array(z.string().min(1)).min(1) });
const uiSchema = z.object({ schemaVersion: z.literal(1), revision, language: z.string(), translations: z.array(z.string().trim().min(1)) });
const overviewBook = z.object({
  bookName: z.string(), designation: z.string().min(1),
  ...Object.fromEntries(['author', 'authorDetail', 'audience', 'dateWritten', 'locationWritten', 'purpose', 'keyTheme', 'summary', 'background', 'lessons', 'christConnection'].map(key => [key, z.string().nullish()])),
  applications: z.array(z.string()).nullish(), mainThemes: z.array(z.string()).nullish(),
  keyPeople: z.array(z.string()).nullish(), keyVerses: z.array(z.string()).nullish(),
  structure: z.array(z.object({ range: z.string(), title: z.string() })).nullish(),
  // Preserve edition/reference metadata, rather than translating Scripture.
  keyScripture: z.array(z.object({
    reference: z.string().optional(), text: z.string().optional(), bookName: z.string().optional(),
    chapter: z.number().nullish(), verse: z.number().nullish(), translation: z.string().optional(),
  }).passthrough().refine(entry => !!(entry.reference || entry.text || entry.bookName))).nullish(),
}).passthrough();
const overviewSchema = z.object({
  schemaVersion: z.literal(1), complete: z.literal(true), revision, language: z.string(),
  scripturePolicy: z.literal('original-edition'), missingBooks: z.array(z.string()),
  bookRevisions: z.record(revision), books: z.record(overviewBook),
});
const bookSchema = z.object({
  schemaVersion: z.literal(1), revision, names: z.record(z.record(z.string().trim().min(1))),
  editions: z.array(z.object({ id: z.string().min(1), fileId: z.string().min(1), books: z.array(z.object({
    bookName: z.string().min(1), bookNumber: z.number().int().positive(),
    maxChapter: z.number().int().positive(), chaptersCount: z.number().int().positive(),
    totalVerses: z.number().int().nonnegative(), testament: z.enum(['Old', 'New']),
  })).min(1) })).min(1),
});
type Source = z.infer<typeof sourceSchema>;
type Ui = z.infer<typeof uiSchema>;
type Overview = z.infer<typeof overviewSchema>;
type Books = z.infer<typeof bookSchema>;
type Kind = 'ui' | 'overview' | 'books';
type Pack = Ui | Overview | Books;
export interface PublicPackState {
  stage: 'idle' | 'checking' | 'downloading' | 'ready' | 'failed';
  pack?: Pack; source?: Source; error?: string;
}
const CACHE = 'exegesis-public-packs-v1';
const states = new Map<string, PublicPackState>();
const pending = new Map<string, Promise<void>>();
const hydration = new Map<string, Promise<void>>();
const nextAttempt = new Map<string, number>();
const listeners = new Set<() => void>();
const key = (kind: Kind, language: string) => `${kind}:${language}`;
const cacheKey = (kind: Kind, language: string) => new URL(`/__public_packs/${kind}/${language}`, location.origin).href;
const languageValid = (language: string) => /^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/.test(language);
export const subscribePublicPacks = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function getPublicPackState(kind: Kind, language: string): PublicPackState {
  const id = key(kind, language);
  if (!states.has(id)) states.set(id, { stage: 'idle' });
  return states.get(id)!;
}
function update(kind: Kind, language: string, patch: Partial<PublicPackState>) {
  states.set(key(kind, language), { ...getPublicPackState(kind, language), ...patch });
  if (kind === 'ui' && getPublicPackState(kind, language).pack) installUiDictionary(language, getPackedUiDictionary(language));
  listeners.forEach(listener => listener());
}
export async function sha256(text: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
const tokens = (text: string) => JSON.stringify((text.match(/\{\{?\w+\}?\}|%\d*\$?[sd]|<\/?\w+>/g) || []).sort());

export function validatePublicPack(kind: Kind, language: string, value: unknown, source?: Source): Pack {
  if (kind === 'ui') {
    const pack = uiSchema.parse(value);
    if (!source || pack.language !== language || pack.revision !== source.revision ||
        pack.translations.length !== source.texts.length || source.texts.some((text, i) => tokens(text) !== tokens(pack.translations[i]))) throw new Error('Incomplete UI pack');
    return pack;
  }
  if (kind === 'overview') {
    const pack = overviewSchema.parse(value);
    const present = Object.keys(pack.books);
    const covered = [...present, ...pack.missingBooks];
    if (pack.language !== language || covered.length !== 66 || new Set(covered).size !== 66 ||
        covered.some(name => !BIBLE_BOOKS.some(book => book.bookName === name)) ||
        Object.keys(pack.bookRevisions).length !== present.length ||
        present.some(name => pack.books[name].bookName !== name || !pack.bookRevisions[name])) throw new Error('Incomplete overview pack');
    return pack;
  }
  const pack = bookSchema.parse(value);
  if (Object.keys(pack.names.en || {}).length !== 66 ||
      Object.values(pack.names).some(names => Object.keys(pack.names.en).some(name => !names[name])) ||
      new Set(pack.editions.map(edition => edition.id)).size !== pack.editions.length ||
      pack.editions.some(edition => new Set(edition.books.map(book => book.bookNumber)).size !== edition.books.length ||
        edition.books.some(book => book.chaptersCount !== book.maxChapter))) throw new Error('Incomplete book metadata');
  return pack;
}

export function hydratePublicPack(kind: Kind, language: string): Promise<void> {
  const id = key(kind, language);
  if (!hydration.has(id)) hydration.set(id, (async () => {
    try {
      const cache = await caches.open(CACHE);
      const response = await cache.match(cacheKey(kind, language));
      if (!response) return;
      const record = await response.json();
      if (!digest.safeParse(record.sha256).success || await sha256(record.text) !== record.sha256) return;
      const source = record.source ? sourceSchema.parse(record.source) : undefined;
      if (source && (await sha256(`ui-v1:${JSON.stringify(source.texts)}`)).slice(0, 12) !== source.revision) return;
      const pack = validatePublicPack(kind, language, JSON.parse(record.text), source);
      update(kind, language, { stage: 'ready', pack, source });
    } catch { /* Corrupt/disabled storage must not prevent reading online. */ }
  })());
  return hydration.get(id)!;
}

async function fetchText(path: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    // Backend file proxies avoid requiring browser CORS changes on existing R2
    // buckets. No app bearer token or cookies go to public download endpoints.
    const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'omit', cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error(response.status === 404 ? 'Pack not published yet' : 'Pack download unavailable');
    const text = await response.text();
    if (text.length > 20 * 1024 * 1024) throw new Error('Pack exceeds storage limit');
    return text;
  } finally { clearTimeout(timer); }
}

export function syncPublicPack(kind: Kind, language: string, force = false): Promise<void> {
  if (!languageValid(language)) return Promise.resolve();
  const id = key(kind, language);
  if (pending.has(id)) return pending.get(id)!;
  if (!force && Date.now() < (nextAttempt.get(id) || 0)) return Promise.resolve();
  const task = (async () => {
    await hydratePublicPack(kind, language);
    const previous = getPublicPackState(kind, language);
    update(kind, language, { stage: 'checking', error: undefined });
    try {
      let source: Source | undefined;
      if (kind === 'ui') {
        source = sourceSchema.parse(JSON.parse(await fetchText('/translation/ui-packs/source')));
        if ((await sha256(`ui-v1:${JSON.stringify(source.texts)}`)).slice(0, 12) !== source.revision) throw new Error('UI source checksum mismatch');
      }
      const base = kind === 'ui' ? `/translation/ui-packs/${language}` : kind === 'overview' ? `/book-prologues/packs/${language}` : '/translations/book-packs';
      const query = source ? `?sourceRevision=${source.revision}` : '';
      const manifest = JSON.parse(await fetchText(`${base}/manifest${query}`));
      if (manifest.status !== 'ready' || !revision.safeParse(manifest.revision).success ||
          (kind !== 'books' && manifest.language !== language) || (source && manifest.revision !== source.revision)) throw new Error('Pack not published for this language');
      if (previous.pack?.revision === manifest.revision) {
        update(kind, language, { stage: 'ready' });
        return;
      }
      update(kind, language, { stage: 'downloading' });
      const text = await fetchText(`${base}/file?revision=${manifest.revision}`);
      const checksum = await sha256(text);
      if ((kind === 'overview' && !digest.safeParse(manifest.sha256).success) ||
          (manifest.sha256 && checksum !== manifest.sha256)) throw new Error('Pack checksum mismatch');
      const raw = JSON.parse(text);
      const pack = validatePublicPack(kind, language, raw, source);
      if (pack.revision !== manifest.revision) throw new Error('Pack revision mismatch');
      if (kind === 'overview') {
        const overview = pack as Overview;
        if (Object.keys(overview.books).length !== manifest.bookCount || JSON.stringify(overview.missingBooks) !== JSON.stringify(manifest.missingBooks)) throw new Error('Pack coverage mismatch');
      }
      if (kind === 'books') {
        const { revision: _revision, ...content } = raw;
        if ((await sha256(JSON.stringify(content))).slice(0, 12) !== manifest.revision || (pack as Books).editions.length !== manifest.editionCount) throw new Error('Metadata checksum mismatch');
      }
      // A single atomic cache write replaces the prior installation only after
      // all checks pass. A quota/download failure leaves the previous copy intact.
      const cache = await caches.open(CACHE);
      await cache.put(cacheKey(kind, language), new Response(JSON.stringify({ text, sha256: checksum, source }), { headers: { 'Content-Type': 'application/json' } }));
      update(kind, language, { stage: 'ready', pack, source });
    } catch (error) {
      update(kind, language, { stage: previous.pack ? 'ready' : 'failed', error: error instanceof Error ? error.message : 'Pack unavailable' });
    } finally { nextAttempt.set(id, Date.now() + 60000); }
  })().finally(() => pending.delete(id));
  pending.set(id, task);
  return task;
}

export function getPackedUiDictionary(language: string): Map<string, string> {
  const state = getPublicPackState('ui', language);
  if (!state.pack || !state.source) return new Map();
  const pack = state.pack as Ui;
  return new Map(state.source.texts.map((text, i) => [text, pack.translations[i]]));
}
export function getPackedOverview(bookName: string, language: string): (BookPrologue & { designation: string }) | null | undefined {
  const pack = getPublicPackState('overview', language).pack as Overview | undefined;
  if (!pack) return undefined;
  const book = pack.books[bookName];
  return book ? { ...normalizeBookPrologue(book as BookPrologue), designation: book.designation } : null;
}
export function getPackedBooks(editionId: string): BookWithMaxChapter[] | undefined {
  const pack = getPublicPackState('books', 'en').pack as Books | undefined;
  return pack?.editions.find(edition => edition.id === editionId || edition.fileId === editionId)?.books as BookWithMaxChapter[] | undefined;
}
export function getPackedBookName(name: string, language: string) {
  return (getPublicPackState('books', 'en').pack as Books | undefined)?.names[language]?.[name];
}

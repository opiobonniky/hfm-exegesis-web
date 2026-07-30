import { sendPostRequest, sendGetRequest } from "./api";

// ── Local cache (localStorage) ─────────────────────────────────────────────────

const CACHE_PREFIX = 'strongs_cache_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_ENTRIES = 200;

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

function getCacheKey(type: 'verse_words' | 'entry', ...parts: (string | number)[]): string {
  return CACHE_PREFIX + type + ':' + parts.join(':');
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCached<T>(key: string, data: T): void {
  try {
    // Prune old entries if cache is too large
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) count++;
    }
    if (count >= MAX_CACHE_ENTRIES) {
      // Remove all expired entries first
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const entry = JSON.parse(raw);
              if (Date.now() > entry.expiry) toRemove.push(k);
            }
          } catch {/* skip */}
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    }
    const entry: CacheEntry<T> = { data, expiry: Date.now() + CACHE_TTL_MS };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface StrongsWordData {
  wordOrder: number;
  surfaceText: string;
  strongsId: string | null;
  lemma: string | null;
  morphology: string | null;
  hasData: boolean;
  verseNumber?: number;
  language?: string;
  partOfSpeech?: string | null;
}

export interface StrongsEntry {
  strongsId: string;
  originalWord: string | null;
  transliteration: string | null;
  shortDefinition: string;
  fullDefinition: string | null;
  language: string;
  partOfSpeech: string | null;
  grammaticalCase: string | null;
  gender: string | null;
  number: string | null;
  usageCount: number | null;
  adminExplanation?: string | null;
  crossReferences: string | null;
  verseReferences?: Array<{
    bookName: string;
    chapter: number;
    verse: number | null;
    translation?: string;
    surfaceText?: string | null;
    adminExplanation?: string | null;
  }> | null;
  verseCount?: number;
}

// ── API Functions ───────────────────────────────────────────────────────────────

export const getVerseWords = async (
  bookName: string,
  chapter: number,
  verseNumber?: number,
  translation?: string,
): Promise<StrongsWordData[]> => {
  const cacheKey = getCacheKey('verse_words', bookName, chapter, verseNumber ?? 0, translation || 'Berean');

  // Check cache
  const cached = getCached<StrongsWordData[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await sendPostRequest<StrongsWordData[]>("strongs", "verse-words", {
      bookName,
      chapter,
      ...(verseNumber != null ? { verseNumber } : {}),
      translation: translation || "Berean",
    });
    if (res.returnCode === 200 && res.returnData) {
      const data = res.returnData.map((w: any) => ({
        ...w,
        verseNumber: w.verseNumber || verseNumber || 1,
      }));
      // Store in cache
      setCached(cacheKey, data);
      return data;
    }
    return [];
  } catch {
    return [];
  }
};

export const clearStrongsCache = () => {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};

export const getStrongsEntry = async (
  strongsId: string,
): Promise<StrongsEntry | null> => {
  const cacheKey = getCacheKey('entry', strongsId);

  // Check cache
  const cached = getCached<StrongsEntry>(cacheKey);
  if (cached) return cached;

  try {
    const res = await sendGetRequest<StrongsEntry>("strongs", strongsId, {});
    if (res.returnCode === 200 && res.returnData) {
      // Store in cache
      setCached(cacheKey, res.returnData);
      return res.returnData;
    }
    return null;
  } catch {
    return null;
  }
};

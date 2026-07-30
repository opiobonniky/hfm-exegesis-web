// src/utilities/bibleUtils.ts

import {
  getVersionById,
  DEFAULT_VERSION_ID,
  type BibleVersion,
} from '../assets/bibleVersion/json/bibleVersions';

/* ------------------------------------------------------------------ */
/*  Active-version cache (lazy-loaded)                                  */
/* ------------------------------------------------------------------ */

let _activeVersionId: string = DEFAULT_VERSION_ID;
// _activeData is NO LONGER populated at module init – it's loaded on demand
let _activeData: Record<string, string> | null = null;
let _dataLoadPromise: Promise<void> | null = null;

/**
 * Ensure the active version's data is loaded.
 * Safe to call multiple times – only loads if not already cached.
 */
export const ensureDataLoaded = async (): Promise<void> => {
  if (_activeData) return;
  if (_dataLoadPromise) return _dataLoadPromise;

  _dataLoadPromise = (async () => {
    const version = getVersionById(_activeVersionId);
    _activeData = await version.getData();
  })();

  return _dataLoadPromise;
};

/** Synchronous peek – returns the cached data or null if not yet loaded */
const getCachedData = (): Record<string, string> | null => _activeData;

/**
 * Switch the active Bible version (async – loads the new version's data).
 * Call this whenever the user picks a different translation.
 */
export const setActiveVersion = async (versionId: string): Promise<void> => {
  if (versionId === _activeVersionId && _activeData) return;
  const version = getVersionById(versionId);
  _activeVersionId = version.id;
  _activeData = null; // will be loaded on next ensureDataLoaded call
  _dataLoadPromise = null;
  await ensureDataLoaded();
  // invalidate search index
  indexBuilt = false;
  Object.keys(verseIndex).forEach(k => delete verseIndex[k]);
};

/** Returns the currently active version id */
export const getActiveVersionId = (): string => _activeVersionId;

/** Helper – resolves the verse dataset to use. Returns null if not loaded. */
const data = (override?: Record<string, string>): Record<string, string> | null =>
  override ?? getCachedData();

/* ---------------- TESTAMENT LISTS ---------------- */

export const OLD_TESTAMENT_BOOKS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
] as const;

export const NEW_TESTAMENT_BOOKS = [
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
] as const;

/* ---------------- TYPES ---------------- */

export interface Book {
  name: string;
  chapters: number;
  verses: number;
  testament: "Old" | "New";
}

export interface VerseSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

/* ---------------- BOOKS METADATA ---------------- */

/**
 * Builds metadata for all books by scanning the verses keys.
 * Returns empty array if data not yet loaded.
 */
export const getBibleBooks = (versionData?: Record<string, string>): Book[] => {
  const d = data(versionData);
  if (!d) return [];

  const bookMap: Record<string, { chapters: Set<number>; verses: number }> = {};

  Object.keys(d).forEach((key) => {
    const lastSpace = key.lastIndexOf(" ");
    const book = key.substring(0, lastSpace);
    const [chapterStr] = key.substring(lastSpace + 1).split(":");
    const chapter = Number(chapterStr);

    if (!bookMap[book]) {
      bookMap[book] = { chapters: new Set(), verses: 0 };
    }

    bookMap[book].chapters.add(chapter);
    bookMap[book].verses++;
  });

  return Object.entries(bookMap)
    .map(([name, bData]) => ({
      name,
      chapters: bData.chapters.size,
      verses: bData.verses,
      testament: NEW_TESTAMENT_BOOKS.includes(name as typeof NEW_TESTAMENT_BOOKS[number]) ? "New" as const : "Old" as const,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/* ---------------- CHAPTER & VERSE HELPERS ---------------- */

export const getVersesForChapter = (
  book: string,
  chapter: number,
  versionData?: Record<string, string>,
): Record<number, string> => {
  const verses: Record<number, string> = {};
  const d = data(versionData);
  if (!d) return verses;

  Object.keys(d).forEach((key) => {
    const lastSpace = key.lastIndexOf(" ");
    const bookName = key.substring(0, lastSpace);
    const [chStr, vsStr] = key.substring(lastSpace + 1).split(":");

    if (bookName === book && Number(chStr) === chapter) {
      verses[Number(vsStr)] = d[key];
    }
  });

  return verses;
};

export const getVerseText = (
  book: string,
  chapter: number,
  verse: number,
  versionData?: Record<string, string>,
): string | null => {
  const d = data(versionData);
  if (!d) return null; // data not yet loaded
  const key = `${book} ${chapter}:${verse}`;
  return d[key] ?? null;
};

/**
 * Async version of getVerseText – ensures data is loaded before looking up.
 * Returns null if the verse key is not found even after loading.
 */
export const getVerseTextAsync = async (
  book: string,
  chapter: number,
  verse: number,
  versionData?: Record<string, string>,
): Promise<string | null> => {
  if (versionData) {
    return versionData[`${book} ${chapter}:${verse}`] ?? null;
  }
  await ensureDataLoaded();
  return getVerseText(book, chapter, verse);
};

export const getVerseRange = (
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
  versionData?: Record<string, string>,
): Record<number, string> => {
  const verses: Record<number, string> = {};
  const d = data(versionData);
  if (!d) return verses;

  for (let v = startVerse; v <= endVerse; v++) {
    const key = `${book} ${chapter}:${v}`;
    const text = d[key];
    if (text) verses[v] = text;
  }

  return verses;
};

/* ---------------- CASCADING DROPDOWN HELPERS ---------------- */

export const getBooksByTestament = (
  testament: "Old" | "New" | "",
): string[] => {
  if (!testament) return [];

  const books = testament === "Old" ? OLD_TESTAMENT_BOOKS : NEW_TESTAMENT_BOOKS;
  return [...books].sort();
};

export const getChaptersForBook = (book: string): number[] => {
  if (!book) return [];

  const allBooks = getBibleBooks();
  const found = allBooks.find((b) => b.name === book);
  if (!found) return [];

  return Array.from({ length: found.chapters }, (_, i) => i + 1);
};

export const getVersesCountForChapter = (
  book: string,
  chapter: number,
  versionData?: Record<string, string>,
): number => {
  if (!book || chapter < 1) return 0;
  const d = data(versionData);
  if (!d) return 0;

  let count = 0;
  const prefix = `${book} ${chapter}:`;

  Object.keys(d).forEach((key) => {
    if (key.startsWith(prefix)) count++;
  });

  return count;
};

/* ---------------- SIMPLE SEARCH ---------------- */

export const searchVerses = (
  query: string,
  limit = 100,
  versionData?: Record<string, string>,
): VerseSearchResult[] => {
  if (!query.trim()) return [];
  const d = data(versionData);
  if (!d) return [];

  const results: VerseSearchResult[] = [];
  const q = query.toLowerCase();

  Object.keys(d).some((key) => {
    const text = d[key];
    if (text.toLowerCase().includes(q)) {
      const lastSpace = key.lastIndexOf(" ");
      const book = key.substring(0, lastSpace);
      const [chapter, verse] = key
        .substring(lastSpace + 1)
        .split(":")
        .map(Number);

      results.push({ book, chapter, verse, text });
    }
    return results.length >= limit;
  });

  return results;
};

/* ---------------- PRE-INDEXED SEARCH (optional) ---------------- */

type IndexedVerse = VerseSearchResult;

const verseIndex: Record<string, IndexedVerse[]> = {};
let indexBuilt = false;

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

export const buildVerseIndex = (): void => {
  if (indexBuilt) return;
  const d = getCachedData();
  if (!d) {
    // Data not loaded yet — will be built on demand via ensureDataLoaded
    return;
  }

  Object.keys(d).forEach(key => {
    const text = d[key];
    const lastSpace = key.lastIndexOf(' ');
    const book = key.substring(0, lastSpace);
    const [chapter, verse] = key
      .substring(lastSpace + 1)
      .split(':')
      .map(Number);

    tokenize(text).forEach(token => {
      if (!verseIndex[token]) verseIndex[token] = [];
      verseIndex[token].push({ book, chapter, verse, text });
    });
  });

  indexBuilt = true;
};

export const searchVersesIndexed = (
  query: string,
  limit = 100,
): VerseSearchResult[] => {
  if (!query.trim()) return [];
  buildVerseIndex();

  const tokens = tokenize(query);
  if (!tokens.length) return [];

  let results = verseIndex[tokens[0]] ?? [];

  for (let i = 1; i < tokens.length; i++) {
    const set = new Set(
      (verseIndex[tokens[i]] ?? []).map(
        (v) => `${v.book}-${v.chapter}-${v.verse}`,
      ),
    );

    results = results.filter((v) =>
      set.has(`${v.book}-${v.chapter}-${v.verse}`),
    );
  }

  return results.slice(0, limit);
};

// Auto-load data on first import to maintain backward compatibility
// for callers that rely on synchronous getVerseText.
// This kicks off the async load immediately without blocking.
ensureDataLoaded();

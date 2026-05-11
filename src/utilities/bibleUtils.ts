// src/utilities/bibleUtils.ts

import {
  getVersionById,
  DEFAULT_VERSION_ID,
  type BibleVersion,
} from '../assets/bibleVersion/json/bibleVersions';

/* ------------------------------------------------------------------ */
/*  Active-version cache                                               */
/* ------------------------------------------------------------------ */

let _activeVersionId: string = DEFAULT_VERSION_ID;
let _activeData: Record<string, string> =
  getVersionById(DEFAULT_VERSION_ID).data;

/**
 * Switch the active Bible version.
 * Call this whenever the user picks a different translation.
 * The search index is invalidated automatically.
 */
export const setActiveVersion = (versionId: string): void => {
  if (versionId === _activeVersionId) return; // nothing to do
  const version = getVersionById(versionId);
  _activeVersionId = version.id;
  _activeData = version.data;
  // invalidate the search index so it gets rebuilt for the new version
  indexBuilt = false;
  Object.keys(verseIndex).forEach(k => delete verseIndex[k]);
};

/** Returns the currently active version id */
export const getActiveVersionId = (): string => _activeVersionId;

/** Helper – resolves the verse dataset to use */
const data = (override?: Record<string, string>): Record<string, string> =>
  override ?? _activeData;

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
 * Builds metadata for all books by scanning the verses.json keys
 */
export const getBibleBooks = (versionData?: Record<string, string>): Book[] => {
  const bookMap: Record<string, { chapters: Set<number>; verses: number }> = {};

  Object.keys(data(versionData)).forEach((key) => {
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
    .map(([name, data]) => ({
      name,
      chapters: data.chapters.size,
      verses: data.verses,
      testament: NEW_TESTAMENT_BOOKS.includes(name as typeof NEW_TESTAMENT_BOOKS[number]) ? "New" : "Old",
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

  Object.keys(data(versionData)).forEach((key) => {
    const lastSpace = key.lastIndexOf(" ");
    const bookName = key.substring(0, lastSpace);
    const [chStr, vsStr] = key.substring(lastSpace + 1).split(":");

    if (bookName === book && Number(chStr) === chapter) {
      verses[Number(vsStr)] = data(versionData)[key];
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
  const key = `${book} ${chapter}:${verse}`;
  return data(versionData)[key] ?? null;
};

export const getVerseRange = (
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
  versionData?: Record<string, string>,
): Record<number, string> => {
  const verses: Record<number, string> = {};

  for (let v = startVerse; v <= endVerse; v++) {
    const key = `${book} ${chapter}:${v}`;
    const text = data(versionData)[key];
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

  let count = 0;
  const prefix = `${book} ${chapter}:`;

  Object.keys(data(versionData)).forEach((key) => {
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

  const results: VerseSearchResult[] = [];
  const q = query.toLowerCase();

  Object.keys(data(versionData)).some((key) => {
    const text = data(versionData)[key];

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

  const src = _activeData; // always index active version
  Object.keys(src).forEach(key => {
    const text = src[key];
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

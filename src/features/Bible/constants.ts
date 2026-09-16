export const BIBLE_BOOK_CHAPTERS = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150,
  Proverbs: 31, Ecclesiastes: 12, "Song of Solomon": 8, Isaiah: 66,
  Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14,
  Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3,
  Habakkuk: 3, Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6,
  Ephesians: 6, Philippians: 4, Colossians: 4, "1 Thessalonians": 5,
  "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, Titus: 3,
  Philemon: 1, Hebrews: 13, James: 5, "1 Peter": 5, "2 Peter": 3,
  "1 John": 5, "2 John": 1, "3 John": 1, Jude: 1, Revelation: 22,
} as const;

export type BibleBookName = keyof typeof BIBLE_BOOK_CHAPTERS;
export const BIBLE_BOOKS = Object.entries(BIBLE_BOOK_CHAPTERS).map(
  ([bookName, maxChapter], index) => ({
    bookNumber: index + 1,
    bookName,
    maxChapter,
  }),
);
export function isBibleBook(book: string | null): book is BibleBookName {
  return Boolean(book && book in BIBLE_BOOK_CHAPTERS);
}
export function clampChapter(book: BibleBookName, chapter: number): number {
  if (!Number.isFinite(chapter)) return 1;
  return Math.min(Math.max(Math.trunc(chapter), 1), BIBLE_BOOK_CHAPTERS[book]);
}

export const LAB_STAGE_CONFIG = [
  {
    stage: "look",
    icon: "Eye",
    titleKey: "look",
    titleFallback: "Look",
    descKey: "lookDescription",
    descFallback: "Observe what the passage says",
  },
  {
    stage: "listen",
    icon: "Ear",
    titleKey: "listen",
    titleFallback: "Listen",
    descKey: "listenDescription",
    descFallback: "Attend to what God is revealing",
  },
  {
    stage: "learn",
    icon: "GraduationCap",
    titleKey: "learn",
    titleFallback: "Learn",
    descKey: "learnDescription",
    descFallback: "Explore context and meaning",
  },
  {
    stage: "abide",
    icon: "Heart",
    titleKey: "abide",
    titleFallback: "Abide",
    descKey: "abideDescription",
    descFallback: "Reflect and remain in the Word",
  },
  {
    stage: "apply",
    icon: "CheckCircle2",
    titleKey: "apply",
    titleFallback: "Apply",
    descKey: "applyDescription",
    descFallback: "Put this truth into practice",
  },
];

export const AUDIO_SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export const BIBLE_READER_MIN_FONT_SIZE = 12;
export const BIBLE_READER_MAX_FONT_SIZE = 48;
export const BIBLE_READER_DEFAULT_FONT_SIZE = 20;

/**
 * Verse highlight palette — mirrors the mobile app's
 * `app/src/utilits/HIGHLIGHT_COLORS.ts` exactly (same ids, same hex values)
 * so highlights created on one platform render identically on the other.
 * colorId 0 means "no highlight / removed".
 */
export const VERSE_HIGHLIGHT_COLORS = [
  // Warm
  { id: 1, name: "Red", color: "#F87171" },
  { id: 3, name: "Yellow", color: "#FACC15" },
  { id: 4, name: "Orange", color: "#F97316" },
  { id: 13, name: "Pink", color: "#EC4899" },
  { id: 14, name: "Rose", color: "#FB7185" },
  { id: 15, name: "Amber", color: "#F59E0B" },
  // Cool
  { id: 2, name: "Blue", color: "#3B82F6" },
  { id: 7, name: "Cyan", color: "#06B6D4" },
  { id: 8, name: "Teal", color: "#0D9488" },
  { id: 9, name: "Sky", color: "#38BDF8" },
  { id: 10, name: "Indigo", color: "#6366F1" },
  // Nature
  { id: 5, name: "Green", color: "#22C55E" },
  { id: 6, name: "Purple", color: "#A855F7" },
  { id: 11, name: "Lime", color: "#84CC16" },
  { id: 12, name: "Mint", color: "#2DD4BF" },
] as const;

export type VerseHighlightColor = (typeof VERSE_HIGHLIGHT_COLORS)[number];

/** Swatch groups shown in the picker — same grouping as the app. */
export const VERSE_HIGHLIGHT_COLOR_GROUPS = [
  { label: "Warm", ids: [1, 3, 4, 13, 14, 15] },
  { label: "Cool", ids: [2, 7, 8, 9, 10] },
  { label: "Nature", ids: [5, 6, 11, 12] },
] as const;

/** Look up a palette entry by colorId (returns undefined for id 0). */
export function getVerseHighlightColor(
  colorId: number | undefined | null,
): VerseHighlightColor | undefined {
  if (colorId == null || colorId === 0) return undefined;
  return VERSE_HIGHLIGHT_COLORS.find((c) => c.id === colorId);
}


export function getVerseHighlightStyle(colorId: number | undefined | null): {
  backgroundColor: string;
} | null {
  const c = getVerseHighlightColor(colorId);
  if (!c) return null;
  return { backgroundColor: `${c.color}33` };
}

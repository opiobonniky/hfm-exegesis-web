// ─── Admin Feature Constants ───────────────────────────────────────────────────

export type ContentType = "verse" | "devotion" | "exegesis";

export const CONTENT_TYPE_LABELS: Record<ContentType, { label: string; plural: string; icon: string }> = {
  verse: { label: "Daily Verse", plural: "Daily Verses", icon: "Sun" },
  devotion: { label: "Daily Devotion", plural: "Daily Devotions", icon: "Sprout" },
  exegesis: { label: "Daily Exegesis", plural: "Daily Exegesis", icon: "BookOpen" },
};

export const TAB_VALUE_MAP: Record<string, ContentType> = {
  verses: "verse",
  devotions: "devotion",
  exegesis: "exegesis",
};

export const CONTENT_TABS = [
  { value: "verses", label: "Daily Verses", icon: "Sun" },
  { value: "devotions", label: "Devotions", icon: "Sprout" },
  { value: "exegesis", label: "Exegesis", icon: "BookOpen" },
] as const;

export const API_ACTIONS = {
  getVerseAll: "get-all-daily-verses",
  addAction: (type: ContentType) => {
    const prefix = type === "verse" ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    return `add-${prefix}`;
  },
  deleteAction: (type: ContentType) => {
    const prefix = type === "verse" ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    return `delete-${prefix}`;
  },
  getAction: (type: ContentType, action: string) => {
    const prefix = type === "verse" ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    if (type === "verse" && action === "get-all") return "get-all-daily-verses";
    return `${action}-${prefix}`;
  },
} as const;

export const DELETE_ID_KEY: Record<ContentType, string> = {
  verse: "verseId",
  devotion: "devotionId",
  exegesis: "exegesisId",
};

export const PAGE_SIZE = 12;

export const CALENDAR_MODIFIERS = {
  sunday: (date: Date) => date.getDay() === 0,
  special: (date: Date) => date.getDate() === 1,
  today: (date: Date) => date.toDateString() === new Date().toDateString(),
};

export const CALENDAR_MODIFIER_CLASSES = {
  sunday: "text-red-600 dark:text-red-400 font-medium",
  special: "after:content-['★'] after:text-yellow-500 after:absolute after:bottom-0.5 after:right-0.5 after:text-[9px]",
  today: "bg-accent text-accent-foreground font-bold rounded-full",
};

export const CALENDAR_DISABLED = (date: Date) =>
  date > new Date("2026-12-31") || date < new Date("2020-01-01");

export const DEFAULT_FORM_DATE = () => {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  return d;
};

export const CHAPTER_COUNTS: Record<string, number> = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
  Ecclesiastes: 12, "Song of Solomon": 8, Isaiah: 66, Jeremiah: 52,
  Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3, Amos: 9,
  Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3,
  Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28, Romans: 16,
  "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6, Ephesians: 6,
  Philippians: 4, Colossians: 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
  "1 Timothy": 6, "2 Timothy": 4, Titus: 3, Philemon: 1, Hebrews: 13,
  James: 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1,
  "3 John": 1, Jude: 1, Revelation: 22,
};

export const getChaptersForBook = (book: string): number[] => {
  const count = CHAPTER_COUNTS[book] || 1;
  return Array.from({ length: count }, (_, i) => i + 1);
};

export const DEFAULT_VERSE_COUNT = 31;

export const DIFFICULTY_OPTIONS = ["all", "easy", "medium", "hard"] as const;
export const CATEGORY_OPTIONS = [
  "all", "general", "old_testament", "new_testament",
  "theology", "history", "prophecy", "wisdom", "poetry",
] as const;
export const TRIVIA_PAGE_SIZE = 20;
export const SUBSCRIPTION_PAGE_SIZE = 20;
export const ACTIVITY_PAGE_SIZE = 20;
export const DEVICE_FILTERS = ["all", "mobile", "desktop", "tablet"] as const;
export const STATUS_FILTERS = ["all", "success", "failed", "online"] as const;
export const EXEGESIS_PAGE_SIZE = 20;
export const USERS_PAGE_SIZE = 20;
export const USER_SEARCH_DEBOUNCE_MS = 300;
export const USER_ROLE_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" },
  2: { label: "User", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
};
export const SUBSCRIPTION_TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400",
  supporter: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  legacy_sower: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  sower: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
};

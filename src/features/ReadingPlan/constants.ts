// ─── Reading Plan Constants ────────────────────────────────────────────────────

import { BookOpen, Calendar, CheckCircle2 } from "lucide-react";

export const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string }> = {
  easy: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  medium: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  hard: { color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
};

export const CATEGORY_LABELS: Record<string, string> = {
  intro: "intro", INTRO: "intro",
  "whole-bible": "whole-bible", WHOLE_BIBLE: "whole-bible",
  nt: "nt", NT: "nt", NEW_TESTAMENT: "nt",
  ot: "ot", OT: "ot", OLD_TESTAMENT: "ot",
  book: "book", BOOK: "book",
  topical: "topical", TOPICAL: "topical",
};

export const normalizeDifficulty = (diff: string): string => {
  const d = diff?.toUpperCase() ?? "";
  if (d === "EASY") return "easy";
  if (d === "MEDIUM") return "medium";
  if (d === "HARD") return "hard";
  return diff?.toLowerCase() ?? "medium";
};

export const normalizeCategory = (cat: string): string => {
  const c = cat?.toUpperCase() ?? "";
  if (c === "INTRO") return "intro";
  if (c === "WHOLE_BIBLE") return "whole-bible";
  if (c === "NEW_TESTAMENT") return "nt";
  if (c === "OLD_TESTAMENT") return "ot";
  if (c === "BOOK") return "book";
  if (c === "TOPICAL") return "topical";
  return cat?.toLowerCase() ?? "intro";
};

export const formatDate = (iso: string | null, locale = "en-US"): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
};

export const PLAN_STEPS = [
  { id: 1, label: "stepPlanInfo", icon: BookOpen },
  { id: 2, label: "stepDailyContent", icon: Calendar },
  { id: 3, label: "stepReviewSave", icon: CheckCircle2 },
];

export const PLAN_CATEGORIES = [
  { value: "intro", labelKey: "catIntroduction" },
  { value: "whole-bible", labelKey: "catWholeBible" },
  { value: "nt", labelKey: "catNT" },
  { value: "ot", labelKey: "catOT" },
  { value: "book", labelKey: "catSingleBook" },
  { value: "topical", labelKey: "catTopical" },
];

export const PLAN_DIFFICULTIES = [
  { value: "easy", labelKey: "diffBeginner" },
  { value: "medium", labelKey: "diffIntermediate" },
  { value: "hard", labelKey: "diffAdvanced" },
];

export const DIFF_BADGE: Record<string, string> = {
  easy: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  medium: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  hard: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40",
};

export const INPUT_CLS =
  "w-full px-3 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all shadow-sm";

export const TEXTAREA_CLS = INPUT_CLS + " resize-none";

export const CATEGORY_KEYS: Record<string, string> = {
  all: "catAll", intro: "catIntro", "whole-bible": "catWholeBible",
  nt: "catNT", ot: "catOT", book: "catBookByBook", topical: "catTopical",
};

export const DIFFICULTY_KEYS: Record<string, string> = {
  easy: "diffBeginner", medium: "diffIntermediate", hard: "diffAdvanced",
};

export const DIFFICULTY_COLOR: Record<string, { bar: string; badge: string }> = {
  easy: { bar: "bg-emerald-500", badge: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40" },
  medium: { bar: "bg-amber-500", badge: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40" },
  hard: { bar: "bg-red-500", badge: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40" },
};

export const BIBLE_BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah",
  "Esther","Job","Psalm","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum",
  "Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts",
  "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians",
  "1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

export const DIFF_STYLES: Record<string, { bar: string; badge: string }> = DIFFICULTY_COLOR;

export const DIFF_KEY: Record<string, string> = { easy: "diffEasy", medium: "diffMedium", hard: "diffHard" };

export const CATEGORY_KEY: Record<string, string> = {
  all: "catAllCategories", intro: "catIntroduction", "whole-bible": "catWholeBible",
  nt: "catNT", ot: "catOT", book: "catSingleBook", topical: "catTopical",
};

export const diffLabel = (diff: string, t: any): string => {
  const key = DIFF_KEY[diff];
  return key ? (t.readingPlan as Record<string, string>)[key] ?? diff : diff;
};

export const catLabel = (cat: string, t: any): string => {
  const key = CATEGORY_KEY[cat];
  return key ? (t.readingPlan as Record<string, string>)[key] ?? cat : cat;
};

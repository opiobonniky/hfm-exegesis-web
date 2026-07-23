import {
  MessageSquare,
  BookOpen,
  Search,
  BookText,
  Languages,
  ListOrdered,
  Tags,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ResourceTab {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export const RESOURCE_TABS: ResourceTab[] = [
  {
    key: "commentaries",
    label: "Commentaries",
    icon: MessageSquare,
    color: "#4F6EF7",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "crossReferences",
    label: "Cross References",
    icon: BookOpen,
    color: "#0EA5E9",
    borderColor: "border-l-sky-500",
    bgColor: "bg-sky-500/10",
    textColor: "text-sky-600 dark:text-sky-400",
  },
  {
    key: "wordStudies",
    label: "Word Studies",
    icon: Search,
    color: "#8B5CF6",
    borderColor: "border-l-violet-500",
    bgColor: "bg-violet-500/10",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "dictionary",
    label: "Dictionary",
    icon: BookText,
    color: "#10B981",
    borderColor: "border-l-emerald-500",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "translations",
    label: "Translations",
    icon: Languages,
    color: "#F59E0B",
    borderColor: "border-l-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "interlinear",
    label: "Interlinear",
    icon: ListOrdered,
    color: "#EC4899",
    borderColor: "border-l-pink-500",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-600 dark:text-pink-400",
  },
  {
    key: "topics",
    label: "Topics",
    icon: Tags,
    color: "#6366F1",
    borderColor: "border-l-indigo-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
];

export const STUDY_TOOL_LABELS: Record<string, string> = {
  COMMAND: "Command",
  PROMISE: "Promise",
  WARNING: "Warning",
  REPEATED_WORD: "Repeated Word",
  TRANSITION: "Transition",
  CONTRAST: "Contrast",
};

export const STUDY_TOOL_COLORS: Record<string, string> = {
  COMMAND: "#4F6EF7",
  PROMISE: "#10B981",
  WARNING: "#F59E0B",
  REPEATED_WORD: "#8B5CF6",
  TRANSITION: "#0EA5E9",
  CONTRAST: "#EC4899",
};

export const BIBLE_BOOKS_OT = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
];

export const BIBLE_BOOKS_NT = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];

export const BOOK_PROLOGUE_PAGE_SIZE = 12;

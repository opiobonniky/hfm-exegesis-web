import {
  BookOpen,
  BookText,
  GitFork,
  Languages,
  Lightbulb,
  ListOrdered,
  MessageSquare,
  Search,
  Tags,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * A single study section of the Verse Resources page. The reader shows one
 * section at a time, so each one carries the copy needed to introduce itself
 * when empty.
 */
export interface ResourceSection {
  id: string;
  /** Rail label. */
  label: string;
  /** Full heading shown above the section content. */
  heading: string;
  /** One-line explanation of what the section offers. */
  description: string;
  /** Shown when this section has no content for the verse. */
  emptyHint: string;
  icon: LucideIcon;
  color: string;
}

export const RESOURCE_SECTIONS: ResourceSection[] = [
  {
    id: "explanation",
    label: "Explanation",
    heading: "Verse Explanation",
    description: "What this verse means, its background, and how to live it out.",
    emptyHint: "No written explanation has been added for this verse yet.",
    icon: Lightbulb,
    color: "#4F6EF7",
  },
  {
    id: "commentaries",
    label: "Commentaries",
    heading: "Commentaries",
    description: "Insight from trusted Bible teachers and expositors.",
    emptyHint: "No commentaries have been added for this verse yet.",
    icon: MessageSquare,
    color: "#2563EB",
  },
  {
    id: "crossReferences",
    label: "Cross Refs",
    heading: "Cross References",
    description: "Other passages that echo, explain, or fulfil this verse.",
    emptyHint: "No cross references have been linked to this verse yet.",
    icon: GitFork,
    color: "#0EA5E9",
  },
  {
    id: "wordStudies",
    label: "Words",
    heading: "Word Studies",
    description: "The original-language words behind the translation.",
    emptyHint: "No word studies have been added for this verse yet.",
    icon: Search,
    color: "#8B5CF6",
  },
  {
    id: "dictionary",
    label: "Dictionary",
    heading: "Bible Dictionary",
    description: "Terms, places, and ideas worth knowing in this verse.",
    emptyHint: "No dictionary entries have been added for this verse yet.",
    icon: BookText,
    color: "#10B981",
  },
  {
    id: "translations",
    label: "Translations",
    heading: "Translation Comparison",
    description: "The same verse across the translations you can read.",
    emptyHint: "No translation comparison is available for this verse.",
    icon: Languages,
    color: "#F59E0B",
  },
  {
    id: "interlinear",
    label: "Interlinear",
    heading: "Interlinear",
    description: "Word-by-word original text with Strong's tagging.",
    emptyHint: "No interlinear data is available for this verse.",
    icon: ListOrdered,
    color: "#EC4899",
  },
  {
    id: "topics",
    label: "Themes",
    heading: "Themes & Topics",
    description: "The big ideas this verse carries through Scripture.",
    emptyHint: "No themes have been tagged on this verse yet.",
    icon: Tags,
    color: "#6366F1",
  },
  {
    id: "verseReferences",
    label: "Occurrences",
    heading: "Where Else It Appears",
    description: "Other verses that use the same original-language words.",
    emptyHint: "No shared-word references are indexed for this verse yet.",
    icon: BookOpen,
    color: "#14B8A6",
  },
  {
    id: "studyTools",
    label: "Study Tools",
    heading: "Chapter Study Tools",
    description: "Commands, promises, warnings, and patterns in this chapter.",
    emptyHint: "No study tools have been tagged for this verse yet.",
    icon: Wrench,
    color: "#F97316",
  },
  {
    id: "prologue",
    label: "Book Context",
    heading: "Book Context",
    description: "Author, setting, and purpose of the book you are reading.",
    emptyHint: "No book introduction is available yet.",
    icon: BookOpen,
    color: "#8B5CF6",
  },
];

export const DEFAULT_RESOURCE_SECTION = "explanation";

/**
 * True when a section is known to have no content and should be hidden from
 * pickers (verse menu, section rail, pager). `null`/`undefined` counts mean
 * "not known yet or not counted" — those always stay visible so entries never
 * pop in or out after the data loads.
 */
export function sectionHasContent(count: number | null | undefined): boolean {
  return count !== 0;
}

/** Resolve a raw `?tab=` value to a real section id. */
export function resolveSectionId(value: string | null | undefined): string {
  if (!value) return DEFAULT_RESOURCE_SECTION;
  return RESOURCE_SECTIONS.some((section) => section.id === value)
    ? value
    : DEFAULT_RESOURCE_SECTION;
}

export function getResourceSection(id: string): ResourceSection {
  return (
    RESOURCE_SECTIONS.find((section) => section.id === id) ||
    RESOURCE_SECTIONS[0]
  );
}

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

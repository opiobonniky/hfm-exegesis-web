// ─── Admin Book Prologue Editor Constants ─────────────────────────────────────
// Shared constants for the add/edit book prologue single-page editor
// (modeled after the DailyContent AddExplanation flow).

import type { PrologueStepId } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

export const PROLOGUE_STEP_ORDER = [
  "basic",
  "context",
  "themes",
  "extra",
] as const;

export const PROLOGUE_STEPS: { id: PrologueStepId; label: string; description: string }[] = [
  { id: "basic", label: tt("Basic"), description: tt("Book, title & overview") },
  { id: "context", label: tt("Context"), description: tt("Author & historical setting") },
  { id: "themes", label: tt("Themes"), description: tt("Themes, people & lessons") },
  { id: "extra", label: tt("Extra"), description: tt("Scripture & applications") },
];

export const PROLOGUE_CONTENT_MAX = 20000;

// Full empty form matching the editor's accepted shape.
export const PROLOGUE_FORM_EMPTY = {
  bookName: "",
  title: "",
  content: "",
  author: "",
  authorDetail: "",
  audience: "",
  dateWritten: "",
  locationWritten: "",
  purpose: "",
  keyTheme: "",
  summary: "",
  background: "",
  lessons: "",
  chapters: "",
  christConnection: "",
  applications: [] as string[],
  keyScriptures: [] as { bookName: string; chapter: number | null; verse: number | null; translation: string; reference: string; text: string }[],
  mainThemes: [] as string[],
  keyPeople: [] as string[],
  keyVerses: [] as string[],
  isPublished: true,
};

export const PROLOGUE_TRANSLATIONS = [
  { id: "Berean", label: tt("Berean Standard Bible (BSB)") },
  { id: "KJV", label: tt("King James Version (KJV)") },
  { id: "NIV", label: tt("New International Version (NIV)") },
  { id: "ESV", label: tt("English Standard Version (ESV)") },
  { id: "NASB", label: tt("New American Standard Bible (NASB)") },
] as const;

export const ADMIN_BOOK_PROLOGUE_EMPTY_FORM = {
  bookName: "",
  title: "",
  summary: "",
  purpose: "",
  keyTheme: "",
  author: "",
  authorDetail: "",
  audience: "",
  dateWritten: "",
  locationWritten: "",
  background: "",
  lessons: "",
  chapters: "",
  christConnection: "",
  applications: [] as string[],
  keyScriptureRef: [] as string[],
  keyScriptureText: [] as string[],
  mainThemes: [] as string[],
  keyPeople: [] as string[],
  keyVerses: [] as string[],
  content: "",
  isPublished: true,
};

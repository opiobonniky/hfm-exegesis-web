// ─── Admin Book Prologue Editor Constants ─────────────────────────────────────
// Shared constants for the add/edit book prologue single-page editor
// (modeled after the DailyContent AddExplanation flow).

import type { PrologueStepId } from "../types";

export const PROLOGUE_STEP_ORDER = [
  "basic",
  "context",
  "themes",
  "extra",
] as const;

export const PROLOGUE_STEPS: { id: PrologueStepId; label: string; description: string }[] = [
  { id: "basic", label: "Basic", description: "Book, title & overview" },
  { id: "context", label: "Context", description: "Author & historical setting" },
  { id: "themes", label: "Themes", description: "Themes, people & lessons" },
  { id: "extra", label: "Extra", description: "Scripture & applications" },
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

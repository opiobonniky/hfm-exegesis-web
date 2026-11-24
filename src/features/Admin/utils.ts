// ─── Admin Feature Helpers ─────────────────────────────────────────────────────
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";
import type { DailyItem } from "./types";
import type { ContentType } from "./constants";
import { API_ACTIONS, DELETE_ID_KEY, CHAPTER_COUNTS, DEFAULT_VERSE_COUNT } from "./constants";

export const getChaptersForBook = (book: string): number[] => {
  const count = CHAPTER_COUNTS[book] || 1;
  return Array.from({ length: count }, (_, i) => i + 1);
};

/**
 * URL for the verse-explanation detail page.
 *
 * The passage is intentionally NOT part of the path: opening a row keeps the
 * URL at `/admin/verse-explanations/detail` and passes the reference in router
 * state, so book names never leak into the address bar. Keep this in sync with
 * `routes.verseExplanationDetail.path`.
 */
export const VERSE_EXPLANATION_DETAIL_PATH = "/admin/verse-explanations/detail";

export interface VerseExplanationDetailLocationState {
  id?: number | string | null;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseEnd?: number | null;
  /** Position in the list the reader came from, used to restore it on Back. */
  index?: number;
}

export const verseExplanationDetailState = (
  item: {
    id?: number | string | null;
    bookName: string;
    chapter: number | string;
    verseNumber: number | string;
    verseEnd?: number | string | null;
  },
  index?: number,
): VerseExplanationDetailLocationState => ({
  id: item.id ?? null,
  bookName: item.bookName,
  chapter: Number(item.chapter),
  verseNumber: Number(item.verseNumber),
  verseEnd: item.verseEnd == null || item.verseEnd === '' ? null : Number(item.verseEnd),
  ...(typeof index === 'number' && index >= 0 ? { index } : {}),
});

export interface VerseExplanationListRestoreState {
  restoreId?: number | string | null;
  restoreIndex?: number;
}

/**
 * Journal moderation detail is also state-driven: the moderation list passes
 * the entry id, so `/admin/journal-moderation/42` never appears in the URL.
 */
export const JOURNAL_MODERATION_DETAIL_PATH = "/admin/journal-moderation/detail";

export interface JournalEntryDetailLocationState {
  id: number | string;
}

export const journalEntryDetailState = (item: {
  id: number | string;
}): JournalEntryDetailLocationState => ({ id: item.id });

// Versions an admin can attach that are not bundled with the reader. Keep the
// long names here so the detail/list pages never surface a bare "BSB".
const EXTRA_VERSION_NAMES: Record<string, string> = {
  NIV: "New International Version",
  ESV: "English Standard Version",
  NASB: "New American Standard Bible",
  NKJV: "New King James Version",
  NLT: "New Living Translation",
  CSB: "Christian Standard Bible",
  HCSB: "Holman Christian Standard Bible",
  AMP: "Amplified Bible",
  MSG: "The Message",
  RSV: "Revised Standard Version",
  NRSV: "New Revised Standard Version",
  NET: "NET Bible",
  GNT: "Good News Translation",
  CEV: "Contemporary English Version",
};

/** Full, human-readable name for a stored Bible version id/abbreviation. */
export const bibleVersionFullName = (version?: string | null): string => {
  const raw = String(version || "").trim();
  if (!raw) return BIBLE_VERSIONS[0]?.name || "Berean Standard Bible";
  const key = raw.toUpperCase() === "BEREAN" ? "BSB" : raw.toUpperCase();
  const bundled = BIBLE_VERSIONS.find(
    entry => entry.id.toUpperCase() === key || entry.abbreviation.toUpperCase() === key,
  );
  return bundled?.name || EXTRA_VERSION_NAMES[key] || raw;
};

export const getVersesCountForChapter = (_book: string, _chapter: number): number =>
  DEFAULT_VERSE_COUNT;

export const getAction = (type: ContentType, action: string): string =>
  API_ACTIONS.getAction(type, action);

export const getDeleteIdKey = (type: ContentType): string =>
  DELETE_ID_KEY[type];

export const buildVersePayload = (form: {
  formBook: string;
  formChapter: string;
  formVerse: string;
  formExplanation: string;
  formReflection: string;
  formLearnMore: string;
  formDate: Date;
  formPublished: boolean;
  editItem?: DailyItem | null;
}): Record<string, any> => ({
  ...(form.editItem?.id ? { id: form.editItem.id } : {}),
  isPublished: form.formPublished,
  displayDate: form.formDate.toISOString().split("T")[0],
  bookName: form.formBook,
  chapter: Number(form.formChapter),
  verseNumber: Number(form.formVerse),
  explanation: form.formExplanation,
  reflection: form.formReflection || null,
  learnMore: form.formLearnMore || null,
});

export const buildDevotionPayload = (form: {
  formTitle: string;
  formContent: string;
  formBook?: string;
  formChapter?: string;
  formVerse?: string;
  formDate: Date;
  formPublished: boolean;
  editItem?: DailyItem | null;
}): Record<string, any> => ({
  ...(form.editItem?.id ? { id: form.editItem.id } : {}),
  isPublished: form.formPublished,
  title: form.formTitle,
  content: form.formContent,
  bookName: form.formBook || null,
  chapter: form.formChapter ? Number(form.formChapter) : null,
  verseNumber: form.formVerse ? Number(form.formVerse) : null,
  displayTime: form.formDate.toISOString(),
});

export const buildExegesisPayload = (form: {
  formPassageRef: string;
  formIntro: string;
  formContextSummary: string;
  formTeachingBody: string;
  formApplication: string;
  formPrayer: string;
  formTags: string;
  formDate: Date;
  formPublished: boolean;
  editItem?: DailyItem | null;
}): Record<string, any> => ({
  ...(form.editItem?.id ? { id: form.editItem.id } : {}),
  isPublished: form.formPublished,
  passageReference: form.formPassageRef,
  introduction: form.formIntro || null,
  contextSummary: form.formContextSummary || null,
  teachingBody: form.formTeachingBody,
  application: form.formApplication || null,
  prayer: form.formPrayer || null,
  tags: form.formTags || null,
  displayDate: form.formDate.toISOString().split("T")[0],
});

export const buildPayload = (type: ContentType, form: any): Record<string, any> => {
  if (type === "verse") return buildVersePayload(form);
  if (type === "devotion") return buildDevotionPayload(form);
  return buildExegesisPayload(form);
};

export const isVerseFormValid = (form: {
  formBook: string;
  formChapter: string;
  formVerse: string;
  formExplanation: string;
}): boolean =>
  Boolean(form.formBook && form.formChapter && form.formVerse && form.formExplanation.trim());

export const isDevotionFormValid = (form: {
  formTitle: string;
  formContent: string;
}): boolean =>
  Boolean(form.formTitle.trim() && form.formContent.trim());

export const isExegesisFormValid = (form: {
  formTitle: string;
  formTeachingBody: string;
}): boolean =>
  Boolean(form.formTitle.trim() && form.formTeachingBody.trim());

export const isFormValid = (type: ContentType, form: any): boolean => {
  if (type === "verse") return isVerseFormValid(form);
  if (type === "devotion") return isDevotionFormValid(form);
  return isExegesisFormValid(form);
};

export const dateToTimeString = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const READABLE_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
];

export const formatReadableDate = (
  input: string | Date | null | undefined,
): string => {
  if (!input) return "—";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "—";
  const month = READABLE_MONTHS[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
};

export const applyTimeToDate = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return date;
  const nd = new Date(date);
  nd.setHours(hours, minutes, 0, 0);
  return nd;
};

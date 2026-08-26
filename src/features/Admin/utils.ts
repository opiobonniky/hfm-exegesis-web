// ─── Admin Feature Helpers ─────────────────────────────────────────────────────
import type { DailyItem } from "./types";
import type { ContentType } from "./constants";
import { API_ACTIONS, DELETE_ID_KEY, CHAPTER_COUNTS, DEFAULT_VERSE_COUNT } from "./constants";

export const getChaptersForBook = (book: string): number[] => {
  const count = CHAPTER_COUNTS[book] || 1;
  return Array.from({ length: count }, (_, i) => i + 1);
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

export const applyTimeToDate = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return date;
  const nd = new Date(date);
  nd.setHours(hours, minutes, 0, 0);
  return nd;
};

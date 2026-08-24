// ─── Admin Feature Helpers ─────────────────────────────────────────────────────
import type { ContentType, DailyItem } from "./types";
import { API_ACTIONS, DELETE_ID_KEY, CHAPTER_COUNTS, DEFAULT_VERSE_COUNT } from "./constants";

// ─── Verse helpers ────────────────────────────────────────────────────────────
/** Get chapter list for a Bible book */
export const getChaptersForBook = (book: string): number[] => {
  const count = CHAPTER_COUNTS[book] || 1;
  return Array.from({ length: count }, (_, i) => i + 1);
};
/** Get verse count for a chapter (uses default when book-specific data unavailable) */
export const getVersesCountForChapter = (_book: string, _chapter: number): number =>
  DEFAULT_VERSE_COUNT;
// ─── API action helpers ───────────────────────────────────────────────────────
/** Build API action name for content type + CRUD operation */
export const getAction = (type: ContentType, action: string): string =>
  API_ACTIONS.getAction(type, action);
/** Get the delete ID key for a content type */
export const getDeleteIdKey = (type: ContentType): string =>
  DELETE_ID_KEY[type];
// ─── Payload builders ─────────────────────────────────────────────────────────
/** Build save payload for verse content */
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
/** Build save payload for devotion content */
export const buildDevotionPayload = (form: {
  formTitle: string;
  formContent: string;
  title: form.formTitle,
  content: form.formContent,
  bookName: form.formBook || null,
  chapter: form.formChapter ? Number(form.formChapter) : null,
  verseNumber: form.formVerse ? Number(form.formVerse) : null,
  displayTime: form.formDate.toISOString(),
/** Build save payload for exegesis content */
export const buildExegesisPayload = (form: {
  formPassageRef: string;
  formIntro: string;
  formContextSummary: string;
  formTeachingBody: string;
  formApplication: string;
  formPrayer: string;
  formTags: string;
  passageReference: form.formPassageRef,
  introduction: form.formIntro || null,
  contextSummary: form.formContextSummary || null,
  teachingBody: form.formTeachingBody,
  application: form.formApplication || null,
  prayer: form.formPrayer || null,
  tags: form.formTags || null,
/** Build the save payload based on content type */
export const buildPayload = (type: ContentType, form: any): Record<string, any> => {
  if (type === "verse") return buildVersePayload(form);
  if (type === "devotion") return buildDevotionPayload(form);
  return buildExegesisPayload(form);
// ─── Form validation helpers ──────────────────────────────────────────────────
/** Check if verse form is valid */
export const isVerseFormValid = (form: {
}): boolean =>
  Boolean(form.formBook && form.formChapter && form.formVerse && form.formExplanation.trim());
/** Check if devotion form is valid */
export const isDevotionFormValid = (form: {
  Boolean(form.formTitle.trim() && form.formContent.trim());
/** Check if exegesis form is valid */
export const isExegesisFormValid = (form: {
  Boolean(form.formTitle.trim() && form.formTeachingBody.trim());
/** Get form validity based on content type */
export const isFormValid = (type: ContentType, form: any): boolean => {
  if (type === "verse") return isVerseFormValid(form);
  if (type === "devotion") return isDevotionFormValid(form);
  return isExegesisFormValid(form);
// ─── Time/date helpers ────────────────────────────────────────────────────────
/** Sync time string from Date */
export const dateToTimeString = (date: Date): string =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
/** Apply time string to Date */
export const applyTimeToDate = (date: Date, time: string): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return date;
  const nd = new Date(date);
  nd.setHours(hours, minutes, 0, 0);
  return nd;

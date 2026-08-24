// ─── Daily Content Types ───────────────────────────────────────────────────────

// ─── Daily Verse Types ─────────────────────────────────────────────────────────
export interface DailyVerseItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion?: string;
  verseText?: string | null;
  displayDate: string | Record<string, never>;
  displayTime: string | Record<string, never>;
  reflection?: string | null;
  explanation?: string | null;
  learnMore?: string | null;
  /** Rich content fields — match app */
  application?: string | null;
  verseIntroduction?: string | null;
  backgroundAuthor?: string | null;
  backgroundBook?: string | null;
  backgroundContext?: string | null;
  wordStudies?: string | null;
  practicalApplications?: string | null;
  keyThemes?: string | null;
  crossReferences?: string | null;
  finalThoughts?: string | null;
  takeaways?: string | null;
  createdBy: string;
  createdOn: string | Record<string, never>;
  updatedBy: string | null;
  updatedOn: string | Record<string, never>;
  isPublished: boolean;
}
/** Fields sent to backend add/update-daily-verse */
export interface DailyVersePayload {
  id?: number;
  bibleVersion: string;
  displayDate: string;
  displayTime?: string;
  explanation: string;
  learnMore?: string;
  application: string;
  verseIntroduction: string;
  backgroundAuthor?: string;
  backgroundBook?: string;
  backgroundContext?: string;
  wordStudies?: string;
  practicalApplications?: string;
  keyThemes?: string;
  crossReferences?: string;
  finalThoughts?: string;
  takeaways?: string;
  published: boolean;
export interface DailyVerseResponse {
  content: DailyVerseItem[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
export interface EditState {
  chapter: string;
  verseNumber: string;
  reflection: string;
  learnMore: string;
export const EMPTY_EDIT: EditState = {
  bookName: "", chapter: "", verseNumber: "", bibleVersion: "BSB",
  explanation: "", reflection: "", learnMore: "",
  application: "", verseIntroduction: "",
  displayDate: new Date().toISOString().split("T")[0], isPublished: true,
};
// ─── Daily Devotion Types ──────────────────────────────────────────────────────
export interface DailyDevotionItem {
  title: string;
  content: string;
  bookName?: string | null;
  chapter?: number | null;
  verseNumber?: number | null;
  bibleVersion?: string | null;
export interface DailyDevotionResponse {
  content: DailyDevotionItem[];
// ─── Daily Exegesis Types ──────────────────────────────────────────────────────
export interface DailyExegesisItem {
  passage: string;
  introduction: string;
  context: string;
  teaching: string;
  prayer: string;
  tags: string[];
export interface DailyExegesisResponse {
  content: DailyExegesisItem[];
// ─── Verse Explanation Types ───────────────────────────────────────────────────
export interface VerseExplanationItem {
  book: string;
export interface VerseExplanationResponse {
  content: VerseExplanationItem[];

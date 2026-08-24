// ─── Bible Types ───────────────────────────────────────────────────────────────

export interface BookInfo {
  abbreviation: string;
  name: string;
  testament: "OT" | "NT";
  chapters: number;
  group: string;
}
/** Library book info — used in BibleLibrary */
export interface LibraryBookInfo {
  bookNumber: number;
  bookName: string;
  testament: string;
  chaptersCount: number;
  totalVerses: number;
export interface BibleVersion {
  language: string;
  isAvailable: boolean;
export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
export interface BibleVerse {
  verse: number;
  text: string;
export interface Highlight {
  id: number;
  verseNumber: number;
  colorId: number;
  note?: string;
  createdOn: string;
export interface Note {
  note: string;
export interface Favorite {
export interface ReadHistoryItem {
// ─── Verse Explanation ─────────────────────────────────────────────────────────
export interface VerseExplanation {
  explanation: string;
  learnMore: string;
  bibleVersion?: string;
  updatedOn?: string;
// ─── Resource ─────────────────────────────────────────────────────────────────
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: "article" | "video" | "commentary";
  url?: string;
  source?: string;
// ─── Translation ──────────────────────────────────────────────────────────────
export interface Translation {
// ─── Filter / Tab Types ──────────────────────────────────────────────────────
export type CovenantFilter = "all" | "ot" | "nt";
export type ActivityType = "all" | "highlights" | "notes" | "favorites" | "history";
export type TabKey = "commentaries" | "crossReferences" | "wordStudies" | "dictionary" | "translations" | "interlinear" | "topics";

// ─── Lab Types ─────────────────────────────────────────────────────────────────

export interface ExegesisSession {
  id: string;
  status: "look" | "listen" | "learn" | "abide" | "completed" | "abandoned";
  book: string;
  chapter: number;
  verse: number;
  verseRef?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  lookNotes?: string;
  listenNotes?: string;
  learnNotes?: string;
  abideNotes?: string;
}
export interface StageMeta {
  key: "look" | "listen" | "learn" | "abide";
  icon: string;
  label: string;
  desc: string;
  color: string;
  tagline: string;
  time: string;
export interface SuggestedPassage {
  ref: string;
// ─── Dictionary Types ─────────────────────────────────────────────────────────
export interface WordResult {
  strongsId: string;
  originalWord: string;
  transliteration: string;
  shortDefinition: string;
  fullDefinition: string;
  partOfSpeech: string;
  language: string;

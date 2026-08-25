// ─── Bible Types ───────────────────────────────────────────────────────────────

export interface BookInfo {
  abbreviation: string;
  name: string;
  testament: "OT" | "NT";
  chapters: number;
  group: string;
}

export interface LibraryBookInfo {
  bookNumber: number;
  bookName: string;
  testament: string;
  chaptersCount: number;
  totalVerses: number;
}

export interface BibleVersion {
  id: string;
  abbreviation: string;
  name: string;
  language: string;
  isAvailable: boolean;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface Highlight {
  id: number;
  verseNumber: number;
  colorId: number;
  note?: string;
  createdOn: string;
}

export interface Note {
  id: number;
  verseNumber: number;
  note: string;
}

export interface Favorite {
  id: number;
  verseNumber: number;
  createdOn: string;
}

export interface ReadHistoryItem {
  book: string;
  chapter: number;
  lastRead: string;
}

export interface VerseExplanation {
  id?: number;
  explanation: string;
  learnMore: string;
  bibleVersion?: string;
  updatedOn?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: "article" | "video" | "commentary";
  url?: string;
  source?: string;
}

export interface Translation {
  id: string;
  name: string;
  abbreviation: string;
}

export type CovenantFilter = "all" | "ot" | "nt";
export type ActivityType = "all" | "highlights" | "notes" | "favorites" | "history";
export type TabKey = "commentaries" | "crossReferences" | "wordStudies" | "dictionary" | "translations" | "interlinear" | "topics";

// ─── Daily Content Types ───────────────────────────────────────────────────────

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

export interface DailyVersePayload {
  id?: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion: string;
  verseText?: string | null;
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
}

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
}

export interface EditState {
  testament?: string;
  book?: string;
  bookName: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  verseText?: string;
  explanation: string;
  reflection: string;
  learnMore: string;
  application: string;
  verseIntroduction: string;
  displayDate: string;
  isPublished: boolean;
}

export const EMPTY_EDIT: EditState = {
  bookName: "", chapter: "", verseNumber: "", bibleVersion: "BSB",
  explanation: "", reflection: "", learnMore: "",
  application: "", verseIntroduction: "",
  displayDate: new Date().toISOString().split("T")[0], isPublished: true,
};

export interface DailyDevotionItem {
  id: number;
  title: string;
  content: string;
  displayDate: string;
  bookName?: string | null;
  chapter?: number | null;
  verseNumber?: number | null;
  bibleVersion?: string | null;
  isPublished: boolean;
}

export interface DailyDevotionDetailData extends DailyDevotionItem {
  explanation?: string | null;
  application?: string | null;
  verseIntroduction?: string | null;
  learnMore?: string | null;
  backgroundAuthor?: string | null;
  backgroundBook?: string | null;
  backgroundContext?: string | null;
  wordStudies?: string | null;
  practicalApplications?: string | null;
  keyThemes?: string | null;
  crossReferences?: string | null;
  finalThoughts?: string | null;
  takeaways?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
}

export interface DailyDevotionResponse {
  content: DailyDevotionItem[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface DailyExegesisItem {
  id: number;
  passageReference: string;
  introduction: string;
  contextSummary: string;
  teachingBody: string;
  application: string;
  prayer: string;
  tags: string | null;
  displayDate: string;
  isPublished: boolean;
}

export interface DailyExegesisResponse {
  content: DailyExegesisItem[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface VerseExplanationItem {
  id: number;
  book: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
  learnMore?: string;
  displayDate: string;
  isPublished: boolean;
}

export interface VerseExplanationResponse {
  content: VerseExplanationItem[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// ── Page-level types (used by DailyExegesis, DailyDevotions, etc.) ──

export interface DailyExegesisFull {
  id: number;
  title: string;
  passageReference: string;
  introduction: string;
  contextSummary: string;
  teachingBody: string;
  application: string;
  prayer: string;
  tags: string;
  displayDate: string;
  createdOn: string;
  isPublished: boolean;
}

export interface DailyExegesisSeriesItem {
  id: number;
  title: string;
  displayDate: string;
}

export type VerseExplanationStepId = "reference" | "exegesis" | "study" | "extras";

export interface VerseExplanationStep {
  id: VerseExplanationStepId;
  label: string;
  description: string;
}

export interface DevotionPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}

export interface DevotionPaginationLabels {
  page: string;
  of: string;
  results: string;
}

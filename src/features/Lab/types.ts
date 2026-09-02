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
}

export interface SuggestedPassage {
  ref: string;
  description: string;
}

export interface WordResult {
  strongsId: string;
  originalWord: string;
  transliteration: string;
  shortDefinition: string;
  fullDefinition: string;
  partOfSpeech: string;
  language: string;
}

export interface LabSession {
  id: string;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  passageRef?: string;
  currentStage: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  createdOn?: string;
  updatedOn?: string;
}

export type LabDictionaryMode = "search" | "browse" | "verse";
export type LabChartMode = "frequency" | "partOfSpeech";

export interface LabChartItem {
  word: string;
  count: number;
  language?: string;
  strongsId?: string;
}

// ─── LabFlow types ──────────────────────────────────────────────────────────────
export type LabStage = "passage" | "look" | "listen" | "learn" | "abide" | "apply" | "completed";
export type PassageSubStage = "book" | "chapter" | "verse";
export type LearnTab = "exegesis" | "language" | "history" | "prologue";

export interface LabFlowState {
  sessionId: string | null;
  stage: LabStage;
  completed: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;
  bookName: string;
  chapter: string;
  verseStart: string;
  verseEnd: string;
  passageRef: string;
  lookNotes: string;
  currentPromptIdx: number;
  selectedRepeats: number;
  repeatCount: number;
  listenComplete: boolean;
  learnNotes: string;
  learnTab: LearnTab;
  learnDataLoading: boolean;
  reflection: string;
  prayer: string;
  appText: string;
  tags: string;
  isPublic: boolean;
  journalEntryId: string | null;
  challengeText: string;
  resultsText: string;
}

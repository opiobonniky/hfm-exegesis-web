// ─── Journal Types ─────────────────────────────────────────────────────────────

export interface StudiedWord {
  strongsId: string;
  surfaceText: string;
  lemma?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  verseReference: string;
  verseText?: string;
  words: StudiedWord[];
  tags: string[];
  mood: string;
  isPrivate: boolean;
  userId: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalListItem {
  id: number;
  title: string | null;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  category: string;
  mood: string | null;
  isPublished: boolean;
  isFavorite: boolean;
  tags: string | null;
  createdOn: string;
}

export interface JournalTemplate {
  id?: number;
  name: string;
  description: string;
  fields: JournalTemplateField[];
  isPublic: boolean;
  createdBy: string;
}

export interface JournalTemplateField {
  type: "text" | "textarea" | "select";
  label?: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export interface JournalPrompt {
  id?: number;
  text: string;
  difficulty: string;
  isActive: boolean;
}

export interface JournalStats {
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  longestStreak: number;
  averageWordsPerEntry: number;
  lastEntryDate: string | null;
}

export interface JournalEntryFormData {
  id?: number;
  title: string;
  content: string;
  bookName: string;
  chapter: string;
  verseNumber: string;
  category: string;
  mood: string;
  prayers: string;
  gratitude: string;
  learnings: string;
  application: string;
  isFavorite: boolean;
  isPublished: boolean;
  tags: string;
}

export const DEFAULT_ENTRY_FORM: JournalEntryFormData = {
  title: "", content: "", bookName: "", chapter: "", verseNumber: "",
  category: "general", mood: "", prayers: "", gratitude: "",
  learnings: "", application: "", isFavorite: false, isPublished: false, tags: "",
};

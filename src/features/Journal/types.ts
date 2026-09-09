// ─── Journal Types ─────────────────────────────────────────────────────────────
import type { ComponentType } from "react";
import type { Translations } from "@/components/languages/type";

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
  favoriteCount?: number;
  entriesThisWeek?: number;
  entriesThisMonth?: number;
}

export interface JournalDetailEntry {
  id: number;
  userId: string;
  title: string | null;
  content: string | null;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  category: string;
  mood: string | null;
  prayers: string | null;
  gratitude: string | null;
  learnings: string | null;
  application: string | null;
  isPublished: boolean;
  isFavorite: boolean;
  tags: string | null;
  strongsWords?: string | null;
  createdOn: string;
  updatedOn: string;
}

export interface JournalDetailCategoryMeta {
  labelKey: string;
  label: string;
  color: string;
}

export interface JournalDetailMoodInfo {
  label: string;
  emoji: string;
}

export interface JournalDetailReflectionSection {
  key: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  subtitle: string;
  content: string;
  iconColor: string;
}

export interface JournalDetailSelectedWord {
  strongsId: string;
  surfaceText: string;
}

export interface JournalDetailPageData {
  t: Translations;
  isRtl: boolean;
  entry: JournalDetailEntry | null;
  loading: boolean;
  deleting: boolean;
  showDeleteDialog: boolean;
  copied: boolean;
  exporting: boolean;
  updatingFavorite: boolean;
  studiedWordSheetOpen: boolean;
  selectedStudiedWord: JournalDetailSelectedWord | null;
  isOwner: boolean;
  catMeta: JournalDetailCategoryMeta;
  moodInfo: JournalDetailMoodInfo | null;
  tagsArray: string[];
  reflectionSections: JournalDetailReflectionSection[];
}

export interface JournalDetailPageActions {
  goBack: () => void;
  handleEdit: () => void;
  handleShare: () => Promise<void>;
  handleCopy: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleExportPdf: () => Promise<void>;
  handleToggleFavorite: () => Promise<void>;
  openDeleteDialog: () => void;
  closeDeleteDialog: () => void;
  handleDeleteDialogChange: (open: boolean) => void;
  handleStudiedWordSheetChange: (open: boolean) => void;
  openWordStudy: (strongsId: string, surfaceText: string) => void;
  formatDate: (date: string) => string;
  formatDateShort: (date: string) => string;
}

export type JournalDetailPageModel = {
  data: JournalDetailPageData;
  actions: JournalDetailPageActions;
};

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

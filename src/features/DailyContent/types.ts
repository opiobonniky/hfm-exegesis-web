// ─── Daily Content Types ───────────────────────────────────────────────────────
import type { FormEventHandler, ReactElement, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface DailyVerseItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion?: string;
  verseText?: string | null;
  text?: string | null;
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
  bookName: "",
  chapter: "",
  verseNumber: "",
  bibleVersion: "BSB",
  explanation: "",
  reflection: "",
  learnMore: "",
  application: "",
  verseIntroduction: "",
  displayDate: new Date().toISOString().split("T")[0],
  isPublished: true,
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

export interface GuidedTabProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export interface GuidedTabsProps {
  children: ReactElement<GuidedTabProps>[];
  validateStep: (step: number) => boolean;
  continueLabel?: string;
  backLabel?: string;
}

export interface DailyExegesisPageData {
  isRtl: boolean;
  loading: boolean;
  error: string | null;
  item: DailyExegesisFull;
  series: DailyExegesisFull[];
  displayDate: string;
  isUpcoming: boolean;
  canOpenBible: boolean;
  t: {
    dailyExegesis?: {
      title?: string;
      subtitle?: string;
    };
  };
  title: string;
  subtitle: string;
}

export interface DailyExegesisPageActions {
  refresh: () => void;
  goBack: () => void;
  openInBible: () => void;
  saveToLedger: () => void;
  selectSeriesItem: (item: DailyExegesisFull) => void;
}

export interface DailyExegesisPageLayoutProps {
  isRtl: boolean;
  children: ReactNode;
}

export interface DailyExegesisLayoutProps {
  children: ReactNode;
}

export interface ExegesisHeaderProps {
  onBack: () => void;
  title: string;
  subtitle: string;
}

export interface ExegesisHeroProps {
  item: DailyExegesisFull;
  series: DailyExegesisFull[];
  onSelect: (item: DailyExegesisFull) => void;
  onOpenBible: () => void;
  displayDate: string;
  isUpcoming: boolean;
  canOpenBible: boolean;
}

export interface ExegesisContentProps {
  item: Pick<DailyExegesisFull, "introduction" | "contextSummary" | "teachingBody" | "application" | "prayer">;
}

export interface DailyExegesisActionsProps {
  canOpenBible: boolean;
  onOpenBible: () => void;
  onSaveToJournal: () => void;
}

export interface DailyExegesisErrorProps {
  message: string;
  onRetry: () => void;
}

export interface DailyExegesisDetailData {
  exegesis: DailyExegesisFull | null;
  displayDate: string;
}

export interface DailyExegesisDetailActions {
  goBack: () => void;
  openEdit: () => void;
}

export interface DailyContentDetailHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  onBack: () => void;
  onEdit?: () => void;
  editLabel?: string;
}

export interface DailyContentDetailEmptyProps {
  icon: LucideIcon;
  title: string;
  message: string;
  onBack: () => void;
  backLabel?: string;
}

export interface DailyContentDetailMetaProps {
  isPublished: boolean;
  reference?: string | null;
  extraBadge?: string | null;
  displayDate?: string;
  createdOn?: string;
  updatedOn?: string;
}

export interface DetailSectionProps {
  title?: string;
  children: ReactNode;
}

export interface DetailTitleBlockProps {
  title: string;
  children?: ReactNode;
}

export interface DetailPageLayoutProps {
  children: ReactNode;
}

export interface TextBlockProps {
  label: string;
  value?: string | null;
  icon?: LucideIcon;
}

export interface TagsBlockProps {
  tags?: string | null;
}

export interface AddDailyDevotionCoreSectionsProps {
  title: string;
  content: string;
  setTitle: (value: string) => void;
  setContent: (value: string) => void;
}

export interface AddDailyDevotionReferenceSectionProps {
  testament: string;
  book: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  testamentOptions: Array<{ value: string; label: string }>;
  bookOptions: Array<{ value: string; label: string }>;
  chapterOptions: Array<{ value: string; label: string }>;
  bibleVersionOptions: Array<{ value: string; label: string }>;
  setTestament: (value: string) => void;
  setBook: (value: string) => void;
  setChapter: (value: string) => void;
  setVerseNumber: (value: string) => void;
  setBibleVersion: (value: string) => void;
  t: { dailyVerse: { selectBook: string; selectChapter: string }; devotions: { selectTestament: string } };
}

export interface AddDailyDevotionContentFieldsProps {
  explanation: string;
  application: string;
  verseIntroduction: string;
  learnMore: string;
  contentPlaceholder?: string;
  setExplanation: (value: string) => void;
  setApplication: (value: string) => void;
  setVerseIntroduction: (value: string) => void;
  setLearnMore: (value: string) => void;
}

export interface AddDailyDevotionBackgroundSectionProps {
  backgroundAuthor: string;
  backgroundBook: string;
  backgroundContext: string;
  setBackgroundAuthor: (value: string) => void;
  setBackgroundBook: (value: string) => void;
  setBackgroundContext: (value: string) => void;
}

export interface AddDailyDevotionFormProps {
  data: unknown;
  actions: unknown;
}

export interface DailyContentFormCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  contentClassName?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}

export interface AddDailyExegesisFormProps {
  data: unknown;
  actions: unknown;
}

export interface DailyExegesisSeriesItem {
  id: number;
  title: string;
  displayDate: string;
}

export type VerseExplanationStepId =
  | "reference"
  | "exegesis"
  | "study"
  | "extras";

export interface WordStudyItem {
  strongsId: string;
  surfaceText: string;
  customDefinition: string;
  sortOrder: number;
}

export interface CrossRefItem {
  bookName: string;
  chapter: number;
  verseNumber: number;
  referenceText: string;
  commentary: string;
  sortOrder: number;
}

export interface ExplanationForm {
  bookName: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  exegesis: {
    explanationText: string;
    applicationText: string;
  };
  studyMetadata: {
    introduction: string;
    backgroundAuthor: string;
    backgroundBook: string;
    backgroundContext: string;
    finalThoughts: string;
    takeaways: string[];
  };
  wordStudies: WordStudyItem[];
  practicalApps: { applicationText: string; sortOrder: number }[];
  crossReferences: CrossRefItem[];
  themes: { themeName: string; sortOrder: number }[];
}

export interface AddExplanationHeaderBarProps {
  isEditMode: boolean;
  isValid: boolean;
  saving: boolean;
  goBack: () => void;
  handleSave: () => void;
}

export interface AddExplanationProgressCardProps {
  bookName: string;
  chapter: string;
  verseNumber: string;
  completionPercent: number;
}

export interface AddExplanationSidebarProps {
  currentStep: VerseExplanationStepId;
  currentStepIndex: number;
  stepCompletion: Record<VerseExplanationStepId, boolean>;
  referenceComplete: boolean;
  exegesisComplete: boolean;
  onStepChange: (step: VerseExplanationStepId) => void;
}

export interface AddExplanationReferenceFormProps {
  bookName: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  sortedTranslationOptions: Array<{ value: string; label: string; group: string }>;
  verseOptions: number[];
  verseOptionsLoading: boolean;
  verseTextLoading: boolean;
  selectedVerseText: string;
  maxChapterNumber: number;
  maxVerseNumber: number;
  bookOptions: Array<{ value: string; label: string; group: string }>;
  chapterOptions: number[];
  selectedVerse: number | null;
  verseLoadingForTrigger: boolean;
  updateField: (key: keyof Pick<ExplanationForm, "bookName" | "chapter" | "verseNumber" | "bibleVersion">, value: string) => void;
}

export interface AddExplanationExegesisFormProps {
  explanationText: string;
  applicationText: string;
  updateNested: (parent: "exegesis", child: "explanationText" | "applicationText", value: string) => void;
}

export interface AddExplanationStudyFormProps {
  introduction: string;
  backgroundAuthor: string;
  backgroundBook: string;
  backgroundContext: string;
  wordStudies: WordStudyItem[];
  updateNested: (parent: "studyMetadata", child: "introduction" | "backgroundAuthor" | "backgroundBook" | "backgroundContext", value: string) => void;
  addWordStudy: () => void;
  removeWordStudy: (index: number) => void;
  updateWordStudy: (index: number, field: keyof WordStudyItem, value: string | number) => void;
  /** Replaces a top-level form field — used to reorder the word-study list. */
  updateField: (key: "wordStudies", value: WordStudyItem[]) => void;
}

export interface AddExplanationExtrasFormProps {
  practicalApps: ExplanationForm["practicalApps"];
  crossReferences: CrossRefItem[];
  themes: ExplanationForm["themes"];
  takeaways: string[];
  finalThoughts: string;
  crossRefVerseOptions: Record<number, { key: string; verses: number[] }>;
  crossRefVerseLoading: Record<number, boolean>;
  crossReferenceBookOptions: Array<{ value: string; label: string; group: string }>;
  crossReferenceChapterOptions: Record<number, number[]>;
  crossReferenceVerseLoading: Record<number, boolean>;
  updatePracticalApp: (index: number, value: string) => void;
  addPracticalApp: () => void;
  removePracticalApp: (index: number) => void;
  addCrossRef: () => void;
  removeCrossRef: (index: number) => void;
  updateCrossRef: (index: number, field: keyof CrossRefItem, value: string | number) => void;
  pickCrossRefVerse: (index: number, verse: number) => void;
  addTheme: () => void;
  removeTheme: (index: number) => void;
  updateTheme: (index: number, value: string) => void;
  updateTakeaways: (takeaways: string[]) => void;
  updateFinalThoughts: (value: string) => void;
}

export interface AddExplanationWorkspaceProps {
  data: unknown;
  actions: unknown;
}

export interface AddExplanationFooterActionsProps {
  isValid: boolean;
  saving: boolean;
  isEditMode: boolean;
  handleSave: () => void;
  currentStepIndex: number;
  stepCount: number;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
}

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

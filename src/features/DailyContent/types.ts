// ─── Daily Content Types ───────────────────────────────────────────────────────
import type { FormEventHandler, ReactElement, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface DailyVerseItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseEnd?: number | null;
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
  verseEnd?: number | null;
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
  creatorName?: string;
  createdOn?: string | null;
  id: number;
  title: string;
  explanation: string;
  reflectionQuestions?: string | null;
  prayer?: string | null;
  practicalApplications?: string | null;
  learningPoints?: string | null;
  displayDate: string;
  bookName?: string | null;
  chapter?: number | null;
  verseNumber?: number | null;
  bibleVersion?: string | null;
  isPublished: boolean;
}

export interface DailyDevotionDetailData extends DailyDevotionItem {
  createdOn?: string | null;
  updatedOn?: string | null;
}

export type DailyDevotionCardItem = Pick<DailyDevotionItem, 'id' | 'title' | 'bookName' | 'chapter' |
  'verseNumber' | 'displayDate' | 'creatorName' | 'createdOn' | 'isPublished'> & {
  explanation?: string;
  preview?: { title?: string; explanation?: string; reference?: string };
};

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
  error?: string;
  title: string;
  setTitle: (value: string) => void;
}

export interface AddDailyDevotionReferenceSectionProps {
  bibleVersionError?: string;
  error?: string;
  book: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  verseNumbers: number[];
  verseText: string;
  isVerseLoading: boolean;
  bibleVersionOptions: Array<{ value: string; label: string }>;
  setBook: (value: string) => void;
  setChapter: (value: string) => void;
  setVerseNumber: (value: string) => void;
  setBibleVersion: (value: string) => void;
}

export interface AddDailyDevotionContentFieldsProps {
  errors?: Partial<Record<'explanation' | 'reflectionQuestions' | 'prayer' | 'practicalApplications' | 'learningPoints', string>>;
  explanation: string;
  reflectionQuestions: string[];
  prayer: string;
  practicalApplications: string[];
  learningPoints: string[];
  setExplanation: (value: string) => void;
  setReflectionQuestions: (value: string[]) => void;
  setPrayer: (value: string) => void;
  setPracticalApplications: (value: string[]) => void;
  setLearningPoints: (value: string[]) => void;
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
  | "learnMore"
  | "insights";

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
  verseEnd?: number;
  referenceText: string;
  commentary: string;
  sortOrder: number;
}

export interface ExplanationForm {
  bookName: string;
  chapter: string;
  verseNumber: string;
  verseEnd: string;
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
  goBack: () => void;
}

export interface AddExplanationProgressCardProps {
  bookName: string;
  chapter: string;
  verseNumber: string;
  verseEnd?: string;
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

/** Inline validation for the add/edit explanation editor. */
export interface ExplanationFieldErrors {
  reference: string;
  explanationText: string;
  applicationText: string;
  introduction: string;
  backgroundAuthor: string;
  backgroundBook: string;
  backgroundContext: string;
  finalThoughts: string;
  wordStudies: string[];
  practicalApps: string[];
  crossReferences: string[];
  themes: string[];
  takeaways: string[];
}

export interface AddExplanationReferenceFormProps {
  bookName: string;
  chapter: string;
  verseNumber: string;
  verseEnd: string;
  referenceError?: string;
  bibleVersionError?: string;
  passageError?: string;
  retryPassage: () => void;
  bibleVersion: string;
  sortedTranslationOptions: Array<{ value: string; label: string; group?: string }>;
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
  updateField: (key: keyof Pick<ExplanationForm, "bookName" | "chapter" | "verseNumber" | "verseEnd" | "bibleVersion">, value: string) => void;
}

export interface AddExplanationExegesisFormProps {
  explanationText: string;
  applicationText: string;
  errors?: Partial<Pick<ExplanationFieldErrors, "explanationText" | "applicationText">>;
  updateNested: (parent: "exegesis", child: "explanationText" | "applicationText", value: string) => void;
}

export interface AddExplanationStudyFormProps {
  showErrors?: boolean;
  revealRowErrors?: boolean;
  errors?: Partial<Pick<ExplanationFieldErrors, "introduction" | "backgroundAuthor" | "backgroundBook" | "backgroundContext" | "wordStudies">>;
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
  showErrors?: boolean;
  revealRowErrors?: boolean;
  errors?: Partial<Pick<ExplanationFieldErrors, "crossReferences" | "themes" | "takeaways" | "finalThoughts">>;
  bibleVersion: string;
  onCrossReferencesChange: (rows: CrossRefItem[]) => void;
  crossReferences: CrossRefItem[];
  themes: ExplanationForm["themes"];
  takeaways: string[];
  finalThoughts: string;
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

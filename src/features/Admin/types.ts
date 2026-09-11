// ─── Admin Types ───────────────────────────────────────────────────────────────

import type { StrongsWordEntry } from "@/data/staticData";

export type WordEntry = StrongsWordEntry;
export interface UseAdminCrudOptions<T> {
  route: string;
  listAction: string;
  saveAction: string;
  deleteAction: string;
  listKey?: string;
  totalKey?: string;
  mapItems?: (data: any) => T[];
}
export interface StudyToolsWordStudyItem {
  word: string;
  transliteration: string;
  meaning: string;
}
export interface StudyToolsCommentaryItem {
  author: string;
  title: string;
  text: string;
}
export interface StudyToolsCrossReferenceItem {
  ref: string;
  text: string;
}
export interface StudyToolsDictionaryTermItem {
  term: string;
  pronunciation: string;
  definition: string;
  description: string;
}
export interface StudyToolsTopicItem {
  name: string;
}
export interface StudyToolsVerseResource {
  id: number;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  commentaries: StudyToolsCommentaryItem[];
  crossReferences: StudyToolsCrossReferenceItem[];
  wordStudies: StudyToolsWordStudyItem[];
  dictionaryTerms: StudyToolsDictionaryTermItem[];
  interlinearWords: string[];
  relatedTopics: StudyToolsTopicItem[];
  createdOn?: string;
}

export interface DailyItem {
  id: number;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  title?: string;
  content?: string;
  reflection?: string;
  explanation?: string;
  learnMore?: string;
  passageReference?: string;
  introduction?: string;
  contextSummary?: string;
  teachingBody?: string;
  application?: string;
  prayer?: string;
  tags?: string;
  displayDate: string;
  isPublished: boolean;
  creatorName?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPlans: number;
  totalVerses: number;
  newUsersToday: number;
  activeSubscriptions: number;
}

export interface ToolCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

export interface TriviaQuestion {
  id: number;
  question: string;
  optionsJson: string;
  correctAnswer: number;
  explanation: string | null;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  category: string;
  difficulty: string;
  isActive: boolean;
  createdOn: string;
}

export interface TriviaOverviewStats {
  totalParticipants: number;
  totalAnswers: number;
  averageScore: number;
  dailyActiveParticipants: number;
  todayAnswers: number;
  difficultyBreakdown: Record<string, { total: number; correct: number }>;
}

export interface TriviaUserPerformance {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAnswered: number;
  correct: number;
  incorrect: number;
  percentage: number;
  lastAnsweredDate: string | null;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  sortOrder: number;
  maxSlots: number | null;
  isActive: boolean;
}

export interface SubscribedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionTier: string;
  accessExpiresAt: string | null;
  isSuspended: boolean;
  isExpired?: boolean;
  status?: string;
  source: string;
  outOfSync: boolean;
  createdOn?: string | null;
  legacySowerSlot?: number | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeTier?: string | null;
  stripeStatus?: string | null;
  stripeCurrentPeriodEnd?: string | null;
  syncIssue?: string | null;
}

export interface SubscriptionsSummary {
  totalInDB: number;
  totalInStripe: number;
  active: number;
  suspended: number;
  expired: number;
  paid: number;
  expiringSoon: number;
  outOfSync: number;
  stripeOnly: number;
  autoSynced: number;
  tierCounts?: Record<string, number>;
}

export interface ActivitySession {
  id: string;
  username: string;
  email: string;
  loggedInAt: string;
  loggedOutAt: string | null;
  deviceType: string;
  deviceName: string | null;
  ipAddress: string | null;
  location: string | null;
  success: boolean;
  failureReason: string | null;
  browser: string | null;
  os: string | null;
}

export interface ActivitySummary {
  successCount: number;
  failedCount: number;
  onlineCount: number;
}

export interface BookPrologue {
  id: number;
  bookName: string;
  content: string;
  createdBy: string;
  updatedBy: string | null;
  updatedOn: string | null;
}

export interface VerseExplanation {
  id: number;
  book: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
}

export interface DailyExegesis {
  id: number;
  title: string;
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

export interface WordStudyItem {
  strongsId: string;
  word: string;
  pronunciation: string;
  meaning: string;
  strongsNumber: string;
}

export interface CommentaryItem {
  verse: number;
  author: string;
  text: string;
}

export interface CrossReferenceItem {
  sourceVerse: string;
  targetVerse: string;
}

export interface DictionaryTermItem {
  term: string;
  definition: string;
}

export interface TopicItem {
  verseCount: number;
}

export interface VerseResource {
  resources: Record<string, unknown>;
}

// ─── Admin User Types ─────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  phoneNumber?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  maritalStatus?: string | null;
  userRole: number;
  emailVerified: boolean;
  status: boolean;
  accountStatus?: string;
  subscriptionTier?: string;
  loginCount?: number;
  lastLogin?: string | null;
  isLoggedIn?: boolean;
  profilePhotoUrl?: string | null;
  coverPhotoUrl?: string | null;
  ministryGroup?: string | null;
  servicePosition?: string | null;
  spiritualGifts?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  addressId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  legacySowerSlot?: string | null;
  supporterBadgeText?: string | null;
  createdOn: string;
  updatedOn?: string | null;
}

export interface UserActivitySession {
  id: string;
  loggedInAt: string;
  loggedOutAt: string | null;
  deviceType: string;
  deviceName: string | null;
  ipAddress: string | null;
  browser: string | null;
  os: string | null;
  success: boolean;
  failureReason: string | null;
}

// ─── Book Prologue Editor Types ────────────────────────────────────────────────

export type PrologueStepId = "basic" | "context" | "themes" | "extra";

export interface PrologueStep {
  id: PrologueStepId;
  label: string;
  description: string;
}

export interface PrologueEditorForm {
  bookName: string;
  title: string;
  content: string;
  author: string;
  authorDetail: string;
  audience: string;
  dateWritten: string;
  locationWritten: string;
  purpose: string;
  keyTheme: string;
  summary: string;
  background: string;
  lessons: string;
  chapters: string;
  christConnection: string;
  applications: string[];
  keyScriptures: KeyScriptureEntry[];
  mainThemes: string[];
  keyPeople: string[];
  keyVerses: string[];
  isPublished: boolean;
}

export interface KeyScriptureEntry {
  bookName: string;
  chapter: number | null;
  verse: number | null;
  translation: string;
  reference: string;
  text: string;
}

/** Flat model consumed by all AddBookPrologue editor components.
 *  Built in the page by spreading `{...data, ...actions}` from the hook. */
export interface AddBookPrologueModel {
  form: PrologueEditorForm;
  isEditMode: boolean;
  loadingExisting: boolean;
  saving: boolean;
  activeStep: PrologueStepId;
  currentStepIndex: number;
  currentStep: PrologueStepId;
  stepOrder: readonly PrologueStepId[];
  steps: PrologueStep[];
  stepCompletion: Record<PrologueStepId, boolean>;
  completionPercent: number;
  canAdvanceFromCurrent: boolean;
  isValid: boolean;
  filteredBooks: string[];
  bookOptions: Array<{ value: string; label: string; group: string }>;
  chapterOptions: number[][];
  setActiveStep: (step: PrologueStepId) => void;
  goToStep: (step: PrologueStepId) => void;
  goNext: () => void;
  goPrevious: () => void;
  updateField: <K extends keyof PrologueEditorForm>(
    key: K,
    value: PrologueEditorForm[K],
  ) => void;
  updateArrayItem: (
    field: keyof PrologueEditorForm,
    index: number,
    value: string,
  ) => void;
  addArrayItem: (field: keyof PrologueEditorForm) => void;
  removeArrayItem: (field: keyof PrologueEditorForm, index: number) => void;
  removeKeyScripture: (index: number) => void;
  addKeyScripture: () => void;
  updateKeyScripture: (
    index: number,
    patch: Partial<KeyScriptureEntry>,
  ) => void;
  pickVerseForKeyScripture: (index: number, verse: number) => void;
  handleSave: () => void;
  goBack: () => void;
}

export type AddBookProloguePageModel = ReturnType<
  typeof import("./hooks/useAddBookPrologue").useAddBookPrologue
>;
export type AddBookProloguePageData = AddBookProloguePageModel["data"];
export type AddBookProloguePageActions = AddBookProloguePageModel["actions"];

export interface BookPrologueDetail {
  bookName: string;
  title?: string;
  sortOrder?: number;
  author?: string;
  authorDetail?: string;
  audience?: string;
  dateWritten?: string;
  locationWritten?: string;
  purpose?: string;
  keyTheme?: string;
  summary?: string;
  background?: string;
  lessons?: string;
  chapters?: number;
  structure?: Array<{ range: string; title: string }>;
  applications?: string[];
  keyScripture?: Array<{ reference: string; text: string }>;
  mainThemes?: string[];
  keyPeople?: string[];
  keyVerses?: string[];
  christConnection?: string;
  isPublished?: boolean;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
}

export interface BookPrologueDetailData extends BookPrologueDetail {
  loading: boolean;
}

export interface DailyAssignment {
  dayNumber: number;
  title?: string;
  description?: string;
  bookName?: string;
  chapterStart?: number;
  chapterEnd?: number;
  verseStart?: number;
  verseEnd?: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string;
  correctAnswer: number;
}

export interface ReadingPlanAdminDetail {
  planId: string;
  title: string;
  description?: string;
  category?: string;
  durationDays?: number;
  isPublished?: boolean;
  createdOn?: string;
  assignments?: DailyAssignment[];
  questions?: QuizQuestion[];
}

export interface CreateUserForm {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  userRole: number;
}

export interface AdminVerseExplanation {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion: string;
  sortOrder: number;
  exegesis: { explanationText: string; applicationText: string } | null;
  studyMetadata: {
    introduction: string;
    backgroundAuthor: string;
    backgroundBook: string;
    backgroundContext: string;
    finalThoughts: string;
    takeaways: any[];
  } | null;
  wordStudies: unknown[];
  practicalApps: unknown[];
  crossReferences: unknown[];
  themes: unknown[];
  createdOn: string;
  updatedOn: string | null;
}

export interface TriviaPerformanceOverview {
  totalUsers: number;
  totalQuestions: number;
  avgScore: number;
}

export interface TriviaPerformanceUser {
  id: number;
  username: string;
  email: string;
  score: number;
  questionsAnswered: number;
}

export interface TriviaPerformanceQuestion {
  id: number;
  question: string;
  correctAnswers: number;
  totalAnswers: number;
}

export interface DailyExegesisEditForm {
  title: string;
  bookName: string;
  chapter: string;
  verseStart: string;
  verseEnd: string;
  passageReference: string;
  introduction: string;
  contextSummary: string;
  teachingBody: string;
  application: string;
  prayer: string;
  tags: string;
  displayDate: string;
  isPublished: boolean;
}

export interface JournalAdminDetail {
  id: number;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  category?: string;
  mood?: string;
  prayers?: string;
  gratitude?: string;
  learnings?: string;
  application?: string;
  isPublished: boolean;
  isFavorite?: boolean;
  userId: string;
  createdOn: string;
  updatedOn?: string;
}

export interface TriviaQuestionDetail {
  id: number;
  question: string;
  options?: string[];
  optionsJson?: string;
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  category: string;
  isActive: boolean;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  createdOn: string;
  updatedOn: string;
}

export interface VerseExplanationDetail {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion: string;
  isPublished?: boolean;
  createdOn?: string;
  updatedOn?: string;
  exegesis: { explanationText: string; applicationText: string } | null;
  studyMetadata: {
    introduction: string;
    backgroundAuthor: string;
    backgroundBook: string;
    backgroundContext: string;
    finalThoughts: string;
  } | null;
  wordStudies: { strongsId: string; surfaceText: string; customDefinition: string; sortOrder: number }[];
  practicalApps: { applicationText: string; sortOrder: number }[];
  crossReferences: { bookName: string; chapter: number; verseNumber: number; referenceText: string; commentary: string; sortOrder: number }[];
  themes: { themeName: string; sortOrder: number }[];
  verseText?: string;
}

export interface ReadingPlan {
  planId: string;
  id: number;
  title: string;
  description: string;
  category: string;
  durationDays: number;
  isPublished: boolean;
  createdOn: string;
}

export interface ReadingPlanForm {
  title: string;
  description: string;
  category: string;
  durationDays: string;
  isPublished: boolean;
}

export interface JournalModerationEntry {
  id: number;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  category?: string;
  isPublished: boolean;
  userId: string;
  createdOn: string;
}

export interface AdminBookPrologue {
  bookName: string;
  title?: string;
  summary?: string;
  author?: string;
  keyTheme?: string;
  purpose?: string;
  chapters?: number;
  isPublished?: boolean;
  createdOn?: string;
  updatedOn?: string | null;
  [key: string]: any;
}

export interface VerseExplanationListItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion: string;
  sortOrder: number;
  exegesis: { explanationText: string; applicationText: string } | null;
  createdOn: string;
  updatedOn: string | null;
}

export interface VerseExplanationPageData {
  items: VerseExplanationListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
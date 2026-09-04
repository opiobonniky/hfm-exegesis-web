// ─── Admin Types ───────────────────────────────────────────────────────────────

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
  setActiveStep: (step: PrologueStepId) => void;
  goToStep: (step: PrologueStepId) => void;
  goNext: () => void;
  goPrevious: () => void;
  updateField: <K extends keyof PrologueEditorForm>(key: K, value: PrologueEditorForm[K]) => void;
  updateArrayItem: (field: keyof PrologueEditorForm, index: number, value: string) => void;
  addArrayItem: (field: keyof PrologueEditorForm) => void;
  removeArrayItem: (field: keyof PrologueEditorForm, index: number) => void;
  removeKeyScripture: (index: number) => void;
  addKeyScripture: () => void;
  updateKeyScripture: (index: number, patch: Partial<KeyScriptureEntry>) => void;
  pickVerseForKeyScripture: (index: number, verse: number) => void;
  handleSave: () => void;
  goBack: () => void;
}


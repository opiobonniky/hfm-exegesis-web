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
}

export interface SubscribedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionTier: string;
  accessExpiresAt: string | null;
  isSuspended: boolean;
  source: string;
  outOfSync: boolean;
}

export interface ActivitySession {
  username: string;
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
  bookName: string;
  content: string;
  createdBy: string;
  updatedBy: string | null;
  updatedOn: string | null;
}

export interface VerseExplanation {
  book: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
}

export interface DailyExegesis {
  passageReference: string;
  introduction: string;
  contextSummary: string;
  teachingBody: string;
  application: string;
  prayer: string;
  tags: string | null;
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

// ─── Home Types ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPlans: number;
  totalVerses: number;
  newUsersToday: number;
  activeSubscriptions: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  role: string;
}

export interface DailyVerse {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  displayDate: string;
}

export interface UserPlan {
  planId: string;
  title: string;
  progress: number;
  lastActivity: string;
}

export interface UserDashboardVerse {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  reflection: string;
  displayDate: string;
}

export interface UserDashboardPlan {
  planId: string;
  planName: string;
  description: string;
  totalDays: number;
  completedDays: number;
  progress: number;
}

export interface UserDashboardStats {
  chaptersRead: number;
  highlights: number;
  notes: number;
  favorites: number;
  journalEntries: number;
}

export interface UserDashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  updatedOn: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
}

export interface UserDashboardSession {
  planId: string;
  planName: string;
  completed: boolean;
  lastActivity: string;
}

export interface UserDashboardExegesis {
  id: number;
  passageRef: string;
  introduction: string;
  displayDate: string;
}

export interface UserDashboardDevotion {
  id: number;
  title: string;
  content: string;
  displayDate: string;
}

export interface UserDashboardJournalEntry {
  id: number;
  title: string;
  reflection: string;
  createdOn: string;
  isPublic: boolean;
}

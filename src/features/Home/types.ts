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
export interface DailyVerse {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  displayDate: string;
export interface UserPlan {
  planId: string;
  title: string;
  progress: number;
  lastActivity: string;
// ─── User Dashboard Types ─────────────────────────────────────────────────────
export interface UserDashboardVerse {
  reflection: string;
export interface UserDashboardPlan {
  planName: string;
  description: string;
  totalDays: number;
  completedDays: number;
export interface UserDashboardStats {
  chaptersRead: number;
  highlights: number;
  notes: number;
  favorites: number;
  journalEntries: number;
export interface UserDashboardActivity {
  updatedOn: string;
export interface UserDashboardSession {
  completed: boolean;
export interface UserDashboardExegesis {
  passageRef?: string;
  introduction?: string;
export interface UserDashboardDevotion {
  content?: string;
export interface UserDashboardJournalEntry {
  title?: string;
  reflection?: string;
  createdOn?: string;
  isPublic?: boolean;

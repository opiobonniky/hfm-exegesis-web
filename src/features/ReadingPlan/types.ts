// ─── Reading Plan Types ────────────────────────────────────────────────────────

/** Admin listing item */
export interface ReadingPlanListItem {
  id: number;
  title: string;
  description: string;
  duration: number;
  status: string;
  startDate: string;
  endDate: string;
  assignedUsers: number;
  completionRate: number;
  createdAt: string;
}
export interface ReadingPlan {
  plan_id: string;
  planId?: string;
  plan_db_id: number;
  category: string;
  difficulty: string;
  total_days: number;
  totalDays?: number;
  total_assignments: number;
  total_quiz_questions: number;
  questions_enabled: boolean;
  questionsEnabled?: boolean;
  is_active: boolean;
  isActive?: boolean;
  started: boolean;
  is_completed: boolean | null;
  completed: boolean | null;
  completed_date: string | null;
  completion_percentage: number;
  completed_days_count: number;
  completed_days_json: string | null;
  progress_id: string | null;
  user_id: string | null;
  start_date: string | null;
  last_completed_date: string | null;
  days_since_started: number | null;
  days_since_last_activity: number | null;
  estimated_days_to_complete: number | null;
  avg_days_per_completion: number | null;
  streak: number | null;
  user_correct_answers?: number;
  user_answered_questions?: number;
  quiz_accuracy_percentage?: number;
  plan_created_on: string;
  days?: DayAssignment[];
export interface Chapter {
  book: string;
  chapter: number;
  startChapter?: number;
  endChapter?: number;
export interface QuizQuestion {
  questionId?: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
export interface DayAssignment {
  dayNumber: number;
  chapters: Chapter[];
  reflectionQuestions: string[];
  quizQuestions: QuizQuestion[];
  loaded?: boolean;
  exists?: boolean;
export interface ReadingPlanResponse {
  content: ReadingPlan[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
export interface UserPlanItem {
  planId: string;
  planName: string;
  completedDays: number;
  totalDays: number;
  isCompleted: boolean;
  streak: number;
export interface BrowsePlanItem {
  isActive: boolean;
  questionsEnabled: boolean;

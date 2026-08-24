// ─── Trivia Types ──────────────────────────────────────────────────────────────

export interface TriviaQuestion {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  createdBy: string;
  createdOn: string;
}
export interface TriviaCategory {
  name: string;
  description: string;
  questionCount: number;
export interface TriviaUserStats {
  totalAnswered: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayed: string;
export interface TriviaLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;

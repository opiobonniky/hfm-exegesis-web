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
}

export interface TriviaUserStats {
  totalAnswered: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayed: string;
}

export interface TriviaLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: number;
}

export interface TriviaPerformanceStats {
  totalAnswered: number;
  correct: number;
  incorrect: number;
  percentage: number;
}

export interface TriviaAnswerHistory {
  id: string;
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  answeredOn: string;
  question: string;
  difficulty: string | null;
  category: string | null;
  correctAnswer?: number;
  explanation?: string | null;
  optionsJson?: string;
}

export interface TriviaPerformanceResponse {
  stats: TriviaPerformanceStats;
  answers: TriviaAnswerHistory[];
  total: number;
  hasNext: boolean;
}

import type { TriviaPageActions, TriviaPageData } from "./hooks/useTriviaPage";

export interface TriviaHomeHeroProps {
  answeredCount: number;
}

export interface TriviaHomePageProps {
  data: TriviaPageData;
  actions: TriviaPageActions;
}

export interface TriviaPerformanceStateProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export interface TriviaHomeActionsProps {
  onStartQuiz: () => void;
  onOpenPerformance: () => void;
}

export interface TriviaQuestionsHeaderProps {
  questionNumber: number;
  difficulty: string | null;
  onExit: () => void;
}

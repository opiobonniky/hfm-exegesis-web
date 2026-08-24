// ─── Admin Trivia User Detail Types ────────────────────────────────────────────

export interface TriviaUserDetail {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  averageTimePerQuestion: number;
  lastPlayed: string;
  answers: TriviaAnswer[];
}

export interface TriviaAnswer {
  id: number;
  questionId: number;
  question: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  answeredAt: string;
  category: string;
  difficulty: string;
}

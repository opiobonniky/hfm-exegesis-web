import { Target, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import type { TriviaUserDetail } from "./hooks/useAdminTriviaUserDetailPage";

export const getStats = (detail: TriviaUserDetail) => {
  const accuracy =
    detail.questionsAnswered > 0
      ? Math.round((detail.correctAnswers / detail.questionsAnswered) * 100)
      : 0;

  return [
    {
      label: "Total Answered",
      value: detail.questionsAnswered,
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Correct Answers",
      value: detail.correctAnswers,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
      icon: TrendingUp,
      color: accuracy >= 70 ? "text-emerald-500" : "text-amber-500",
    },
    {
      label: "Score",
      value: detail.score,
      icon: Clock,
      color: "text-purple-500",
    },
  ];
};

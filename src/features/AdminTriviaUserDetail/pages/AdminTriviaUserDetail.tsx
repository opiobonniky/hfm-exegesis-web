"use client";

import { useAdminTriviaUserDetailPage } from "../hooks/useAdminTriviaUserDetailPage";
import {
  LoadingSkeleton,
  EmptyState,
  UserHeader,
  StatsGrid,
  AnswerHistoryTable,
} from "../components";
import { getStats } from "../constants";

export default function AdminTriviaUserDetailPage() {
  const h = useAdminTriviaUserDetailPage();

  if (h.loading) return <LoadingSkeleton />;
  if (!h.detail) return <EmptyState onGoBack={h.goBack} />;

  const stats = getStats(h.detail);

  return (
    <div className="space-y-6 p-6">
      <UserHeader detail={h.detail} onGoBack={h.goBack} />
      <StatsGrid stats={stats} />
      <AnswerHistoryTable answers={h.detail.recentAnswers} />
    </div>
  );
}

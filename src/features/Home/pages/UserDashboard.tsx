// UserDashboard — thin compositor, no logic in page
"use client";

import { useUserDashboard } from "../hooks/useUserDashboard";
import {
  DashboardSkeleton,
  HeroSection,
  DashboardBody,
} from "../components";

export default function UserDashboard() {
  const { data, actions } = useUserDashboard();
  const d = { ...data, ...actions };

  if (d.loading) return <DashboardSkeleton />;

  return (
    <div
      dir={d.isRtl ? "rtl" : "ltr"}
      className="relative min-h-full overflow-hidden bg-[#e2eaf1] dark:bg-[hsl(222_47%_5%)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,91,117,0.18),transparent_34%),radial-gradient(circle_at_12%_45%,rgba(58,91,117,0.11),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,hsl(212_63%_56%_/_0.16),transparent_32%),radial-gradient(circle_at_10%_45%,hsl(203_31%_35%_/_0.2),transparent_30%)]" />
      <div className="relative">
      <HeroSection userName={d.name} initial={d.initial} verse={d.dailyVerse} />
      <DashboardBody model={d} />
      </div>
    </div>
  );
}

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
      className="relative min-h-full overflow-hidden bg-[#f6f8fb] dark:bg-background"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,91,117,0.12),transparent_34%),radial-gradient(circle_at_12%_45%,rgba(58,91,117,0.06),transparent_28%)] dark:bg-none" />
      <div className="relative">
      <HeroSection userName={d.name} initial={d.initial} verse={d.dailyVerse} />
      <DashboardBody model={d} />
      </div>
    </div>
  );
}

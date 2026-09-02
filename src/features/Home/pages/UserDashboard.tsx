// UserDashboard — thin compositor, no logic in page
"use client";

import { useUserDashboard } from "../hooks/useUserDashboard";
import {
  DashboardSkeleton,
  HeroSection,
  DashboardBody,
} from "../components";

export default function UserDashboard() {
  const d = useUserDashboard();

  if (d.loading) return <DashboardSkeleton />;

  return (
    <div dir={d.isRtl ? "rtl" : "ltr"} className="min-h-full bg-background">
      <HeroSection userName={d.name} initial={d.initial} verse={d.dailyVerse} />
      <DashboardBody model={d} />
    </div>
  );
}

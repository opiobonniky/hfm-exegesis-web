"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import { routes } from "@/components/Routes/routes";
import { timeAgo } from "../utils";
import type { UserDashboardActivity } from "../types";
import type { NavigateFunction } from "react-router-dom";

interface RecentActivityListProps {
  activities: UserDashboardActivity[];
  maxItems?: number;
  navigate: NavigateFunction;
  onSeeAll?: () => void;
}

export default function RecentActivityList({ activities, maxItems = 5, navigate, onSeeAll }: RecentActivityListProps) {
  if (activities.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Recent activity</h2>
        {onSeeAll && (
          <button onClick={onSeeAll}
            className="text-xs font-semibold text-[#946b30] hover:text-[#6f4e1f] dark:text-[#d9b879]">All</button>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#d8d2c4] bg-[#faf8f2] dark:border-white/10 dark:bg-[#111b24]">
        {activities.slice(0, maxItems).map((act) => (
          <button
            key={act.id}
            onClick={() => act.bookName && act.chapter && navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(act.bookName)}&chapter=${act.chapter}`)}
            disabled={!act.bookName || !act.chapter}
            className="flex w-full items-center gap-3 border-b border-[#e2ddd2] px-4 py-3 text-start transition-colors last:border-b-0 hover:bg-[#f0ece2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:cursor-default dark:border-white/10 dark:hover:bg-white/5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ebe6da] dark:bg-white/10">
              <BookOpen className="h-3.5 w-3.5 text-[#785724] dark:text-[#d7aa62]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{act.bookName || act.title} {act.chapter || ""}</p>
              <p className="text-[11px] text-muted-foreground">{timeAgo(act.updatedOn)}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 rtl:rotate-180" />
          </button>
        ))}
      </div>
    </section>
  );
}

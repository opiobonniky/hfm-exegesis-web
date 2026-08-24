"use client";

import { Flame, ChevronRight } from "lucide-react";
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
        <h2 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.12em]">Recent Activity</h2>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">All</button>
        )}
      </div>
      <div className="space-y-1">
        {activities.slice(0, maxItems).map((act, idx) => (
          <button
            key={idx}
            onClick={() => navigate(`/bible?book=${encodeURIComponent(act.bookName)}&chapter=${act.chapter}`)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start hover:bg-muted/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <Flame className="w-3.5 h-3.5 text-primary/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{act.bookName} {act.chapter}</p>
              <p className="text-[11px] text-muted-foreground/50">{timeAgo(act.updatedOn)}</p>
          </button>
        ))}
    </section>
  );

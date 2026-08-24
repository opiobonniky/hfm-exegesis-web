"use client";

import {
  BookOpen,
  Highlighter,
  StickyNote,
  Star,
  ChevronRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
interface ActivityItem {
  type: "read" | "highlight" | "note" | "plan" | "favorite";
  book?: string;
  chapter?: number;
  verse?: number;
  timestamp: string;
  detail?: string;
}
interface RecentActivityProps {
  title?: string;
  items: ActivityItem[];
  seeAllLabel?: string;
  emptyMessage?: string;
  onSeeAll?: () => void;
  onPressItem?: (item: ActivityItem) => void;
const TYPE_CONFIG: Record<
  string,
  { icon: typeof BookOpen; color: string; bg: string; label: string }
> = {
  read: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-950/30", label: "Reading" },
  highlight: { icon: Highlighter, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/30", label: "Highlighted" },
  note: { icon: StickyNote, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/30", label: "Noted" },
  plan: { icon: BookOpen, color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-950/30", label: "Plan Progress" },
  favorite: { icon: Star, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-950/30", label: "Favorited" },
};
const timeAgo = (ts: string): string => {
  if (!ts) return "";
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
export default function RecentActivity({
  title = "Recent Activity",
  items,
  seeAllLabel = "See All",
  emptyMessage = "Start reading to see your activity here",
  onSeeAll,
  onPressItem,
}: RecentActivityProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-[15px] font-extrabold text-foreground">{title}</p>
        {onSeeAll && items.length > 0 && (
          <button
            onClick={onSeeAll}
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5 font-semibold"
          >
            {seeAllLabel}
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item, i) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.read;
            const Icon = config.icon;
            return (
              <button
                key={i}
                onClick={() => onPressItem?.(item)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3",
                  "hover:shadow-sm hover:border-primary/20 transition-all duration-150",
                  "active:scale-[0.98] text-left",
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.book} {item.chapter}:{item.verse}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {config.label} · {timeAgo(item.timestamp)}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              </button>
            );
          })}
      )}
    </div>
  );

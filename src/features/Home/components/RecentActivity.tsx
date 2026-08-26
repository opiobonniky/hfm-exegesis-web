"use client";

import { BookOpen, Highlighter, StickyNote, Star, ChevronRight, Clock } from "lucide-react";
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
}

const TYPE_CONFIG = {
  read: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-950/30", label: "Reading" },
  highlight: { icon: Highlighter, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/30", label: "Highlighted" },
  note: { icon: StickyNote, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/30", label: "Noted" },
  plan: { icon: BookOpen, color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-950/30", label: "Plan Progress" },
  favorite: { icon: Star, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-950/30", label: "Favorited" },
} as const;

const timeAgo = (timestamp: string) => {
  const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
};

export default function RecentActivity({
  title = "Recent Activity", items, seeAllLabel = "See All",
  emptyMessage = "Start reading to see your activity here", onSeeAll, onPressItem,
}: RecentActivityProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[15px] font-extrabold text-foreground">{title}</p>
        {onSeeAll && items.length > 0 && <button onClick={onSeeAll} className="flex items-center gap-0.5 text-xs font-semibold text-muted-foreground hover:text-primary">{seeAllLabel}<ChevronRight className="h-3 w-3" /></button>}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center"><Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">{emptyMessage}</p></div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item, index) => {
            const config = TYPE_CONFIG[item.type];
            const Icon = config.icon;
            return <button key={index} onClick={() => onPressItem?.(item)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/20 hover:shadow-sm">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", config.bg)}><Icon className={cn("h-4 w-4", config.color)} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{item.book} {item.chapter}:{item.verse}</p><p className="text-[10px] text-muted-foreground">{config.label} · {timeAgo(item.timestamp)}</p></div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            </button>;
          })}
        </div>
      )}
    </div>
  );
}

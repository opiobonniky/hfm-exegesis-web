import { PenLine, Star, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { stats: { totalEntries: number; favoriteCount: number; entriesThisWeek: number; entriesThisMonth: number } }

export function JournalStatsCards({ stats }: Props) {
  const cards = [
    { label: "Total Entries", value: stats.totalEntries, icon: PenLine, bg: "bg-blue-50 dark:bg-blue-950/40", color: "text-blue-600 dark:text-blue-400" },
    { label: "Favorites", value: stats.favoriteCount, icon: Star, bg: "bg-amber-50 dark:bg-amber-950/40", color: "text-amber-600 dark:text-amber-400" },
    { label: "This Week", value: stats.entriesThisWeek, icon: TrendingUp, bg: "bg-emerald-50 dark:bg-emerald-950/40", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "This Month", value: stats.entriesThisMonth, icon: Sparkles, bg: "bg-violet-50 dark:bg-violet-950/40", color: "text-violet-600 dark:text-violet-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {cards.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="rounded-2xl border bg-card dark:bg-stone-900/80 border-border dark:border-stone-800 p-4 flex items-center gap-3 transition-all hover:shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border-0 shrink-0", s.bg)}>
              <Icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground dark:text-stone-100 tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

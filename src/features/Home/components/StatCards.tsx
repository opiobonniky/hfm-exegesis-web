// StatCards — stats row for dashboard
import { BookOpen, Star, BookMarked, PenLine, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat { value: number; label: string; icon: any; color: string; bg: string; }

const STATS: Stat[] = [
  { value: 0, label: "Chapters", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { value: 0, label: "Highlights", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { value: 0, label: "Notes", icon: BookMarked, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { value: 0, label: "Journal", icon: PenLine, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { value: 0, label: "Favorites", icon: Heart, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
];

interface Props { chaptersRead: number; highlights: number; notes: number; journalEntries: number; favorites: number; }

export function StatCards({ chaptersRead, highlights, notes, journalEntries, favorites }: Props) {
  const values = [chaptersRead, highlights, notes, journalEntries, favorites];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {STATS.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm last:col-span-2 sm:last:col-span-1 sm:flex-col sm:justify-center sm:gap-1.5 sm:p-4">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", s.bg)}>
            <s.icon className={cn("w-4 h-4", s.color)} />
          </div>
          <div className="sm:text-center">
            <span className="block text-base font-bold text-foreground">{values[i]}</span>
            <span className="text-[10px] font-medium text-muted-foreground">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

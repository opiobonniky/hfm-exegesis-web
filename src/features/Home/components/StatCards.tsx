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
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {STATS.map((s, i) => (
        <div key={s.label} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border/50">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", s.bg)}>
            <s.icon className={cn("w-4 h-4", s.color)} />
          </div>
          <span className="text-sm sm:text-base font-bold text-foreground">{values[i]}</span>
          <span className="text-[10px] text-muted-foreground/60 font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

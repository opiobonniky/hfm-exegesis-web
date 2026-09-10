// StatCards — stats row for dashboard
import { BookOpen, Star, BookMarked, PenLine, Heart, type LucideIcon } from "lucide-react";

interface Stat { label: string; icon: LucideIcon; }

const STATS: Stat[] = [
  { label: "Chapters", icon: BookOpen },
  { label: "Highlights", icon: Star },
  { label: "Notes", icon: BookMarked },
  { label: "Journal", icon: PenLine },
  { label: "Favorites", icon: Heart },
];

interface Props { chaptersRead: number; highlights: number; notes: number; journalEntries: number; favorites: number; }

export function StatCards({ chaptersRead, highlights, notes, journalEntries, favorites }: Props) {
  const values = [chaptersRead, highlights, notes, journalEntries, favorites];
  return (
    <section aria-label="Your study statistics" className="overflow-hidden rounded-2xl border border-[#d8d2c4] bg-[#faf8f2] dark:border-white/10 dark:bg-[#111b24]">
      <div className="grid grid-cols-2 sm:grid-cols-5">
      {STATS.map((s, i) => (
        <div key={s.label} className="flex min-h-24 items-center gap-3 border-b border-e border-[#e2ddd2] p-4 last:col-span-2 last:border-b-0 sm:last:col-span-1 sm:border-b-0 sm:p-5 dark:border-white/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebe6da] text-[#785724] dark:bg-white/10 dark:text-[#d7aa62]">
            <s.icon className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <span className="block font-serif text-2xl font-semibold leading-none text-[#173346] dark:text-[#f5f0e5]">{values[i]}</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{s.label}</span>
          </div>
        </div>
      ))}
      </div>
    </section>
  );
}

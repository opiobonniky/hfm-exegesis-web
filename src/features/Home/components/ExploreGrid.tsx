import { ArrowUpRight, BookOpen, CalendarDays, Microscope, PenLine, Sun, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/components/Routes/routes";

const ITEMS = [
  { label: "Bible Reader", sub: "Read and study", icon: BookOpen, route: routes.bibleReader.path },
  { label: "Daily Verse", sub: "Today's word", icon: Sun, route: routes.userDailyVerse.path },
  { label: "Reading Plans", sub: "Guided journeys", icon: CalendarDays, route: routes.userPlans.path },
  { label: "Word Study", sub: "Explore meaning", icon: Microscope, route: routes.dictionary.path },
  { label: "Bible Trivia", sub: "Test knowledge", icon: Trophy, route: routes.trivia.path },
  { label: "My Journal", sub: "Reflect and write", icon: PenLine, route: routes.journal.path },
];

export function ExploreGrid() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#946b30] dark:text-[#d9b879]">Study library</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#173346] dark:text-[#f5f0e5]">Choose a place to begin</h2>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">Six ways to go deeper</span>
      </div>
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#d8d2c4] bg-[#faf8f2] sm:grid-cols-3 dark:border-white/10 dark:bg-[#111b24]">
        {ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="group min-h-36 border-b border-e border-[#e2ddd2] p-4 text-start transition-colors hover:bg-[#f0ece2] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary dark:border-white/10 dark:hover:bg-white/5 sm:p-5"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ebe6da] text-[#173346] dark:bg-white/10 dark:text-[#d7aa62]">
                <item.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-[#946b30]" />
            </div>
            <p className="text-sm font-semibold leading-tight text-foreground">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

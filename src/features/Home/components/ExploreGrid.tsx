import { ArrowUpRight, BookOpen, CalendarDays, Microscope, PenLine, Sun, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/components/Routes/routes";

const ITEMS = [
  { label: "Bible Reader", sub: "Read and study", icon: BookOpen, tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400", route: routes.bibleReader.path },
  { label: "Daily Verse", sub: "Today's word", icon: Sun, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400", route: routes.userDailyVerse.path },
  { label: "Reading Plans", sub: "Guided journeys", icon: CalendarDays, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", route: routes.userPlans.path },
  { label: "Word Study", sub: "Explore meaning", icon: Microscope, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400", route: routes.dictionary.path },
  { label: "Bible Trivia", sub: "Test knowledge", icon: Trophy, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400", route: routes.trivia.path },
  { label: "My Journal", sub: "Reflect and write", icon: PenLine, tone: "bg-teal-500/10 text-teal-600 dark:text-teal-400", route: routes.journal.path },
];

export function ExploreGrid() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Explore</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight">Where would you like to begin?</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="group rounded-2xl border border-border/60 bg-card p-4 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg sm:p-5"
          >
            <div className="mb-5 flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
                <item.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-primary" />
            </div>
            <p className="text-sm font-bold leading-tight text-foreground">{item.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

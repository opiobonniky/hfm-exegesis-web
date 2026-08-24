// ExploreGrid — 6-item gradient grid for dashboard explore
import { BookOpen, Sun, CalendarDays, Microscope, Trophy, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { routes } from "@/components/Routes/routes";
import { useMemo } from "react";

const ITEMS = [
  { label: "Bible Reader", sub: "Read & study", icon: BookOpen, gradient: "from-blue-500 to-blue-600", route: routes.bibleReader.path },
  { label: "Daily Verse", sub: "Today's word", icon: Sun, gradient: "from-amber-500 to-orange-500", route: routes.userDailyVerse.path },
  { label: "Reading Plans", sub: "Guided journeys", icon: CalendarDays, gradient: "from-emerald-500 to-teal-500", route: routes.userPlans.path },
  { label: "Word Study", sub: "Dictionary", icon: Microscope, gradient: "from-violet-500 to-purple-600", route: routes.dictionary.path },
  { label: "Bible Trivia", sub: "Test knowledge", icon: Trophy, gradient: "from-rose-500 to-pink-500", route: routes.trivia.path },
  { label: "My Journal", sub: "Reflect & write", icon: PenLine, gradient: "from-green-500 to-emerald-500", route: routes.journal.path },
];

export function ExploreGrid() {
  const navigate = useNavigate();
  return (
    <section>
      <h2 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.12em] mb-4">Explore</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className={cn(
              "group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-start transition-all",
              "hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97]",
              `bg-gradient-to-br ${item.gradient}`,
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-white" strokeWidth={1.8} />
              </div>
              <p className="font-bold text-sm text-white leading-tight">{item.label}</p>
              <p className="text-[11px] text-white/50 mt-0.5 hidden sm:block">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

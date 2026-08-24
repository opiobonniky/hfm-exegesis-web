// Day navigation bar with prev/next and progress
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayNavigationProps {
  currentDay: number;
  totalDays: number;
  planId: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onNavigate: (dir: "prev" | "next") => void;
}
export function DayNavigation({ currentDay, totalDays, canGoPrev, canGoNext, onNavigate }: DayNavigationProps) {
  const progressPct = totalDays > 0 ? Math.round(((currentDay - 1) / totalDays) * 100) : 0;
  return (
    <div className="border-t border-border/20 bg-background/95 backdrop-blur-sm px-5 py-3">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{currentDay}/{totalDays}</span>
      </div>
      {/* Nav buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => onNavigate("prev")}
          disabled={!canGoPrev}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3 h-3" /> Previous
        </button>
          onClick={() => onNavigate("next")}
          disabled={!canGoNext}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          Next <ArrowRight className="w-3 h-3" />
    </div>
  );

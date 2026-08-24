// Reading plan card with progress for BibleReadingPlan
import { BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  title: string;
  totalDays: number;
  progressPct?: number;
  isActive?: boolean;
  onClick: () => void;
}

export function PlanCard({ title, totalDays, progressPct = 0, isActive, onClick }: PlanCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all",
        isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 bg-card",
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", isActive ? "bg-primary/10" : "bg-muted")}>
          <BookOpen className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground">{totalDays} days</p>
          {progressPct > 0 && (
            <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}

import { BookOpen, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  plan: any;
  isRtl: boolean;
  t: any;
  onPress: () => void;
}

export function ReadingPlanCard({ plan, isRtl, t, onPress }: Props) {
  const started = plan.started ?? false;
  const completed = plan.completed ?? false;
  const progress = plan.progress ?? 0;

  return (
    <div
      onClick={onPress}
      className={cn(
        "rounded-2xl border bg-card p-4 space-y-3 cursor-pointer hover:shadow-md transition-all",
        completed ? "border-emerald-200" : started ? "border-primary/30" : "border-border",
      )}
    >
      {started && !completed && (
        <div className="h-1 rounded-full bg-primary overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold truncate">{plan.title}</h3>
            {completed && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Done</span>}
            {started && !completed && <span className="text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full font-medium">Active</span>}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{plan.totalDays || plan.total_days || 0} days</span>
        {started && <span>{progress}% complete</span>}
      </div>
    </div>
  );
}

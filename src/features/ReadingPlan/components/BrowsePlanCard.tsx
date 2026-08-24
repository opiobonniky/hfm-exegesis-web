import { BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { DIFFICULTY_COLOR, DIFFICULTY_KEYS, CATEGORY_KEYS } from "../constants";
import type { ReadingPlan } from "../types";

interface Props {
  plan: ReadingPlan; isActive: boolean; hasStarted: boolean; isCompleted: boolean;
  done: number; pct: number; onPress: () => void;
}
export function BrowsePlanCard({ plan, isActive, hasStarted, isCompleted, done, pct, onPress }: Props) {
  const { t, isRtl } = useLanguage();
  const total = plan.totalDays || plan.total_days || 1;
  const diffColor = DIFFICULTY_COLOR[plan.difficulty]?.badge || "bg-muted text-muted-foreground";
  return (
    <button
      onClick={onPress}
      className={cn(
        "w-full bg-card rounded-2xl border transition-all hover:shadow-md",
        isRtl ? "text-right" : "text-left",
        isActive || isCompleted ? "border-teal-200 dark:border-teal-800/40" : "border-border",
      )}
    >
      {(isActive || isCompleted) && (
        <div className="h-1 rounded-t-2xl" style={{ backgroundColor: isCompleted ? "#10B981" : "#14b8a6" }} />
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-foreground">{plan.title}</h3>
            {isCompleted && <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">{t.readingPlan?.badgeDone || "Done"}</span>}
            {isActive && !isCompleted && <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700 font-semibold">{t.readingPlan?.badgeActive || "Active"}</span>}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{plan.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={cn("text-xs px-2 py-1 rounded-lg font-medium border", diffColor)}>
              {t.readingPlan?.[DIFFICULTY_KEYS[plan.difficulty]] || plan.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded-lg font-medium bg-muted text-muted-foreground">
              {t.readingPlan?.[CATEGORY_KEYS[plan.category]] || plan.category}
              {total} {t.readingPlan?.days || "days"}
            {plan.questionsEnabled && (
              <span className="text-xs px-2 py-1 rounded-lg font-medium bg-violet-100 text-violet-700">{t.readingPlan?.badgeQA || "Q&A"}</span>
            )}
          {hasStarted && (
            <div className="bg-muted rounded-lg p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{done}/{total} · {pct}%</span>
              </div>
              <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isCompleted ? "#10B981" : "#14b8a6" }} />
            </div>
          )}
        <ChevronRight className={cn("w-5 h-5 text-muted-foreground/70 shrink-0", isRtl && "rotate-180")} />
      </div>
    </button>
  );

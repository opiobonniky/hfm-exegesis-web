import { Flame, CheckCircle, BookOpen, Eye, Play, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { ProgressCircle } from "./ProgressCircle";
import type { ReadingPlan } from "../types";

interface Props {
  plan: ReadingPlan; pct: number; done: number; streak: number; nextDay: number;
  lastDay: number | null; isCompleted: boolean;
  onRead: () => void; onSummary: () => void; onRemove: () => void;
}
export function ActivePlanCard({ plan, pct, done, streak, nextDay, lastDay, isCompleted, onRead, onSummary, onRemove }: Props) {
  const { t, isRtl } = useLanguage();
  const total = plan.totalDays || plan.total_days || 1;
  const accent = isCompleted ? "#10B981" : "#14b8a6";
  return (
    <div className={cn("bg-card rounded-2xl border shadow-sm overflow-hidden", isCompleted ? "border-emerald-200 dark:border-emerald-800/40" : "border-border")}>
      <div className="flex">
        <div className={cn("w-1 shrink-0", isRtl ? "rounded-r-2xl" : "rounded-l-2xl")} style={{ backgroundColor: accent }} />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-foreground text-lg">{plan.title}</h3>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <Trophy className="w-3 h-3" />{t.readingPlan?.badgeDone || "Done"}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {(t.readingPlan?.daysDone || "{completed} of {total} days done").replace("{completed}", String(done)).replace("{total}", String(total))}
              </p>
              <button onClick={onRemove} className="mt-3 text-xs text-muted-foreground/70 hover:text-red-500 transition-colors">
                {t.readingPlan?.removePlanLink || "Remove plan"}
              </button>
            </div>
            <ProgressCircle percent={pct} color={accent} size={72} isRtl={isRtl} />
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: accent }} />
          <p className="text-xs text-muted-foreground/70 mb-4">{(t.readingPlan?.pctComplete || "{pct}% complete").replace("{pct}", String(pct))}</p>
          <div className="grid grid-cols-3 gap-4 bg-muted rounded-xl p-3 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1"><Flame className="w-4 h-4" /><span className="font-bold text-foreground">{streak}d</span></div>
              <p className="text-xs text-muted-foreground">{t.readingPlan?.streak || "Streak"}</p>
            <div className={cn("text-center", isRtl ? "border-r border-border" : "border-l border-border")}>
              <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1"><CheckCircle className="w-4 h-4" /><span className="font-bold text-foreground">{done}</span></div>
              <p className="text-xs text-muted-foreground">{t.readingPlan?.done || "Done"}</p>
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="font-bold text-foreground">{lastDay ? (t.readingPlan?.dayLabel || "Day {day}").replace("{day}", String(lastDay)) : "—"}</span>
              <p className="text-xs text-muted-foreground">{t.readingPlan?.lastRead || "Last read"}</p>
          {isCompleted ? (
            <div className="flex gap-3">
              <button onClick={onSummary} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground/80 font-semibold hover:bg-muted transition-colors">
                <Eye className="w-4 h-4" />{t.readingPlan?.summary || "Summary"}
              <button onClick={onRead} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground/80 font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                <Play className="w-4 h-4" />{t.readingPlan?.revisit || "Revisit"}
          ) : (
            <button onClick={onRead} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground/80 font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
              <Play className="w-4 h-4" />
              {done === 0
                ? (t.readingPlan?.beginDay || "Begin Day {day}").replace("{day}", "1")
                : (t.readingPlan?.continueDay || "Continue · Day {day}").replace("{day}", String(nextDay))}
            </button>
          )}
        </div>
      </div>
    </div>
  );

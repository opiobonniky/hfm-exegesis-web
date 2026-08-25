import { HelpCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./PlanDetailUI";
import type { DayAssignment } from "../types";

interface PlanQuizTabProps {
  questionsEnabled: boolean;
  loadingPlan: boolean;
  allQuizDays: DayAssignment[];
  t: any;
}

export function PlanQuizTab({ questionsEnabled, loadingPlan, allQuizDays, t }: PlanQuizTabProps) {
  if (!questionsEnabled) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <HelpCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm">{t.readingPlan.quizDisabled}</p>
      </div>
    );
  }

  if (loadingPlan) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-card animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (allQuizDays.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <HelpCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm">{t.readingPlan.noQuizFound}</p>
      </div>
    );
  }

  let runningIdx = 0;

  return (
    <div className="space-y-4">
      {allQuizDays.map((day) => (
        <GlassCard key={day.dayNumber} className="p-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
            <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-[10px] font-bold text-violet-700 shrink-0">
              {day.dayNumber}
            </div>
            <p className="text-xs font-semibold text-foreground/80 flex-1">
              {day.title || `Day ${day.dayNumber}`}
            </p>
            {day.chapters.filter((c) => c.book).length > 0 && (
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                {day.chapters.filter((c) => c.book).map((c) => `${c.book} ${c.chapter}`).join(" · ")}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">{day.quizQuestions.length}Q</span>
          </div>

          <div className="space-y-3">
            {day.quizQuestions.map((q, qi) => {
              const idx = ++runningIdx;
              return (
                <div key={qi} className="rounded-xl border border-border bg-background p-3 space-y-2.5">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      {idx}
                    </span>
                    <p className="text-sm text-foreground/80 leading-snug">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-7">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={cn(
                          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs",
                          oi === q.correctAnswer
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {oi === q.correctAnswer ? (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-border shrink-0" />
                        )}
                        {opt}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="pl-7 border-l-2 border-indigo-200 ml-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

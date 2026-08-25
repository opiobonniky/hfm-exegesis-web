import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_CATEGORIES, PLAN_DIFFICULTIES, DIFF_BADGE } from "../constants";
import { isDayComplete } from "../hooks/useAddReadingPlanPage";
import type { PlanMeta } from "../hooks/useAddReadingPlanPage";
import type { DayAssignment } from "../types";

interface Props {
  meta: PlanMeta;
  days: DayAssignment[];
  submitting: boolean;
  onPrev: () => void;
  onSubmit: () => void;
  t: any;
  isRtl: boolean;
}

export function PlanStepReview({ meta, days, submitting, onPrev, onSubmit, t, isRtl }: Props) {
  const completed = days.filter(isDayComplete).length;
  const tl = (key: string) => t.readingPlan?.[key] as string;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-muted/50">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />{t.readingPlan?.reviewConfirm || "Review & Confirm"}
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-border/50 bg-muted p-4 space-y-3">
            <h3 className="font-bold text-foreground text-base">{meta.title}</h3>
            {meta.description && <p className="text-sm text-muted-foreground">{meta.description}</p>}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] border border-border bg-card text-muted-foreground rounded-lg px-2 py-0.5 font-semibold">
                {meta.totalDays} {t.readingPlan?.days || "days"}
              </span>
              <span className="text-[11px] border border-border bg-card text-muted-foreground rounded-lg px-2 py-0.5 font-semibold">
                {tl(PLAN_CATEGORIES.find((c) => c.value === meta.category)?.labelKey || "catIntroduction")}
              </span>
              <span className={cn("text-[11px] border rounded-lg px-2 py-0.5 font-bold", DIFF_BADGE[meta.difficulty])}>
                {tl(PLAN_DIFFICULTIES.find((d) => d.value === meta.difficulty)?.labelKey || "diffBeginner")}
              </span>
              {meta.questionsEnabled && (
                <span className="text-[11px] border border-violet-200 bg-violet-50 text-violet-700 rounded-lg px-2 py-0.5 font-bold">
                  {t.readingPlan?.quizLabel || "Q&A"}
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.readingPlan?.dailyAssignments || "Daily Assignments"}</p>
            </div>
            <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-stone-50">
              {days.map((day) => {
                const ok = isDayComplete(day);
                return (
                  <div key={day.dayNumber} className={cn("flex items-start gap-3 p-3", ok ? "bg-card" : "bg-muted")}>
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", ok ? "bg-teal-100 text-teal-700" : "bg-muted text-muted-foreground/70")}>
                      {day.dayNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      {ok ? (
                        <>
                          <p className="font-semibold text-sm text-foreground">{day.title}</p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {day.chapters.filter((c) => c.book).map((c) => `${c.book} ${c.chapter}`).join(", ")}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground/70 italic">{t.readingPlan?.notConfiguredEdit || "Not configured"}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={onPrev} disabled={submitting} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted text-sm font-semibold transition-all disabled:opacity-50">
          <ArrowLeft className={cn("w-4 h-4", isRtl && "rotate-180")} />{t.common?.back || "Back"}
        </button>
        <button type="button" onClick={onSubmit} disabled={submitting} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-50">
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{t.readingPlan?.savingLabel || "Saving..."}</>
          ) : (
            <><Save className="w-4 h-4" />{t.readingPlan?.createPlanTitle || "Create Plan"}</>
          )}
        </button>
      </div>
    </div>
  );
}

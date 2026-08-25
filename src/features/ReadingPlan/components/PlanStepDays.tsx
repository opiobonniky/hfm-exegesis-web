import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayCardEdit } from "./DayCardEdit";
import { isDayComplete } from "../hooks/useAddReadingPlanPage";
import type { DayAssignment } from "../types";

interface Props {
  meta: { totalDays: number; questionsEnabled: boolean };
  days: DayAssignment[];
  expandedDay: number | undefined;
  setExpandedDay: (v: number | undefined) => void;
  handleUpdateDay: (idx: number, patch: Partial<DayAssignment>) => void;
  onPrev: () => void;
  onNext: () => void;
  t: any;
  isRtl: boolean;
}

export function PlanStepDays({
  meta, days, expandedDay, setExpandedDay, handleUpdateDay, onPrev, onNext, t, isRtl,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 bg-muted/50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              {t.readingPlan?.dailyContentTitle || "Daily Content"} — {meta.totalDays} {t.readingPlan?.days || "days"}
            </h2>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{t.readingPlan?.dailyContentDesc || "Configure each day's reading"}</p>
          </div>
          <span className="text-[11px] border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-2 py-1 font-bold">
            {(t.readingPlan?.daysReady || "{ready}/{total} ready")
              .replace("{ready}", String(days.filter(isDayComplete).length))
              .replace("{total}", String(meta.totalDays))}
          </span>
        </div>
        <div className="p-4 space-y-2">
          {days.map((day, dayIdx) => (
            <DayCardEdit
              key={day.dayNumber}
              day={day}
              dayIdx={dayIdx}
              isOpen={expandedDay === day.dayNumber}
              questionsEnabled={meta.questionsEnabled}
              onToggle={() => setExpandedDay(expandedDay === day.dayNumber ? undefined : day.dayNumber)}
              onUpdateDay={handleUpdateDay}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button type="button" onClick={onPrev} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted text-sm font-semibold transition-all">
          <ArrowLeft className={cn("w-4 h-4", isRtl && "rotate-180")} />{t.common?.back || "Back"}
        </button>
        <button type="button" onClick={onNext} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-all">
          {t.readingPlan?.stepReviewSave || "Review & Save"} <ArrowRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
        </button>
      </div>
    </div>
  );
}

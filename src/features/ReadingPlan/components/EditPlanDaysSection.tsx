import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayCardEdit } from "./DayCardEdit";
import type { DayAssignment } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';
import { StableLoadingContent } from "@/components/ui/StableLoadingContent";

interface EditPlanDaysSectionProps {
  days: DayAssignment[];
  expandedDay: number | undefined;
  questionsEnabled: boolean;
  setExpandedDay: (value: number | undefined) => void;
  updateDay: (dayIndex: number, patch: Partial<DayAssignment>) => void;
  handleSaveDay: (dayIndex: number) => void;
  savingDay: number | null;
}

export function EditPlanDaysSection({
  days,
  expandedDay,
  questionsEnabled,
  setExpandedDay,
  updateDay,
  handleSaveDay,
  savingDay,
}: EditPlanDaysSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{tt("Reading days")}</p>
          <p className="text-sm text-muted-foreground">{tt("Edit chapters, reflections, and quiz questions for each day.")}</p>
        </div>
        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
          {days.length}{tt("days")}</span>
      </div>

      {days.map((day, dayIndex) => (
        <div key={day.assignmentId ?? day.dayNumber} className="space-y-2">
          <DayCardEdit
            day={day}
            dayIdx={dayIndex}
            isOpen={expandedDay === dayIndex}
            questionsEnabled={questionsEnabled}
            onToggle={() => setExpandedDay(expandedDay === dayIndex ? undefined : dayIndex)}
            onUpdateDay={updateDay}
          />
          {expandedDay === dayIndex && (
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveDay(dayIndex)}
                disabled={savingDay === dayIndex}
                className="gap-1.5"
              >
                <StableLoadingContent loading={savingDay === dayIndex} idle={<><Save className="h-3.5 w-3.5" /><span>{tt("Save day")}</span></>} pending={tt("Saving...")} />
              </Button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

import DayCard from "./DayCard";
import type { DayAssignment } from "../types";

interface PlanScheduleTabProps {
  loadingPlan: boolean;
  days: DayAssignment[];
  completedDayNums: Set<number>;
  questionsEnabled: boolean;
  totalDays: number;
}

export function PlanScheduleTab({ loadingPlan, days, completedDayNums, questionsEnabled, totalDays }: PlanScheduleTabProps) {
  return (
    <div className="space-y-2">
      {loadingPlan
        ? Array.from({ length: totalDays }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-card animate-pulse border border-border" />
          ))
        : days.map((day) => (
            <DayCard key={day.dayNumber} day={day} isCompleted={completedDayNums.has(day.dayNumber)} questionsEnabled={questionsEnabled} />
          ))}
    </div>
  );
}

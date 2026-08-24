"use client";

import { CalendarDays, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
interface ReadingPlanCardProps {
  planName: string;
  description: string;
  totalDays: number;
  completedDays: number;
  onPress?: () => void;
}
export default function ReadingPlanCard({
  planName,
  description,
  totalDays,
  completedDays,
  onPress,
}: ReadingPlanCardProps) {
  const pct = totalDays > 0 ? Math.min(100, Math.round((completedDays / totalDays) * 100)) : 0;
  return (
    <div
      onClick={onPress}
      className={cn(
        "rounded-2xl bg-muted/40 p-4 cursor-pointer",
        "hover:bg-muted/60 transition-all duration-200 active:scale-[0.98]",
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5 text-primary/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{planName}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        <span className={cn("text-xs font-bold shrink-0", pct >= 70 ? "text-emerald-500" : "text-muted-foreground")}>
          {pct}%
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="h-1.5 bg-muted-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: pct >= 70
                ? "linear-gradient(90deg, #10B981, #34D399)"
                : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.7))",
            }}
          />
        <div className="flex items-center justify-between text-xs text-muted-foreground/60">
          <span>{completedDays} of {totalDays} days</span>
          <span>{totalDays - completedDays} left</span>
    </div>
  );

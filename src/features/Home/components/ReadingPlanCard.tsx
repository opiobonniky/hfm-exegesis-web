"use client";

import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingPlanCardProps {
  planName: string;
  description: string;
  totalDays: number;
  completedDays: number;
  onPress?: () => void;
}

export default function ReadingPlanCard({ planName, description, totalDays, completedDays, onPress }: ReadingPlanCardProps) {
  const pct = totalDays > 0 ? Math.min(100, Math.round((completedDays / totalDays) * 100)) : 0;
  return (
    <div onClick={onPress} className="cursor-pointer rounded-2xl bg-muted/40 p-4 transition-all hover:bg-muted/60 active:scale-[0.98]">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"><CalendarDays className="h-5 w-5 text-primary/70" /></div>
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{planName}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p></div>
        <span className={cn("shrink-0 text-xs font-bold", pct >= 70 ? "text-emerald-500" : "text-muted-foreground")}>{pct}%</span>
      </div>
      <div className="space-y-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted-foreground/10"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 70 ? "linear-gradient(90deg, #10B981, #34D399)" : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.7))" }} /></div>
        <div className="flex justify-between text-xs text-muted-foreground/60"><span>{completedDays} of {totalDays} days</span><span>{totalDays - completedDays} left</span></div>
      </div>
    </div>
  );
}

import { ArrowLeft, CheckCircle2, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  planTitle: string;
  dayNumber: number;
  totalDays: number;
  isCompleted: boolean;
  onBack: () => void;
}

export default function DailyReadingHeader({ planTitle, dayNumber, totalDays, isCompleted, onBack }: Props) {
  const progress = totalDays > 0 ? Math.min(100, Math.round((dayNumber / totalDays) * 100)) : 0;

  return (
    <header className="relative border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to reading plan">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{planTitle}</p>
          <p className="text-xs text-muted-foreground">Your guided Scripture practice</p>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isCompleted ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-primary/10 text-primary"}`}>
          {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
          {isCompleted ? "Complete" : `Day ${dayNumber}`}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-primary via-primary/90 to-violet-700 px-5 py-7 text-primary-foreground shadow-xl shadow-primary/10 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[36px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="relative max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Today's practice
            </div>
            <p className="text-sm font-medium text-white/70">Day {dayNumber}{totalDays > 0 ? ` of ${totalDays}` : ""}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Read. Reflect. Respond.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Make room for the passage, write what stands out, and carry one truth into your day.
            </p>
            {totalDays > 0 && (
              <div className="mt-6 max-w-md">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/70">
                  <span>Plan progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-black/20">
                  <div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

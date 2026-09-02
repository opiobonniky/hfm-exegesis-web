// Stage progress bar with clickable stage indicators
import { Check, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_ORDER } from "../constants";

const STAGE_ICONS: Record<string, any> = {
  look: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  listen: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  learn: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  abide: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
};
const STAGE_DESC: Record<string, string> = {
  look: "Observe the passage carefully",
  listen: "Meditate through repetition",
  learn: "Understand the deeper meaning",
  abide: "Apply what you've learned",
};

const STAGE_TIME: Record<string, string> = {
  look: "8–12 min",
  listen: "5–15 min",
  learn: "15–25 min",
  abide: "8–12 min",
};
interface StageProgressProps {
  currentStage: string;
  onStageClick: (stage: string) => void;
  isRtl: boolean;
}
export function StageProgress({ currentStage, onStageClick, isRtl }: StageProgressProps) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage as any);
  const progress = currentIdx >= 0 ? Math.round((currentIdx / (STAGE_ORDER.length - 1)) * 100) : 0;
  return (
    <div className="px-4 sm:px-6 py-3 bg-muted/20 border-b border-border/30" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">{progress}%</span>
            <span className="text-muted-foreground/20">|</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-muted-foreground/50">
              <Timer className="w-2.5 h-2.5" />
              {STAGE_TIME[currentStage] || ""}
            </span>
          </div>
        </div>
        </div>
        {/* Stage indicators */}
        <div className="flex items-center justify-between">
          {STAGE_ORDER.map((s, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const Icon = STAGE_ICONS[s];
            return (
              <button
                key={s}
                onClick={() => isDone && onStageClick(s)}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  isDone && "cursor-pointer hover:opacity-80",
                  isCurrent && "cursor-default",
                  !isDone && !isCurrent && "cursor-default opacity-35",
                )}
                disabled={!isDone && !isCurrent}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm",
                    isDone && "bg-green-500 text-white shadow-green-500/20",
                    isCurrent && "bg-primary text-primary-foreground shadow-primary/20 ring-2 ring-primary/30",
                    !isDone && !isCurrent && "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon />}
                </div>
                <div className="hidden sm:block text-left">
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider leading-none",
                    isDone && "text-green-600",
                    isCurrent && "text-primary",
                    !isDone && !isCurrent && "text-muted-foreground",
                  )}>{s}</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5 leading-none">{STAGE_DESC[s]}</p>
                </div>
                {idx < STAGE_ORDER.length - 1 && (
                  <div className={cn("hidden sm:block w-8 h-px mx-1", isDone ? "bg-green-300" : "bg-border/50")} />
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}

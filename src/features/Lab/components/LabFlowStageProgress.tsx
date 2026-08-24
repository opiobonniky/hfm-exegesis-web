import { Check, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_ORDER, STAGE_ICONS } from "@/hooks/useLabFlow";
import { STAGE_PURPOSE, STAGE_TIME } from "../constants";

const STAGE_DESC: Record<string, string> = {
  look: "Observe", listen: "Listen", learn: "Study", abide: "Reflect",
};
interface Props {
  currentStage: string;
  onGoToStage: (stage: string) => void;
}
export default function LabFlowStageProgress({ currentStage, onGoToStage }: Props) {
  const currentStageIdx = STAGE_ORDER.indexOf(currentStage as any);
  const overallProgress = currentStageIdx >= 0 ? Math.round((currentStageIdx / (STAGE_ORDER.length - 1)) * 100) : 0;
  return (
    <div className="px-4 sm:px-6 py-3 bg-muted/20 border-b border-border/30">
      <div className="max-w-2xl mx-auto">
        {/* Overall progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">{overallProgress}% complete</span>
            <span className="text-muted-foreground/20">|</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-muted-foreground/50">
              <Timer className="w-2.5 h-2.5" />{STAGE_TIME[currentStage] || ""}
            </span>
        </div>
        {/* Stage icons */}
        <div className="flex items-center justify-between">
          {STAGE_ORDER.map((s, idx) => {
            const isDone = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const IconComp = STAGE_ICONS[s];
            return (
              <button key={s} onClick={() => { if (isDone) onGoToStage(s); }} className={cn("flex items-center gap-2 transition-all", isDone && "cursor-pointer hover:opacity-80", isCurrent && "cursor-default", !isDone && !isCurrent && "cursor-default opacity-35")} disabled={!isDone && !isCurrent}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm", isDone && "bg-green-500 text-white shadow-green-500/20", isCurrent && "bg-primary text-primary-foreground shadow-primary/20 ring-2 ring-primary/30", !isDone && !isCurrent && "bg-muted text-muted-foreground")}>
                  {isDone ? <Check className="w-4 h-4" /> : <IconComp className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider leading-none", isDone && "text-green-600", isCurrent && "text-primary", !isDone && !isCurrent && "text-muted-foreground")}>{s}</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5 leading-none">{STAGE_DESC[s]}</p>
                {idx < STAGE_ORDER.length - 1 && <div className={cn("hidden sm:block w-8 h-px mx-1", isDone ? "bg-green-300" : "bg-border/50")} />}
              </button>
            );
          })}
      </div>
    </div>
  );

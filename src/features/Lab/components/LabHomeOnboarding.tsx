import { X, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "../constants";

interface Props {
  onDismiss: () => void;
  step: number;
  onStepChange: (fn: (s: number) => number) => void;
}

export function LabHomeOnboarding({ onDismiss, step, onStepChange }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-rose-500" />
        <button onClick={onDismiss} className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors z-10"><X className="w-4 h-4 text-muted-foreground" /></button>
        <div className="p-6 pt-8">
          <div className="flex items-center gap-1.5 mb-6">
            {ONBOARDING_STEPS.map((_, idx) => (
              <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-300", idx === step ? "w-8 bg-primary" : idx < step ? "w-2 bg-primary/40" : "w-2 bg-muted-foreground/20")} />
            ))}
            <span className="ml-auto text-[9px] font-bold text-muted-foreground/40 tabular-nums">{step + 1} / {ONBOARDING_STEPS.length}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all", ONBOARDING_STEPS[step].bg)}>
              <Sparkles className={cn("w-8 h-8", ONBOARDING_STEPS[step].color)} />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{ONBOARDING_STEPS[step].title}</h3>
            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">{ONBOARDING_STEPS[step].desc}</p>
          </div>
          <div className="flex items-center justify-between mt-8 gap-3">
            {step > 0 ? <button onClick={() => onStepChange((s) => s - 1)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"><ChevronLeft className="w-3.5 h-3.5" />Back</button> : <div />}
            <button onClick={step < ONBOARDING_STEPS.length - 1 ? () => onStepChange((s) => s + 1) : onDismiss}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all">
              {step < ONBOARDING_STEPS.length - 1 ? "Next" : "Start Studying"}
            </button>
          </div>
          {step < ONBOARDING_STEPS.length - 1 && (
            <button onClick={onDismiss} className="w-full py-2.5 text-[10px] font-semibold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors border-t border-border/30">Skip tutorial</button>
          )}
        </div>
      </div>
    </div>
  );
}

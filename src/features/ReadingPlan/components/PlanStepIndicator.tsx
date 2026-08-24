import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_STEPS } from "../constants";

interface Props { currentStep: number; t: any; }

export function PlanStepIndicator({ currentStep, t }: Props) {
  return (
    <div className="flex items-center">
      {PLAN_STEPS.map((s, i) => {
        const active = currentStep === s.id;
        const done = currentStep > s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                active ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                  : done ? "text-emerald-600" : "text-muted-foreground/70",
              )}
            >
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", active ? "bg-card/20" : done ? "bg-emerald-100" : "bg-muted")}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className="hidden sm:block">
                {t.readingPlan[s.label as keyof typeof t.readingPlan] as string}
              </span>
            </div>
            {i < PLAN_STEPS.length - 1 && (
              <div className={cn("flex-1 h-px mx-2", currentStep > s.id ? "bg-emerald-200" : "bg-stone-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

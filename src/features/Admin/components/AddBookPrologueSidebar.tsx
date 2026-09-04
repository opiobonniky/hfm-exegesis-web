// AddBookPrologueSidebar — workflow step navigation with completion states.
import { BookOpen, CheckCircle2, Globe2, Layers, Sparkles } from "lucide-react";
import type { AddBookPrologueModel } from "../types";
import type { PrologueStepId } from "../types";

interface Props {
  model: AddBookPrologueModel;
  currentStep: PrologueStepId;
  currentStepIndex: number;
  stepCompletion: Record<PrologueStepId, boolean>;
  basicComplete: boolean;
  onStepChange: (step: PrologueStepId) => void;
}

const STEP_ICONS: Record<PrologueStepId, typeof BookOpen> = {
  basic: BookOpen,
  context: Globe2,
  themes: Layers,
  extra: Sparkles,
};

export function AddBookPrologueSidebar({
  model: h,
  currentStep,
  currentStepIndex,
  stepCompletion,
  basicComplete,
  onStepChange,
}: Props) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Workflow</p>
        <span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] text-muted-foreground">
          {currentStepIndex + 1}/{h.steps.length}
        </span>
      </div>

      <div className="space-y-3">
        {h.steps.map((step, index) => {
          const Icon = STEP_ICONS[step.id];
          const isActive = step.id === currentStep;
          const isDone = stepCompletion[step.id];
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(step.id)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? "border-sky-400/70 bg-sky-500/10 shadow-sm"
                  : "border-border bg-muted/40 hover:border-border hover:bg-muted"
              }`}
            >
              <div
                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border ${
                  isDone
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-600"
                    : isActive
                      ? "border-sky-400/40 bg-sky-500/10 text-sky-600"
                      : "border-border bg-background text-muted-foreground"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{step.label}</span>
                  <span className="text-[10px] text-muted-foreground">{index + 1}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-3">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Required</p>
        <ul className="mt-3 space-y-2 text-sm text-foreground">
          <li className="flex items-center justify-between gap-2">
            <span>Book & title</span>
            <span className={basicComplete ? "text-emerald-600" : "text-muted-foreground"}>
              {basicComplete ? "Ready" : "Missing"}
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

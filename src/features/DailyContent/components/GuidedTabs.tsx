import { useState, type ReactElement, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GuidedTabProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function GuidedTab({ children }: GuidedTabProps) {
  return <>{children}</>;
}

interface GuidedTabsProps {
  children: ReactElement<GuidedTabProps>[];
  validateStep: (step: number) => boolean;
  continueLabel?: string;
  backLabel?: string;
}

export function GuidedTabs({
  children,
  validateStep,
  continueLabel = "Continue",
  backLabel = "Back",
}: GuidedTabsProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const tabs = children;
  const currentTab = tabs[activeStep];
  const isLastStep = activeStep === tabs.length - 1;

  const completeCurrentStep = () => {
    if (!validateStep(activeStep)) return;
    setCompletedSteps((current) =>
      current.includes(activeStep) ? current : [...current, activeStep],
    );
    if (!isLastStep) setActiveStep((current) => current + 1);
  };

  const goBack = () => setActiveStep((current) => Math.max(0, current - 1));

  const selectStep = (step: number) => {
    if (step <= activeStep || completedSteps.includes(step - 1)) {
      setActiveStep(step);
    }
  };

  return (
    <div className="space-y-6">
      <nav aria-label="Daily verse form steps" className="overflow-x-auto pb-1">
        <ol
          className={cn(
            "grid min-w-[680px] gap-2",
            tabs.length === 5 ? "grid-cols-5" : "grid-cols-6",
          )}
        >
          {tabs.map((tab, index) => {
            const completed = completedSteps.includes(index);
            const active = activeStep === index;
            const available =
              index <= activeStep || completedSteps.includes(index - 1);

            return (
              <li key={tab.props.title}>
                <button
                  type="button"
                  onClick={() => selectStep(index)}
                  disabled={!available}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-left transition-colors",
                    active &&
                      "border-primary bg-primary/10 text-primary shadow-sm",
                    completed &&
                      !active &&
                      "border-emerald-200 bg-emerald-50 text-emerald-700",
                    !active &&
                      !completed &&
                      "border-border/60 bg-muted/20 text-muted-foreground",
                    !available && "cursor-not-allowed opacity-60",
                  )}
                >
                  {completed ? (
                    <Check className="h-4 w-4 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">
                      {tab.props.title}
                    </span>
                    {tab.props.description && (
                      <span className="hidden truncate text-[10px] opacity-75 xl:block">
                        {tab.props.description}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section aria-live="polite" className="min-h-[280px]">
        {currentTab}
      </section>

      <div className="flex items-center justify-between border-t border-border/60 pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={activeStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
        {!isLastStep && (
          <Button
            type="button"
            onClick={completeCurrentStep}
            className="gap-2 shadow-sm"
          >
            {continueLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

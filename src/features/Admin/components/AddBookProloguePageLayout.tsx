// AddBookProloguePageLayout — composes header, progress, sidebar, step forms, footer.
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROLOGUE_STEP_ORDER } from "../constants";
import { AddBookPrologueHeaderBar } from "./AddBookPrologueHeaderBar";
import { AddBookPrologueProgressCard } from "./AddBookPrologueProgressCard";
import { AddBookPrologueSidebar } from "./AddBookPrologueSidebar";
import { AddBookPrologueBasicForm } from "./AddBookPrologueBasicForm";
import { AddBookPrologueContextForm } from "./AddBookPrologueContextForm";
import { AddBookPrologueThemesForm } from "./AddBookPrologueThemesForm";
import { AddBookPrologueExtraForm } from "./AddBookPrologueExtraForm";
import { AddBookPrologueFooterActions } from "./AddBookPrologueFooterActions";
import { AddBookPrologueModel } from "../types";

interface Props {
  model: AddBookPrologueModel;
}

export function AddBookProloguePageLayout({ model: h }: Props) {
  if (h.loadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading book prologue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AddBookPrologueHeaderBar model={h} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <AddBookPrologueProgressCard model={h} completionPercent={h.completionPercent} />

        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <AddBookPrologueSidebar
            model={h}
            currentStep={h.currentStep}
            currentStepIndex={h.currentStepIndex}
            stepCompletion={h.stepCompletion}
            basicComplete={h.stepCompletion.basic}
            onStepChange={h.goToStep}
          />

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <Tabs value={h.activeStep} onValueChange={(v) => h.goToStep(v as never)}>
              <TabsList className="hidden" aria-hidden="true">
                {PROLOGUE_STEP_ORDER.map((step) => (
                  <TabsTrigger key={step} value={step}>
                    {step}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <AddBookPrologueBasicForm model={h} />
              </TabsContent>
              <TabsContent value="context" className="space-y-6">
                <AddBookPrologueContextForm model={h} />
              </TabsContent>
              <TabsContent value="themes" className="space-y-8">
                <AddBookPrologueThemesForm model={h} />
              </TabsContent>
              <TabsContent value="extra" className="space-y-8">
                <AddBookPrologueExtraForm model={h} />
              </TabsContent>
            </Tabs>

            <AddBookPrologueFooterActions
              model={h}
              currentStepIndex={h.currentStepIndex}
              stepCount={PROLOGUE_STEP_ORDER.length}
              onBack={h.goPrevious}
              onNext={h.goNext}
              canAdvance={h.canAdvanceFromCurrent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

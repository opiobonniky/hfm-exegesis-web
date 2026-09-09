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
import type {
  AddBookPrologueModel,
  AddBookProloguePageActions,
  AddBookProloguePageData,
} from "../types";

interface Props {
  data: AddBookProloguePageData;
  actions: AddBookProloguePageActions;
}

export function AddBookProloguePageLayout({ data, actions }: Props) {
  const state = { ...data, ...actions } as AddBookPrologueModel;

  if (state.loadingExisting) {
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
      <AddBookPrologueHeaderBar state={state} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <AddBookPrologueProgressCard state={state} completionPercent={state.completionPercent} />

        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <AddBookPrologueSidebar
            state={state}
            currentStep={state.currentStep}
            currentStepIndex={state.currentStepIndex}
            stepCompletion={state.stepCompletion}
            basicComplete={state.stepCompletion.basic}
            onStepChange={state.goToStep}
          />

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <Tabs value={state.activeStep} onValueChange={(v) => state.goToStep(v as never)}>
              <TabsList className="hidden" aria-hidden="true">
                {PROLOGUE_STEP_ORDER.map((step) => (
                  <TabsTrigger key={step} value={step}>
                    {step}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <AddBookPrologueBasicForm state={state} />
              </TabsContent>
              <TabsContent value="context" className="space-y-6">
                <AddBookPrologueContextForm state={state} />
              </TabsContent>
              <TabsContent value="themes" className="space-y-8">
                <AddBookPrologueThemesForm state={state} />
              </TabsContent>
              <TabsContent value="extra" className="space-y-8">
                <AddBookPrologueExtraForm state={state} />
              </TabsContent>
            </Tabs>

            <AddBookPrologueFooterActions
              state={state}
              currentStepIndex={state.currentStepIndex}
              stepCount={PROLOGUE_STEP_ORDER.length}
              onBack={state.goPrevious}
              onNext={state.goNext}
              canAdvance={state.canAdvanceFromCurrent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

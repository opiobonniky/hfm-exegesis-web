import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VERSE_EXPLANATION_STEP_ORDER } from "../constants";
import { useAddExplanation } from "../hooks/useAddExplanation";
import { AddExplanationHeaderBar } from "./AddExplanationHeaderBar";
import { AddExplanationProgressCard } from "./AddExplanationProgressCard";
import { AddExplanationSidebar } from "./AddExplanationSidebar";
import { AddExplanationReferenceForm } from "./AddExplanationReferenceForm";
import { AddExplanationExegesisForm } from "./AddExplanationExegesisForm";
import { AddExplanationStudyForm } from "./AddExplanationStudyForm";
import { AddExplanationExtrasForm } from "./AddExplanationExtrasForm";
import { AddExplanationFooterActions } from "./AddExplanationFooterActions";

interface Props {
  model: ReturnType<typeof useAddExplanation>;
}

export function AddExplanationComposer({ model: h }: Props) {
  if (h.loadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading verse explanation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AddExplanationHeaderBar model={h} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <AddExplanationProgressCard model={h} completionPercent={h.completionPercent} />

        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <AddExplanationSidebar
            model={h}
            currentStep={h.currentStep}
            currentStepIndex={h.currentStepIndex}
            stepCompletion={h.stepCompletion}
            referenceComplete={h.referenceComplete}
            exegesisComplete={h.exegesisComplete}
            onStepChange={h.goToStep}
          />

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <Tabs value={h.activeTab} onValueChange={(value) => h.setActiveTab(value as typeof h.activeTab)}>
              <TabsList className="hidden" aria-hidden="true">
                <TabsTrigger value="reference">Reference</TabsTrigger>
                <TabsTrigger value="exegesis">Exegesis</TabsTrigger>
                <TabsTrigger value="study">Study</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>

              <TabsContent value="reference" className="space-y-6">
                <AddExplanationReferenceForm model={h} />
              </TabsContent>

              <TabsContent value="exegesis" className="space-y-6">
                <AddExplanationExegesisForm model={h} />
              </TabsContent>

              <TabsContent value="study" className="space-y-8">
                <AddExplanationStudyForm model={h} />
              </TabsContent>

              <TabsContent value="extras" className="space-y-8">
                <AddExplanationExtrasForm model={h} />
              </TabsContent>
            </Tabs>

            <AddExplanationFooterActions
              model={h}
              currentStepIndex={h.currentStepIndex}
              stepCount={VERSE_EXPLANATION_STEP_ORDER.length}
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

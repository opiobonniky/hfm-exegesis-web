import { ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddExplanationFooterActionsProps } from "../types";

export function AddExplanationFooterActions({ isValid, saving, isEditMode, handleSave, currentStepIndex, stepCount, onBack, onNext, canAdvance }: AddExplanationFooterActionsProps) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        {isValid ? "Ready to publish" : "Still gathering details"}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {currentStepIndex > 0 && (
          <Button variant="outline" onClick={onBack}>Back</Button>
        )}

        {currentStepIndex < stepCount - 1 ? (
          <Button onClick={onNext} disabled={!canAdvance} className="gap-2">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={!isValid || saving} className="gap-2">
            {saving ? <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Save className="h-4 w-4" />}
            {isEditMode ? "Save changes" : "Submit explanation"}
          </Button>
        )}
      </div>
    </div>
  );
}

// AddBookPrologueFooterActions — back/continue navigation plus final save.
import { ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddBookPrologueModel } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  state: AddBookPrologueModel;
  currentStepIndex: number;
  stepCount: number;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
}

export function AddBookPrologueFooterActions({
  state: h,
  currentStepIndex,
  stepCount,
  onBack,
  onNext,
  canAdvance,
}: Props) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        {h.isValid ? tt("Ready to publish") : tt("Still gathering details")}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {currentStepIndex > 0 && (
          <Button variant="outline" onClick={onBack}>{tt("Back")}</Button>
        )}

        {currentStepIndex < stepCount - 1 ? (
          <Button onClick={onNext} disabled={!canAdvance} className="gap-2">{tt("Continue")}<ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={h.handleSave}
            disabled={!h.isValid || h.saving}
            className="gap-2"
          >
            {h.saving ? (
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {h.isEditMode ? tt("Save changes") : tt("Submit prologue")}
          </Button>
        )}
      </div>
    </div>
  );
}

import { CheckCircle2, Info, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AddExplanationPageModel } from "../hooks/useAddExplanation";
import { SaveActionsRow } from "./SaveActionsRow";

interface Props {
  model: AddExplanationPageModel;
}

export function AddExplanationSaveActions({ model: h }: Props) {
  return (
    <SaveActionsRow
      infoText={h.existingFound
        ? h.t.verseExplanations.savingOverwrite
        : h.t.verseExplanations.savingCreate}
      infoIcon={<Info className="w-3.5 h-3.5" />}
    >
      <Button
        onClick={h.handleSave}
        disabled={h.saving || !h.isValid || h.saved}
        size="lg"
        className={cn(
          "gap-2 min-w-36",
          h.saved
            ? "bg-emerald-600 hover:bg-emerald-600"
            : "bg-gradient-to-r from-primary to-primary/80 shadow-md",
        )}
      >
        {h.saved ? (
          <><CheckCircle2 className="w-4 h-4" /> {h.t.verseExplanations.savedLabel}</>
        ) : h.saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> {h.t.verseExplanations.savingLabel}</>
        ) : (
          <><Save className="w-4 h-4" /> {h.existingFound
            ? h.t.verseExplanations.updateExplanation
            : h.t.verseExplanations.saveExplanation}</>
        )}
      </Button>
    </SaveActionsRow>
  );
}

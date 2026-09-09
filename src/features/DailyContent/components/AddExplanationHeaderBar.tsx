import { ArrowLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddExplanationHeaderBarProps } from "../types";

export function AddExplanationHeaderBar({ isEditMode, isValid, saving, goBack, handleSave }: AddExplanationHeaderBarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full border border-border bg-muted/50 hover:bg-muted text-foreground" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-sky-600">Study workflow</p>
              <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">
                {isEditMode ? "Edit Verse Explanation" : "Create Verse Explanation"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Button variant="outline" onClick={goBack}>Cancel</Button>
            <Button onClick={handleSave} disabled={!isValid || saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEditMode ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

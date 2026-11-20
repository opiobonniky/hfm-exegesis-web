import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddExplanationHeaderBarProps } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

export function AddExplanationHeaderBar({ isEditMode, goBack }: AddExplanationHeaderBarProps) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary sm:block">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-widest text-primary">{tt("Study workflow")}</p>
              <h1 className="text-lg font-bold text-foreground sm:text-xl">
                {isEditMode ? tt("Edit Verse Explanation") : tt("Create Verse Explanation")}
              </h1>
            </div>
          </div>

          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {tt("Back to explanations")}
          </Button>
    </header>
  );
}

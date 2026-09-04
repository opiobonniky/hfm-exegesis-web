/**
 * ExplanationAutoFillBanner — shows when an existing verse explanation is found
 * for the selected verse, letting the author apply/adjust the auto-filled content.
 */
import { BookOpenCheck, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddDailyVersePageModel } from "../hooks/useAddDailyVerse";

interface Props {
  model: AddDailyVersePageModel;
}

export function ExplanationAutoFillBanner({ model: h }: Props) {
  if (h.explanationLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking for an existing verse explanation...
      </div>
    );
  }

  if (!h.explanationSource) return null;

  const reference = `${h.book} ${h.chapter}:${h.verseNumber}`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
        <div className="text-sm text-sky-800">
          <p className="font-medium">
            Found an existing explanation for {reference}
          </p>
          <p className="mt-0.5 text-sky-700/80">
            Its content was pasted into the matching fields. Review and edit as
            needed, or overwrite them all with the explanation content.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 gap-2 border-sky-300 bg-white text-sky-700 hover:bg-sky-100"
        onClick={() => h.applyExplanation(h.explanationSource)}
      >
        <Sparkles className="h-3.5 w-3.5" /> Overwrite with explanation
      </Button>
    </div>
  );
}

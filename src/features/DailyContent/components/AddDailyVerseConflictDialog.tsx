import { AlertTriangle, BookOpen, CalendarDays, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { AddDailyVersePageViewModel } from "../hooks/useAddDailyVerse";

interface Props {
  model: AddDailyVersePageViewModel;
}

const formatExistingDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

export function AddDailyVerseConflictDialog({ model: h }: Props) {
  const existing = h.conflictDialog.conflict?.existing;
  const reference = existing?.bookName
    ? `${existing.bookName} ${existing.chapter}:${existing.verseNumber}`
    : "";
  const existingDate = formatExistingDate(existing?.displayDate);

  return (
    <Dialog open={h.conflictDialog.open} onOpenChange={h.handleConflictOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {h.t.dailyVerse.verseAlreadyExists}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">{h.conflictMessage}</span>
            <span className="block">
              {tt("Choose whether to open the existing entry, replace it with the details you just entered, or keep editing.")}
            </span>
          </DialogDescription>
        </DialogHeader>

        {(reference || existingDate || existing?.title) && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
            {existing?.title && (
              <p className="font-medium text-foreground">{existing.title}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              {reference && (
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {reference}
                </span>
              )}
              {existingDate && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {existingDate}
                </span>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={h.closeConflict}>
            {tt("Keep editing")}
          </Button>
          <Button variant="outline" onClick={h.viewExisting}>
            <BookOpen className="h-4 w-4 mr-2" /> {h.t.dailyVerse.viewExisting}
          </Button>
          <Button onClick={h.handleConflictUpdate}>
            <RefreshCw className="h-4 w-4 mr-2" /> {tt("Replace existing")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

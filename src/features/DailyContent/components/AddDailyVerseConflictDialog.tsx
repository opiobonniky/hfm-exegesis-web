import { AlertTriangle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AddDailyVersePageModel } from "../hooks/useAddDailyVerse";

interface Props {
  model: AddDailyVersePageModel;
}

export function AddDailyVerseConflictDialog({ model: h }: Props) {
  return (
    <Dialog open={h.conflictDialog.open} onOpenChange={h.handleConflictOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {h.t.dailyVerse.verseAlreadyExists}
          </DialogTitle>
          <DialogDescription>
            {h.conflictMessage} {h.t.dailyVerse.verseConflictUpdatePrompt}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={h.closeConflict}>
            {h.t.common.cancel}
          </Button>
          <Button variant="outline" onClick={h.viewExisting}>
            <BookOpen className="h-4 w-4 mr-2" /> {h.t.dailyVerse.viewExisting}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

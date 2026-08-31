// VerseExplanationDeleteDialog — confirmation dialog for deleting a verse explanation
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface VerseExplanationDeleteDialogProps {
  open: boolean;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  deleting: boolean;
  deletingId: number | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function VerseExplanationDeleteDialog({
  open,
  bookName,
  chapter,
  verseNumber,
  deleting,
  deletingId,
  onOpenChange,
  onConfirm,
}: VerseExplanationDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" /> Delete
          </DialogTitle>
          <DialogDescription>
            Delete explanation for{" "}
            <strong>
              {bookName} {chapter}:{verseNumber}
            </strong>
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
            className="gap-2"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}{" "}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

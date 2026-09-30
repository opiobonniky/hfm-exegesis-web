// JournalDeleteDialog — confirmation dialog for deleting a journal entry
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { tt } from '@/components/languages/hardcodedTranslate';

interface JournalDeleteDialogProps {
  open: boolean;
  title: string | null;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function JournalDeleteDialog({
  open,
  title,
  deleting,
  onOpenChange,
  onConfirm,
}: JournalDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tt("Delete Journal Entry")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{tt("Are you sure you want to delete this entry? This action cannot be undone.")}</p>
        {title && (
          <p className="text-sm font-medium">&ldquo;{title}&rdquo;</p>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >{tt("Cancel")}</Button>
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
            )}{" "}{tt("Delete")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

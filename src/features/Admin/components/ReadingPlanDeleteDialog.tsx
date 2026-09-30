// ReadingPlanDeleteDialog — confirmation dialog for deleting a reading plan
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

interface ReadingPlanDeleteDialogProps {
  open: boolean;
  title: string | null;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ReadingPlanDeleteDialog({
  open,
  title,
  deleting,
  onOpenChange,
  onConfirm,
}: ReadingPlanDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tt("Delete Reading Plan")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{tt("Are you sure you want to delete “")}{title}{tt("”? This action cannot be undone.")}</p>
        <DialogFooter className="gap-2">
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

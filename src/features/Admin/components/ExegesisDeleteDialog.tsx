// ExegesisDeleteDialog — confirm delete for a daily exegesis
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  open: boolean;
  title: string | null;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ExegesisDeleteDialog({
  open,
  title,
  deleting,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />{tt("Delete Exegesis")}</DialogTitle>
          <DialogDescription>{tt("Are you sure you want to delete")}<strong>{title}</strong>{tt("? This action cannot be undone.")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tt("Cancel")}</Button>
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

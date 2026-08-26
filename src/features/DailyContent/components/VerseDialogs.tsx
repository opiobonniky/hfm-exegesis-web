import { AlertTriangle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getConflictMessage } from "../constants";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: any;
  isDeleting: boolean;
  onConfirm: () => void;
  t?: any;
}

export function DeleteVerseDialog({ open, onOpenChange, target, isDeleting, onConfirm, t }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Verse</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete {target?.bookName} {target?.chapter}:{target?.verseNumber}?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t?.common?.cancel || "Cancel"}</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: any;
  t?: any;
  onUpdate: () => void;
}

export function ConflictVerseDialog({ open, onOpenChange, conflict, t, onUpdate }: ConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-5 h-5" />Verse Already Exists
          </DialogTitle>
          <DialogDescription>
            {getConflictMessage(conflict, t)} Update the existing entry instead?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onUpdate}>
            <Save className="w-4 h-4 mr-2" />Update Existing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

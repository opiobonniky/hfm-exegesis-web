import { Trash2, Loader2, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getVerseText } from "@/utilities/bibleUtils";
import { formatDisplayDate, getConflictMessage } from "../constants";
import type { DailyVerseItem } from "../types";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: DailyVerseItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
}
export function DeleteVerseDialog({ open, onOpenChange, target, isDeleting, onConfirm }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />Delete Daily Verse
          </DialogTitle>
          <DialogDescription>This will permanently remove the verse. This action cannot be undone.</DialogDescription>
        </DialogHeader>
        {target && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1.5">
            <p className="font-semibold text-sm">{target.bookName} {target.chapter}:{target.verseNumber}</p>
            <p className="text-xs text-muted-foreground">{formatDisplayDate(target.displayDate)}</p>
            <p className="text-sm text-muted-foreground italic line-clamp-2 pt-1">
              &ldquo;{getVerseText(target.bookName, target.chapter, target.verseNumber)}&rdquo;
            </p>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="gap-2">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Verse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
interface ConflictDialogProps {
  conflict: any;
  t?: any;
  onUpdate: () => void;
export function ConflictVerseDialog({ open, onOpenChange, conflict, t, onUpdate }: ConflictDialogProps) {
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-5 h-5" />Verse Already Exists
          <DialogDescription>
            {getConflictMessage(conflict, t)} Update the existing entry instead?
          </DialogDescription>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onUpdate}>
            <Save className="w-4 h-4 mr-2" />Update Existing

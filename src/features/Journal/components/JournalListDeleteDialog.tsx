import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { JournalPageEntry } from "../hooks/useJournalPageFull";

interface JournalListDeleteDialogProps {
  entry: JournalPageEntry | null;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function JournalListDeleteDialog({ entry, deleting, onOpenChange, onClose, onConfirm }: JournalListDeleteDialogProps) {
  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border dark:border-stone-800">
        <DialogHeader><DialogTitle className="text-foreground dark:text-stone-200">Delete Journal Entry</DialogTitle></DialogHeader>
        <div className="text-sm text-muted-foreground dark:text-muted-foreground/70">Are you sure you want to delete this entry? This action cannot be undone.</div>
        {entry?.title && <div className="text-sm font-medium text-foreground dark:text-stone-200">&ldquo;{entry.title}&rdquo;</div>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl border-border dark:border-stone-800">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting} className="rounded-xl">
            {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

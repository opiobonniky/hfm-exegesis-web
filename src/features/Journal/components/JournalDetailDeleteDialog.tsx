import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface JournalDetailDeleteDialogProps {
  open: boolean;
  title: string | null;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function JournalDetailDeleteDialog(props: JournalDetailDeleteDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="rounded-2xl border-border dark:border-stone-800">
        <DialogHeader><DialogTitle>Delete Entry</DialogTitle></DialogHeader>
        <div className="text-sm text-muted-foreground dark:text-muted-foreground/70">This cannot be undone.</div>
        {props.title && <div className="text-sm font-medium text-foreground dark:text-stone-200">&ldquo;{props.title}&rdquo;</div>}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={props.onCancel} className="rounded-xl">Cancel</Button>
          <Button variant="destructive" onClick={props.onDelete} disabled={props.deleting} className="rounded-xl">
            {props.deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

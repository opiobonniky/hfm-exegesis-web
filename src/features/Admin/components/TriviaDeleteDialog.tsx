// Admin trivia delete confirmation dialog
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  target: any | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TriviaDeleteDialog({ target, deleting, onClose, onConfirm }: Props) {
  return (
    <Dialog open={!!target} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" />{tt("Delete Question")}</DialogTitle>
          <DialogDescription>{tt("This action cannot be undone. This will also remove all associated answers.")}</DialogDescription>
        </DialogHeader>
        {target && (
          <div className="py-2">
            <p className="text-sm font-medium mb-1">{target.question}</p>
            <p className="text-xs text-muted-foreground">{tt("Difficulty:")}{target.difficulty}{tt("· Category:")}{target.category}</p>
          </div>
        )}
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={deleting} className="w-full sm:w-auto">{tt("Cancel")}</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting} className="gap-2 w-full sm:w-auto">
            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />{tt("Deleting...")}</> : <><Trash2 className="w-4 h-4" />{tt("Delete")}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

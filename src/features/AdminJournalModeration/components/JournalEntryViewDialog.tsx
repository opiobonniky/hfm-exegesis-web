import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { JournalModerationEntry } from "../hooks/useAdminJournalModerationPage";

interface Props {
  entry: JournalModerationEntry | null;
  onClose: () => void;
}

export function JournalEntryViewDialog({ entry, onClose }: Props) {
  return (
    <Dialog open={!!entry} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry?.title}</DialogTitle>
          <DialogDescription>
            By {entry?.username} • {entry && new Date(entry.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Verse Reference</p>
            <p className="text-sm">{entry?.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Content</p>
            <div className="text-sm whitespace-pre-wrap rounded-lg bg-muted p-4">{entry?.content}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ExportModal } from "./ExportModal";

interface JournalListExportDialogProps {
  open: boolean;
  selectedIds: Set<number>;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function JournalListExportDialog({ open, selectedIds, onOpenChange, onClose }: JournalListExportDialogProps) {
  const exportIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border dark:border-stone-800 max-w-lg">
        <DialogTitle className="sr-only">Export Journal Entries</DialogTitle>
        <ExportModal onClose={onClose} selectedIds={exportIds} />
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { downloadJournalPdf } from "../journalActions";
import { tt } from "@/components/languages/hardcodedTranslate";

export function ExportModal({ onClose, selectedIds = [] }: { onClose: () => void; selectedIds?: number[] }) {
  const [busy, setBusy] = useState(false); const { toast } = useToast();
  return <div className="space-y-5 p-6"><h3 className="text-lg font-bold">{tt("Download PDF")}</h3><p className="text-sm text-muted-foreground">{selectedIds.length} {tt("selected entries")}</p><div className="flex justify-end gap-3">
    <Button variant="outline" disabled={busy} onClick={onClose}>{tt("Cancel")}</Button>
    <Button disabled={busy || !selectedIds.length} className="gap-2 bg-red-600 text-white hover:bg-red-700" onClick={async () => {
      if (busy) return; setBusy(true);
      try { await downloadJournalPdf(selectedIds); onClose(); } catch (err) { toast({ title: tt("Export failed"), variant: "destructive" }); } finally { setBusy(false); }
    }}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}PDF</Button>
  </div></div>;
}

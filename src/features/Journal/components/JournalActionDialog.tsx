import { Download, Share2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { tt } from "@/components/languages/hardcodedTranslate";
import { downloadJournalPdf, shareJournalEntries, type ShareableJournal } from "../journalActions";

export interface JournalAction { kind: "pdf" | "share"; entries: ShareableJournal[] }
export function JournalActionDialog({ action, onClose }: { action: JournalAction | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false); const { toast } = useToast();
  const pdf = action?.kind !== "share"; const Icon = pdf ? Download : Share2;
  const run = async () => {
    if (!action?.entries.length || busy) return; setBusy(true);
    try {
      if (pdf) { await downloadJournalPdf(action.entries.map(e => e.id)); toast({ title: tt("PDF downloaded") }); }
      else { const result = await shareJournalEntries(action.entries); if (result === "copied") toast({ title: tt("Journal copied to clipboard") }); }
      onClose();
    } catch (err) { toast({ title: tt(pdf ? "Export failed" : "Failed to share"), description: err instanceof Error ? err.message : undefined, variant: "destructive" }); }
    finally { setBusy(false); }
  };
  return <Dialog open={!!action} onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent onEscapeKeyDown={e => { if (busy) e.preventDefault(); }} onPointerDownOutside={e => { if (busy) e.preventDefault(); }}>
      <DialogHeader><DialogTitle className="flex items-center gap-2"><Icon className={`size-5 ${pdf ? "text-red-600 dark:text-red-400" : "text-primary"}`} />{tt(pdf ? "Download PDF" : "Share journal")}</DialogTitle>
        <DialogDescription>{action?.entries.length === 1 ? action.entries[0].title || tt("Journal entry") : `${action?.entries.length || 0} ${tt("selected entries")}`}</DialogDescription>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">{tt(pdf ? "Download your selected journal entries as a PDF." : "Share journal text through another app, or copy it when sharing is unavailable. This does not publish your entries.")}</p>
      <DialogFooter><Button variant="outline" disabled={busy} onClick={onClose}>{tt("Cancel")}</Button><Button disabled={busy || !action?.entries.length} onClick={run} className={pdf ? "gap-2 bg-red-600 text-white hover:bg-red-700" : "gap-2"}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}{tt(pdf ? "PDF" : "Share")}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

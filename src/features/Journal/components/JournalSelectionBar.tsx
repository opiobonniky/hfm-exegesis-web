import { Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from "@/components/languages/hardcodedTranslate";

interface Props { selectedCount: number; entryCount: number; onToggleAll: () => void; onClear: () => void; onExport: () => void; onShare: () => void; onCancel: () => void }
export function JournalSelectionBar(p: Props) {
  return <div className="sticky top-0 z-10 mb-5 rounded-2xl border bg-card/95 p-4 shadow-sm backdrop-blur" role="toolbar" aria-label={tt("Selected journals")}>
    <div className="flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-sm font-semibold">{p.selectedCount} {tt("selected")}</p><div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="ghost" onClick={p.onToggleAll}>{p.selectedCount === p.entryCount ? tt("Deselect all") : tt("Select all on this page")}</Button>
      <Button size="sm" variant="ghost" onClick={p.onClear} disabled={!p.selectedCount}>{tt("Clear")}</Button>
      <Button size="sm" variant="outline" disabled={!p.selectedCount} onClick={p.onExport} className="gap-2 border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400"><Download className="size-4" />PDF</Button>
      <Button size="sm" variant="outline" disabled={!p.selectedCount} onClick={p.onShare} className="gap-2 border-primary/30 bg-primary/10 text-primary"><Share2 className="size-4" />{tt("Share")}</Button>
      <Button size="sm" variant="ghost" onClick={p.onCancel}><X className="me-1 size-4" />{tt("Cancel")}</Button>
    </div></div>
  </div>;
}

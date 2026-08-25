import { BookText, Download, Plus, CheckSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";

interface Props {
  t: any; isRtl: boolean; navigate: (p: string) => void;
  stats: { totalEntries: number; entriesThisWeek: number } | null;
  viewMode: string; selectionMode: boolean; setSelectionMode: (v: boolean) => void;
  selectedIds: Set<number>; setShowExportModal: (v: boolean) => void;
  exitSelectionMode: () => void;
}

export function JournalHeader({ t, isRtl, navigate, stats, viewMode, selectionMode, setSelectionMode, selectedIds, setShowExportModal, exitSelectionMode }: Props) {
  return (
    <div className="border-b border-border/60 dark:border-stone-800/60 bg-card/50 dark:bg-stone-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-card dark:bg-stone-900 border border-border dark:border-stone-800 flex items-center justify-center shrink-0 shadow-sm">
              <BookText className="w-5 h-5 text-foreground/80 dark:text-muted-foreground/50" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground dark:text-stone-100 tracking-tight">Legacy Ledger</h1>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">
                {stats ? `${stats.totalEntries} entries · ${stats.entriesThisWeek} this week` : "Your study archive"}
              </p>
            </div>
          </div>
          {viewMode === "my" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
                className={cn("rounded-xl border-border dark:border-stone-800 text-xs", selectionMode && "bg-foreground/10 text-foreground border-border")}>
                {selectionMode ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}{selectionMode ? "Cancel" : "Select"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)} className="rounded-xl border-border dark:border-stone-800 text-xs gap-1.5">
                <Download className="w-4 h-4" />{selectedIds.size > 0 ? `Export (${selectedIds.size})` : "Export"}
              </Button>
              <Button size="sm" onClick={() => navigate(routes.newJournalEntry.path)} className="rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground gap-2 text-xs">
                <Plus className="w-4 h-4" />New Entry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

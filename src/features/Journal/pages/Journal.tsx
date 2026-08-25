import { useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft, ChevronRight, CheckSquare, Square, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Gate } from "@/components/Gate";
import { TierBadge } from "@/components/TierBadge";
import { routes } from "@/components/Routes/routes";
import { useJournalPageFull } from "../hooks/useJournalPageFull";
import { JournalHeader } from "../components/JournalHeader";
import { JournalSegmentControl } from "../components/JournalSegmentControl";
import { JournalStatsCards } from "../components/JournalStatsCards";
import { JournalFilterBar } from "../components/JournalFilterBar";
import { JournalEmptyState } from "../components/JournalEmptyState";
import { ExportModal } from "../components/ExportModal";

export default function LegacyLedgerPage() {
  const p = useJournalPageFull();
  const { t, isRtl, navigate, userInfo, handleTierBadgeClick, sowerPortalLoading, entries, stats, loading, page, setPage, totalPages, hasNext, hasPrevious, search, setSearch, category, setCategory, bookName, setBookName, source, setSource, strongsId, setStrongsId, startDate, setStartDate, endDate, setEndDate, viewMode, setViewMode, deleteDialog, setDeleteDialog, deleting, handleDelete, showExportModal, setShowExportModal, showFilters, setShowFilters, selectionMode, setSelectionMode, selectedIds, setSelectedIds, exitSelectionMode, refresh, setSearchDebounced, renderEntry, selectAll, clearSelection, hasActiveFilters, clearAllFilters } = p;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <TierBadge onClick={handleTierBadgeClick} loading={sowerPortalLoading} />
      </div>
      <Gate tier="legacy_sower" featureName="Legacy Ledger" featureDescription="Your complete study archive and private journal. Save Exegesis Lab results, write reflections, track prayers, and export your entire Legacy Ledger.">
        <div className="min-h-full bg-amber-50/30 dark:bg-stone-950" dir={isRtl ? "rtl" : "ltr"}>
          <JournalHeader t={t} isRtl={isRtl} navigate={navigate} stats={stats} viewMode={viewMode} selectionMode={selectionMode} setSelectionMode={setSelectionMode} selectedIds={selectedIds} setShowExportModal={setShowExportModal} exitSelectionMode={exitSelectionMode} />
          <JournalSegmentControl viewMode={viewMode} setViewMode={setViewMode} showFilters={showFilters} setShowFilters={setShowFilters} hasActiveFilters={hasActiveFilters} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {viewMode === "my" && stats && !hasActiveFilters && <JournalStatsCards stats={stats} />}
            <JournalFilterBar t={t} isRtl={isRtl} search={search} setSearch={(v) => { setSearch(v); setSearchDebounced(v); }} category={category} setCategory={setCategory}
              showFilters={showFilters} viewMode={viewMode} bookName={bookName} setBookName={setBookName} source={source} setSource={setSource}
              strongsId={strongsId} setStrongsId={setStrongsId} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
              hasActiveFilters={hasActiveFilters} clearAllFilters={clearAllFilters} />

            {selectionMode && entries.length > 0 && (
              <div className="sticky top-14 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 mb-4 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => selectedIds.size === entries.length ? clearSelection() : selectAll()} className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors">
                      {selectedIds.size === entries.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      {selectedIds.size === entries.length ? "Deselect All" : "Select All"}
                    </button>
                    <span className="text-xs text-muted-foreground/70">{selectedIds.size} of {entries.length} selected</span>
                  </div>
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <button onClick={clearSelection} className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors px-3 py-1.5 rounded-xl border border-border hover:border-foreground/30">Clear</button>
                      <button onClick={() => setShowExportModal(true)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 text-foreground hover:bg-amber-400 transition-all">
                        <Download className="w-3.5 h-3.5" />Export Selected ({selectedIds.size})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : entries.length === 0 ? (
              <JournalEmptyState hasSearch={!!search} currentCategory={category} isDiscover={viewMode === "discover"} onCreateNew={() => navigate(routes.newJournalEntry.path)} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{entries.map(renderEntry)}</div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border dark:border-stone-800">
                <Button variant="outline" disabled={!hasPrevious} onClick={() => setPage((p) => Math.max(p - 1, 1))} className="rounded-xl border-border dark:border-stone-800">
                  <ChevronLeft className={cn("w-4 h-4", isRtl ? "ml-2 order-1" : "mr-2")} />Previous
                </Button>
                <span className="text-sm text-muted-foreground dark:text-muted-foreground/70">Page {page} of {totalPages}</span>
                <Button variant="outline" disabled={!hasNext} onClick={() => setPage((p) => p + 1)} className="rounded-xl border-border dark:border-stone-800">
                  Next<ChevronRight className={cn("w-4 h-4", isRtl ? "mr-2" : "ml-2")} />
                </Button>
              </div>
            )}
          </div>

          <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
            <DialogContent className="rounded-2xl border-border dark:border-stone-800">
              <DialogHeader><DialogTitle className="text-foreground dark:text-stone-200">Delete Journal Entry</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">Are you sure you want to delete this entry? This action cannot be undone.</p>
              {deleteDialog?.title && <p className="text-sm font-medium text-foreground dark:text-stone-200">&ldquo;{deleteDialog.title}&rdquo;</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialog(null)} className="rounded-xl border-border dark:border-stone-800">Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{deleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showExportModal} onOpenChange={(open) => { if (!open) { setShowExportModal(false); if (selectedIds.size > 0) exitSelectionMode(); } }}>
            <DialogContent className="rounded-2xl border-border dark:border-stone-800 max-w-lg">
              <DialogTitle className="sr-only">Export Journal Entries</DialogTitle>
              <ExportModal onClose={() => { setShowExportModal(false); if (selectedIds.size > 0) exitSelectionMode(); }} selectedIds={selectedIds.size > 0 ? Array.from(selectedIds) : undefined} />
            </DialogContent>
          </Dialog>
        </div>
      </Gate>
    </>
  );
}

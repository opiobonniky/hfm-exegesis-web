import { Gate } from "@/components/Gate";
import { Search, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { JournalPageModel } from "../hooks/useJournalPageFull";
import { JournalEmptyState } from "./JournalEmptyState";
import { JournalHeader } from "./JournalHeader";
import { JournalListDeleteDialog } from "./JournalListDeleteDialog";
import { JournalListEntriesGrid } from "./JournalListEntriesGrid";
import { JournalListLoadingState } from "./JournalListLoadingState";
import { JournalListPagination } from "./JournalListPagination";
import { JournalSelectionBar } from "./JournalSelectionBar";
import { JournalActionDialog } from "./JournalActionDialog";

export function JournalListPageLayout({ page: p }: { page: JournalPageModel }) {
  return <Gate tier="legacy_sower" featureName="Journal" featureDescription="Your personal journal. Preserve reflections, prayers and lessons, then download or share selected entries.">
    <div className="min-h-full bg-background" dir={p.isRtl ? "rtl" : "ltr"}>
      <JournalHeader onCreate={p.createEntry} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-3"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border bg-card px-4"><Search className="size-4 text-muted-foreground" /><input aria-label={tt("Search entries")} placeholder={tt("Search entries...")} value={p.search} onChange={e => p.handleSearchChange(e.target.value)} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" />{p.search && <button aria-label={tt("Clear search")} onClick={() => p.handleSearchChange("")}><X className="size-4" /></button>}</label><Button variant="outline" size="icon" onClick={p.refresh} disabled={p.loading} aria-label={tt("Refresh journals")}><RefreshCw className="size-4" /></Button></div>
        <p className="mb-5 text-xs text-muted-foreground">{tt("Hold a card or press Space to select. Press Escape to cancel.")}</p>
        {p.selectionMode && <JournalSelectionBar selectedCount={p.selectedIds.size} entryCount={p.entries.length} onToggleAll={p.toggleSelectAll} onClear={p.clearSelection} onCancel={p.exitSelectionMode} onExport={() => p.openEntryAction("pdf")} onShare={() => p.openEntryAction("share")} />}
        {p.loading && <JournalListLoadingState />}
        {!p.loading && !p.entries.length && <JournalEmptyState hasSearch={!!p.search} currentCategory="all" isDiscover={false} onCreateNew={p.createEntry} />}
        {p.entries.length > 0 && <JournalListEntriesGrid entries={p.entries} selectionMode={p.selectionMode} selectedIds={p.selectedIds} onSelect={p.toggleEntrySelection} onBeginSelection={p.beginSelection} onView={p.viewEntry} onDelete={p.openDeleteDialog} onFavorite={p.toggleFavorite} onAction={p.openEntryAction} />}
        <JournalListPagination page={p.page} totalPages={p.totalPages} hasPrevious={p.hasPrevious && !p.loading} hasNext={p.hasNext && !p.loading} isRtl={p.isRtl} onPrevious={p.handlePreviousPage} onNext={p.handleNextPage} />
      </main>
      <JournalListDeleteDialog entry={p.deleteDialog} deleting={p.deleting} onOpenChange={p.handleDeleteDialogOpenChange} onClose={p.closeDeleteDialog} onConfirm={p.handleDelete} />
      <JournalActionDialog action={p.entryAction} onClose={p.closeEntryAction} />
    </div>
  </Gate>;
}

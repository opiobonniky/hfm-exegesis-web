import { Gate } from "@/components/Gate";
import { TierBadge } from "@/components/TierBadge";
import type { JournalPageModel } from "../hooks/useJournalPageFull";
import { JournalEmptyState } from "./JournalEmptyState";
import { JournalFilterBar } from "./JournalFilterBar";
import { JournalHeader } from "./JournalHeader";
import { JournalSegmentControl } from "./JournalSegmentControl";
import { JournalStatsCards } from "./JournalStatsCards";
import { JournalListDeleteDialog } from "./JournalListDeleteDialog";
import { JournalListEntriesGrid } from "./JournalListEntriesGrid";
import { JournalListExportDialog } from "./JournalListExportDialog";
import { JournalListLoadingState } from "./JournalListLoadingState";
import { JournalListPagination } from "./JournalListPagination";
import { JournalSelectionBar } from "./JournalSelectionBar";

interface JournalListPageLayoutProps {
  page: JournalPageModel;
}

export function JournalListPageLayout({ page }: JournalListPageLayoutProps) {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <TierBadge onClick={page.handleTierBadgeClick} loading={page.sowerPortalLoading} />
      </div>
      <Gate tier="legacy_sower" featureName="Legacy Ledger" featureDescription="Your complete study archive and private journal. Save Exegesis Lab results, write reflections, track prayers, and export your entire Legacy Ledger.">
        <div className="min-h-full bg-amber-50/30 dark:bg-stone-950" dir={page.isRtl ? "rtl" : "ltr"}>
          <JournalHeader
            stats={page.stats}
            viewMode={page.viewMode}
            selectionMode={page.selectionMode}
            selectedCount={page.selectedIds.size}
            onToggleSelectionMode={page.toggleSelectionMode}
            onExport={page.openExportDialog}
            onCreate={page.createEntry}
          />
          <JournalSegmentControl
            viewMode={page.viewMode}
            setViewMode={page.handleViewModeChange}
            showFilters={page.showFilters}
            setShowFilters={page.setShowFilters}
            hasActiveFilters={page.hasActiveFilters}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {page.viewMode === "my" && page.stats && !page.hasActiveFilters && <JournalStatsCards stats={page.stats} />}
            <JournalFilterBar
              t={page.t}
              isRtl={page.isRtl}
              search={page.search}
              setSearch={page.handleSearchChange}
              category={page.category}
              setCategory={page.setCategory}
              showFilters={page.showFilters}
              viewMode={page.viewMode}
              bookName={page.bookName}
              setBookName={page.setBookName}
              source={page.source}
              setSource={page.setSource}
              strongsId={page.strongsId}
              setStrongsId={page.setStrongsId}
              startDate={page.startDate}
              setStartDate={page.setStartDate}
              endDate={page.endDate}
              setEndDate={page.setEndDate}
              hasActiveFilters={page.hasActiveFilters}
              clearAllFilters={page.clearAllFilters}
            />

            {page.selectionMode && page.entries.length > 0 && (
              <JournalSelectionBar
                selectedCount={page.selectedIds.size}
                entryCount={page.entries.length}
                onToggleAll={page.toggleSelectAll}
                onClear={page.clearSelection}
                onExport={page.openExportDialog}
              />
            )}

            {page.loading && <JournalListLoadingState />}
            {!page.loading && page.entries.length === 0 && (
              <JournalEmptyState
                hasSearch={!!page.search}
                currentCategory={page.category}
                isDiscover={page.viewMode === "discover"}
                onCreateNew={page.createEntry}
              />
            )}
            {!page.loading && page.entries.length > 0 && (
              <JournalListEntriesGrid
                entries={page.entries}
                selectionMode={page.selectionMode}
                selectedIds={page.selectedIds}
                onSelect={page.toggleEntrySelection}
                onView={page.viewEntry}
                onDelete={page.openDeleteDialog}
              />
            )}

            <JournalListPagination
              page={page.page}
              totalPages={page.totalPages}
              hasPrevious={page.hasPrevious}
              hasNext={page.hasNext}
              isRtl={page.isRtl}
              onPrevious={page.handlePreviousPage}
              onNext={page.handleNextPage}
            />
          </div>

          <JournalListDeleteDialog
            entry={page.deleteDialog}
            deleting={page.deleting}
            onOpenChange={page.handleDeleteDialogOpenChange}
            onClose={page.closeDeleteDialog}
            onConfirm={page.handleDelete}
          />
          <JournalListExportDialog
            open={page.showExportModal}
            selectedIds={page.selectedIds}
            onOpenChange={page.handleExportDialogOpenChange}
            onClose={page.closeExportDialog}
          />
        </div>
      </Gate>
    </>
  );
}

import DailyVerseHeader from "../components/DailyVerseHeader";
import VerseFilterBar from "../components/VerseFilterBar";
import DailyVerseFeaturedVerse from "../components/DailyVerseFeaturedVerse";
import DailyVerseGrid from "../components/DailyVerseGrid";
import DailyVerseLoadingSkeleton from "../components/DailyVerseLoadingSkeleton";
import DailyVerseEmptyState from "../components/DailyVerseEmptyState";
import EditVerseDialog from "../components/EditVerseDialog";
import { DeleteVerseDialog, ConflictVerseDialog } from "../components/VerseDialogs";
import { useDailyVersePage } from "../hooks/useDailyVersePage";

export default function DailyVerse() {
  const p = useDailyVersePage();

  if (p.loading) return <DailyVerseLoadingSkeleton />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" dir={p.isRtl ? "rtl" : "ltr"}>
      <DailyVerseHeader onAdd={() => p.navigate("/admin/daily-verse/add")} />

      <VerseFilterBar
        fromDate={p.fromDate}
        toDate={p.toDate}
        activePreset={p.activePreset}
        filterError={p.filterError}
        isFiltered={p.isFiltered}
        futureCount={p.futureCount}
        onFromChange={p.setFromDate}
        onToChange={p.setToDate}
        onApply={p.validateAndApply}
        onClear={p.clearFilter}
        onPreset={p.applyPreset}
      />

      {p.selectedVerse && (
        <DailyVerseFeaturedVerse
          verse={p.selectedVerse}
          onOpenBible={p.openInBible}
          onWriteJournal={p.openInJournal}
        />
      )}

      <DailyVerseGrid
        verses={p.verses}
        selectedIndex={p.selectedIndex}
        isAdmin={p.isAdmin}
        onSelect={p.setSelectedIndex}
        onView={(v) => p.navigate(`/daily-verse-detail?verse=${encodeURIComponent(JSON.stringify(v))}`)}
        onEdit={p.openEdit}
        onDelete={p.openDelete}
        page={p.page}
        totalPages={p.totalPages}
        hasNext={p.hasNext}
        hasPrevious={p.hasPrevious}
        onPageChange={p.setPage}
      />

      {p.verses.length === 0 && !p.loading && (
        <DailyVerseEmptyState
          isFiltered={p.isFiltered}
          onClearFilter={p.clearFilter}
          onRefresh={p.refresh}
        />
      )}

      {p.editState && (
        <EditVerseDialog
          open={p.editOpen}
          onOpenChange={p.setEditOpen}
          state={p.editState}
          verseText={p.editVerseText}
          isSaving={p.isSaving}
          onChange={p.setEditState}
          onVerseTextChange={p.setEditVerseText}
          onSave={p.handleSave}
        />
      )}

      <DeleteVerseDialog
        open={p.deleteOpen}
        onOpenChange={p.setDeleteOpen}
        target={p.deleteTarget}
        isDeleting={p.isDeleting}
        onConfirm={p.handleDelete}
      />

      <ConflictVerseDialog
        open={p.conflictDialog.open}
        onOpenChange={(o) => p.setConflictDialog({ ...p.conflictDialog, open: o })}
        conflict={p.conflictDialog.conflict}
        t={p.t}
        onUpdate={p.handleConflictUpdate}
      />
    </div>
  );
}

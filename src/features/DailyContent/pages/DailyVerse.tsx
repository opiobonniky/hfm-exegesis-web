import DailyVerseHeader from "../components/DailyVerseHeader";
import VerseFilterBar from "../components/VerseFilterBar";
import DailyVerseFeaturedVerse from "../components/DailyVerseFeaturedVerse";
import DailyVerseGrid from "../components/DailyVerseGrid";
import DailyVerseLoadingSkeleton from "../components/DailyVerseLoadingSkeleton";
import DailyVerseEmptyState from "../components/DailyVerseEmptyState";
import EditVerseDialog from "../components/EditVerseDialog";
import {
  DeleteVerseDialog,
  ConflictVerseDialog,
} from "../components/VerseDialogs";
import { useDailyVersePage } from "../hooks/useDailyVersePage";

export default function DailyVerse() {
  const { data, actions } = useDailyVersePage();
  

  if (data.loading) return <DailyVerseLoadingSkeleton />;

  return (
    <div
      className="max-w-4xl mx-auto px-4 py-6 space-y-6"
      dir={data.isRtl ? "rtl" : "ltr"}
    >
      <DailyVerseHeader onAdd={actions.openAddVerse} />
      <VerseFilterBar
        fromDate={data.fromDate}
        toDate={data.toDate}
        activePreset={data.activePreset}
        filterError={data.filterError}
        isFiltered={data.isFiltered}
        futureCount={data.futureCount}
        onFromChange={actions.setFromDate}
        onToChange={actions.setToDate}
        onApply={actions.validateAndApply}
        onClear={actions.clearFilter}
        onPreset={actions.applyPreset}
      />
      {data.selectedVerse && (
        <DailyVerseFeaturedVerse
          verse={data.selectedVerse}
          onOpenBible={actions.openInBible}
          onWriteJournal={actions.openInJournal}
        />
      )}
      <DailyVerseGrid
        verses={data.verses}
        selectedIndex={data.selectedIndex}
        isAdmin={data.isAdmin}
        onSelect={actions.setSelectedIndex}
        onView={actions.openVerseDetails}
        onEdit={actions.openEdit}
        onDelete={actions.openDelete}
        page={data.page}
        totalPages={data.totalPages}
        hasNext={data.hasNext}
        hasPrevious={data.hasPrevious}
        onPageChange={actions.setPage}
        isFiltered
      />
      {data.verses.length === 0 && !data.loading && (
        <DailyVerseEmptyState
          isFiltered={data.isFiltered}
          onClearFilter={actions.clearFilter}
          onRefresh={actions.refresh}
        />
      )}
      {data.editState && (
        <EditVerseDialog
          open={data.editOpen}
          onOpenChange={actions.setEditOpen}
          state={data.editState}
          verseText={data.editVerseText}
          isSaving={data.isSaving}
          onChange={actions.setEditState}
          onVerseTextChange={actions.setEditVerseText}
          onSave={actions.handleSave}
        />
      )}
      <DeleteVerseDialog
        open={data.deleteOpen}
        onOpenChange={actions.setDeleteOpen}
        target={data.deleteTarget}
        isDeleting={data.isDeleting}
        onConfirm={actions.handleDelete}
      />
      <ConflictVerseDialog
        open={data.conflictDialog.open}
        onOpenChange={actions.setConflictOpen}
        conflict={data.conflictDialog.conflict}
        t={data.t}
        onUpdate={actions.handleConflictUpdate}
      />
    </div>
  );
}

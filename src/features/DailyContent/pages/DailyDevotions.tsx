// DailyDevotions — devotions list page (thin compositor, no logic)
import { useDailyDevotionsPage } from "../hooks/useDailyDevotionsPage";
import { DailyDevotionsHeader } from "../components/DailyDevotionsHeader";
import { DevotionFilterBar } from "../components/DevotionFilterBar";
import { DevotionList } from "../components/DevotionList";
import { DevotionLoadingSpinner } from "../components/DevotionLoadingSpinner";
import { DailyDevotionsPagination } from "../components/DailyDevotionsPagination";
import { DailyDevotionsEmpty } from "../components/DailyDevotionsEmpty";
import { DevotionEditDialog } from "../components/DevotionEditDialog";
import { DevotionDeleteDialog } from "../components/DevotionDeleteDialog";

export default function DailyDevotions() {
  const h = useDailyDevotionsPage();

  return (
    <div className="space-y-6">
      <DailyDevotionsHeader onAdd={h.openEdit} />

      {h.isAdmin && (
        <DevotionFilterBar
          fromDate={h.fromDate}
          toDate={h.toDate}
          activePreset={h.activePreset}
          filterError={h.filterError}
          isFiltered={h.isFiltered}
          onFromChange={h.setFromDate}
          onToChange={h.setToDate}
          onApply={h.applyFilter}
          onClear={h.clearFilter}
          onPreset={h.applyPreset}
        />
      )}

      {h.loading ? (
        <DevotionLoadingSpinner />
      ) : h.devotions.length === 0 ? (
        <DailyDevotionsEmpty
          message={h.emptyMessage}
          isAdmin={h.isAdmin}
          addLabel={h.addLabel}
          onAdd={h.openEdit}
        />
      ) : (
        <DevotionList
          devotions={h.devotions}
          selectedIndex={h.selectedIndex}
          isAdmin={h.isAdmin}
          onSelect={h.setSelectedIndex}
          onEdit={h.openEdit}
          onDelete={h.openDelete}
        />
      )}

      {h.showPagination && (
        <DailyDevotionsPagination
          page={h.page}
          totalPages={h.totalPages}
          total={h.total}
          hasNext={h.hasNext}
          hasPrevious={h.hasPrevious}
          onPageChange={h.setPage}
          labels={h.paginationLabels}
        />
      )}

      <DevotionEditDialog
        open={h.editOpen}
        onOpenChange={h.setEditOpen}
        editState={h.editState}
        onChange={h.setEditState}
        onSave={h.handleSave}
        isSaving={h.isSaving}
      />
      <DevotionDeleteDialog
        open={h.deleteOpen}
        onOpenChange={h.setDeleteOpen}
        target={h.deleteTarget}
        isDeleting={h.isDeleting}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}

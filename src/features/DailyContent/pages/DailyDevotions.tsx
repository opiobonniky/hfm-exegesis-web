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
      <DailyDevotionsHeader onAdd={() => h.openEdit()} />

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
          message={h.t.devotions?.noDevotions || "No devotions found"}
          isAdmin={h.isAdmin}
          addLabel={h.t.devotions?.addDevotion || "Add Devotion"}
          onAdd={() => h.openEdit()}
        />
      ) : (
        <DevotionList
          devotions={h.devotions}
          selectedIndex={h.selectedIndex}
          isAdmin={h.isAdmin}
          onSelect={h.setSelectedIndex}
          onEdit={(item) => h.openEdit(item)}
          onDelete={(item) => {
            h.setDeleteTarget(item);
            h.setDeleteOpen(true);
          }}
        />
      )}

      {h.totalPages > 1 && (
        <DailyDevotionsPagination
          page={h.page}
          totalPages={h.totalPages}
          total={h.total}
          hasNext={h.hasNext}
          hasPrevious={h.hasPrevious}
          onPageChange={h.setPage}
          labels={{
            page: h.t.common?.page || "Page",
            of: h.t.common?.of || "of",
            results: h.t.common?.results || "results",
          }}
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

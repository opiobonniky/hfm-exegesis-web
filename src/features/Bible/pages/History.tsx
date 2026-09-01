// History — standalone page for viewing and managing reading history
"use client";

import { History as HistoryIcon } from "lucide-react";
import { useHistoryPage } from "../hooks/useHistoryPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { HistoryClearAction, HistoryList } from "../components";

export default function History() {
  const h = useHistoryPage();

  return (
    <>
      <BiblePageLayout
        title="Reading History"
        count={h.history.length}
        isRtl={h.isRtl}
        searchQuery={h.searchQuery}
        onSearchChange={h.setSearchQuery}
        filterBook={h.filterBook}
        onFilterBookChange={h.setFilterBook}
        loading={h.loading}
        onRefresh={h.refresh}
        searchPlaceholder="Search history by verse reference..."
        emptyTitle="No reading history"
        emptyMessage="Chapters you read will appear here"
        emptyIcon={<HistoryIcon className="w-8 h-8 text-muted-foreground/30 mb-4" />}
        actions={<HistoryClearAction visible={h.history.length > 0} onClear={h.openClearAllDialog} />}
      >
        <HistoryList
          grouped={h.grouped}
          deleting={h.deleting}
          onGoToReader={h.goToReader}
          onDelete={h.openDeleteDialog}
          formatTimeAgo={h.formatTimeAgo}
        />
      </BiblePageLayout>

      <DeleteConfirmDialog
        open={h.deleteModal.visible}
        title={h.deleteDialogTitle}
        description={h.deleteDialogDescription}
        confirmLabel={h.deleteDialogConfirmLabel}
        loading={h.clearingAll || h.deleting !== null}
        onConfirm={h.confirmDelete}
        onClose={h.closeDeleteDialog}
      />
    </>
  );
}

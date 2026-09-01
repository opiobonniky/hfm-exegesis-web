// History — standalone page for viewing and managing reading history
"use client";

import { History as HistoryIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHistoryPage } from "../hooks/useHistoryPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { HistoryCard } from "../components/HistoryCard";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { BibleGroupSection, BibleSubGroup } from "../components/BibleGroupSection";

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
        actions={
          h.history.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={() => h.setDeleteModal({ visible: true, type: "all" })}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          ) : undefined
        }
      >
        {Object.entries(h.grouped).map(([dateLabel, items]) => (
          <BibleGroupSection key={dateLabel} label={dateLabel}>
            {items.map((item) => (
              <HistoryCard
                key={item.id}
                bookName={item.bookName}
                chapter={item.chapter}
                lastVerse={item.lastVerse || item.verseNumber}
                createdOn={item.createdOn}
                lastRead={item.lastRead}
                deleting={h.deleting === item.id}
                onGoToReader={() => h.goToReader(item.bookName, item.chapter)}
                onDelete={() => h.setDeleteModal({ visible: true, type: "single", itemId: item.id, itemName: `${item.bookName} ${item.chapter}` })}
                formatTimeAgo={h.formatTimeAgo}
              />
            ))}
          </BibleGroupSection>
        ))}
      </BiblePageLayout>

      <DeleteConfirmDialog
        open={h.deleteModal.visible}
        title={h.deleteModal.type === "all" ? "Clear All History" : "Delete History Item"}
        description={
          h.deleteModal.type === "all"
            ? `This will permanently delete all ${h.history.length} reading history items. This action cannot be undone.`
            : `Remove "${h.deleteModal.itemName}" from your reading history?`
        }
        confirmLabel={h.deleteModal.type === "all" ? "Clear All" : "Delete"}
        loading={h.clearingAll || h.deleting !== null}
        onConfirm={h.confirmDelete}
        onClose={() => h.setDeleteModal({ visible: false, type: null })}
      />
    </>
  );
}

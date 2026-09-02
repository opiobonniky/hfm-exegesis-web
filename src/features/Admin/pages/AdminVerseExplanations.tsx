// AdminVerseExplanations — thin page composing hook + components
"use client";

import { Lightbulb } from "lucide-react";
import { useAdminVerseExplanationsPage } from "../hooks/useAdminVerseExplanationsPage";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
  AdminPageContent,
} from "../components";
import { VerseExplanationTable } from "../components/VerseExplanationTable";
import { VerseExplanationFormDialog } from "../components/VerseExplanationFormDialog";
import { VerseExplanationDeleteDialog } from "../components/VerseExplanationDeleteDialog";

export default function AdminVerseExplanations() {
  const h = useAdminVerseExplanationsPage();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Verse Explanations Manager"
        subtitle="Manage verse explanations and study notes"
        icon={<Lightbulb className="w-5 h-5 text-primary" />}
        onBack={h.goBack}
        onAdd={h.openEdit}
        addLabel="Add"
      />

      <AdminPageContent>
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
          onSearch={h.refresh}
          placeholder="Search by book name..."
        />

        {h.loading && h.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.items.length === 0 ? (
          <AdminEmptyState
            icon={<Lightbulb className="w-12 h-12" />}
            title="No explanations found"
            message={
              h.search ? "Try a different search" : "Create your first explanation"
            }
            onAction={!h.search ? h.openEdit : undefined}
          />
        ) : (
          <VerseExplanationTable
            items={h.items}
            loadingMore={h.loadingMore}
            hasMore={h.hasMore}
            sentinelRef={h.sentinelRef}
            onView={h.viewItem}
            onEdit={h.openEdit}
            onDelete={h.requestDelete}
          />
        )}
      </AdminPageContent>

      <VerseExplanationFormDialog
        open={!!h.editItem || h.editForm.bookName !== ""}
        editMode={!!h.editItem}
        form={h.editForm}
        filteredBooks={h.filteredBooks}
        saving={h.saving}
        onFormChange={h.setEditForm}
        onSave={h.handleSave}
        onClose={h.closeEditForm}
      />

      <VerseExplanationDeleteDialog
        open={!!h.deleteItem}
        bookName={h.deleteItem?.bookName}
        chapter={h.deleteItem?.chapter}
        verseNumber={h.deleteItem?.verseNumber}
        deleting={h.deleting === h.deleteItem?.id}
        deletingId={h.deleting}
        onOpenChange={h.closeDeleteDialog}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}

// AdminBookPrologues — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { ScrollText } from "lucide-react";
import { PaginationControls } from "../components/PaginationControls";
import { useAdminBookProloguesPage } from "../hooks/useAdminBookProloguesPage";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
  AdminPageContent,
} from "../components";
import { PROLOGUE_EMPTY_FORM } from "../constants";
import { PrologueGrid } from "../components/PrologueGrid";
import { PrologueFormDialog } from "../components/PrologueFormDialog";
import { PrologueDeleteDialog } from "../components/PrologueDeleteDialog";



export default function AdminBookPrologues() {
  const h = useAdminBookProloguesPage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Book Prologues Manager"
        subtitle={`${h.totalCount} prologues`}
        icon={<ScrollText className="w-5 h-5 text-primary" />}
        onBack={() => navigate("/admin")}
        onAdd={() => h.openEdit()}
        addLabel="Add Prologue"
      />

      <AdminPageContent className="py-6">
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
          onSearch={() => {}}
          placeholder="Search by book name..."
        />

        {h.loading && h.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.items.length === 0 ? (
          <AdminEmptyState
            icon={<ScrollText className="w-12 h-12" />}
            title="No prologues found"
            message={
              h.search
                ? "Try a different search term"
                : "Create your first book prologue"
            }
            onAction={!h.search ? () => h.openEdit() : undefined}
          />
        ) : (
          <>
            <PrologueGrid
              items={h.items}
              loadingMore={false}
              hasMore={h.hasMore}
              sentinelRef={h.sentinelRef}
              onEdit={(item) => h.openEdit(item)}
              onDelete={(item) => h.setDeleteItem(item)}
              onView={(item) =>
                navigate(
                  `/admin/book-prologues/${encodeURIComponent(item.bookName)}`,
                )
              }
            />

            <PaginationControls
              page={h.currentPage}
              total={h.totalCount}
              pageSize={12}
              onPageChange={h.setPage}
            />
          </>
        )}
      </AdminPageContent>

      <PrologueFormDialog
        open={!!h.editItem || h.editForm.bookName !== ""}
        editMode={!!h.editItem}
        form={h.editForm}
        filteredBooks={h.filteredBooks}
        saving={h.saving}
        onFormChange={h.updateFormField}
        onSave={h.handleSave}
        onClose={() => {
          h.setEditItem(null);
          h.setEditForm(PROLOGUE_EMPTY_FORM);
        }}
      />

      <PrologueDeleteDialog
        open={!!h.deleteItem}
        bookName={h.deleteItem?.bookName || null}
        deleting={h.deleting === h.deleteItem?.bookName}
        onOpenChange={(o) => !o && h.setDeleteItem(null)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}

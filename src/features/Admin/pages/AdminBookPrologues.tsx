// AdminBookPrologues — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { ScrollText, Loader2 } from "lucide-react";
import { useAdminBookProloguesPage } from "../hooks/useAdminBookProloguesPage";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
} from "../components";
import { PrologueGrid } from "../components/PrologueGrid";
import { PrologueFormDialog } from "../components/PrologueFormDialog";
import { PrologueDeleteDialog } from "../components/PrologueDeleteDialog";

const EMPTY_FORM = { bookName: "", title: "", content: "", isPublished: true };

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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
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

            {/* Page info */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">
                Showing {h.items.length} of {h.totalCount} prologues
              </p>
              <div className="flex items-center gap-2">
                {h.currentPage > 1 && (
                  <button
                    onClick={() => h.setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-muted transition-colors"
                  >
                    Previous
                  </button>
                )}
                <span className="text-xs text-muted-foreground">
                  Page {h.currentPage} of {h.totalPages}
                </span>
                {h.hasMore && (
                  <button
                    onClick={() => h.setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-muted transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

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
          h.setEditForm(EMPTY_FORM);
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

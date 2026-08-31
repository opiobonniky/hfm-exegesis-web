// AdminBookPrologues — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { ScrollText } from "lucide-react";
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
        subtitle="Manage book introductions and overviews"
        icon={<ScrollText className="w-5 h-5 text-primary" />}
        onBack={() => navigate("/admin")}
        onAdd={() => h.openEdit()}
        addLabel="Add Prologue"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
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
          <PrologueGrid
            items={h.items}
            loadingMore={h.loadingMore}
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
        )}
      </div>

      <PrologueFormDialog
        open={!!h.editItem || h.editForm.bookName !== ""}
        editMode={!!h.editItem}
        form={h.editForm}
        filteredBooks={h.filteredBooks}
        saving={h.saving}
        onFormChange={h.setEditForm}
        onSave={h.handleSave}
        onClose={() => {
          h.setEditItem(null);
          h.setEditForm(EMPTY_FORM);
        }}
      />

      <PrologueDeleteDialog
        open={!!h.deleteItem}
        bookName={h.deleteItem?.bookName || null}
        deleting={h.deleting === h.deleteItem?.id}
        onOpenChange={(o) => !o && h.setDeleteItem(null)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}

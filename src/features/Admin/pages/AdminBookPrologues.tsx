// AdminBookPrologues — thin page composing hook + components
"use client";

import { useNavigate } from "react-router-dom";
import { ScrollText, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAdminBookProloguesPage } from "../hooks/useAdminBookProloguesPage";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
} from "../components";
import { PrologueCard } from "../components/PrologueCard";
import { PrologueFormDialog } from "../components/PrologueFormDialog";

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
          <>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {h.items.map((item) => (
                <PrologueCard
                  key={item.id}
                  item={item}
                  onEdit={() => h.openEdit(item)}
                  onDelete={() => h.setDeleteItem(item)}
                  onView={() => navigate(`/admin/book-prologues/${encodeURIComponent(item.bookName)}`)}
                />
              ))}
            </div>
                        {/* Infinite scroll sentinel */}
            <div ref={h.sentinelRef} className="h-4" />
            {h.loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!h.hasMore && h.items.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/50 py-4">
                All items loaded
              </p>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
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

      {/* Delete Dialog */}
      <Dialog
        open={!!h.deleteItem}
        onOpenChange={(o) => !o && h.setDeleteItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Delete
              Prologue
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the prologue for{" "}
              <strong>{h.deleteItem?.bookName}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => h.setDeleteItem(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={h.handleDelete}
              disabled={h.deleting === h.deleteItem?.id}
              className="gap-2"
            >
              {h.deleting === h.deleteItem?.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// AdminDailyExegesis — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { useAdminDailyExegesis } from "../hooks/useAdminDailyExegesis";
import { AdminDailyExegesisHeader } from "../components/AdminDailyExegesisHeader";
import { ExegesisSearchBar } from "../components/ExegesisSearchBar";
import { ExegesisLoadingGrid } from "../components/ExegesisLoadingGrid";
import { ExegesisEmptyState } from "../components/ExegesisEmptyState";
import { ExegesisGrid } from "../components/ExegesisGrid";
import { ExegesisFormDialog } from "../components/ExegesisFormDialog";
import { ExegesisDeleteDialog } from "../components/ExegesisDeleteDialog";

export default function AdminDailyExegesis() {
  const navigate = useNavigate();
  const h = useAdminDailyExegesis();

  return (
    <div className="min-h-screen bg-background">
      <AdminDailyExegesisHeader
        // onBack={() => navigate("/admin")}
        onAdd={() => h.openEdit()}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        <ExegesisSearchBar
          value={h.search}
          onChange={h.setSearch}
          onSearch={h.handleSearch}
        />

        {h.loading && h.items.length === 0 ? (
          <ExegesisLoadingGrid />
        ) : h.items.length === 0 ? (
          <ExegesisEmptyState search={h.search} onAdd={() => h.openEdit()} />
        ) : (
          <ExegesisGrid
            items={h.items}
            loadingMore={h.loadingMore}
            hasMore={h.hasMore}
            sentinelRef={h.sentinelRef}
            onEdit={(item) => h.openEdit(item)}
            onDelete={(item) => h.setDeleteTarget(item)}
          />
        )}
      </div>

      <ExegesisFormDialog
        open={h.dialogOpen}
        editItem={h.editItem}
        form={h.editForm}
        onFormChange={h.setEditForm}
        saving={h.saving}
        onSave={h.handleSave}
        onClose={h.closeDialog}
      />

      <ExegesisDeleteDialog
        open={!!h.deleteTarget}
        title={h.deleteTarget?.title || null}
        deleting={h.deletingId === h.deleteTarget?.id}
        onOpenChange={(o) => !o && h.setDeleteTarget(null)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}

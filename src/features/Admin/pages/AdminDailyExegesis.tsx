// AdminDailyExegesis — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { useAdminDailyExegesis } from "../hooks/useAdminDailyExegesis";
import { AdminDailyExegesisHeader } from "../components/AdminDailyExegesisHeader";
import { ExegesisSearchBar } from "../components/ExegesisSearchBar";
import { ExegesisLoadingGrid } from "../components/ExegesisLoadingGrid";
import { ExegesisEmptyState } from "../components/ExegesisEmptyState";
import { ExegesisGrid } from "../components/ExegesisGrid";
import { AdminPageContent } from "../components/AdminPageContent";
import { ExegesisFormDialog } from "../components/ExegesisFormDialog";
import { ExegesisDeleteDialog } from "../components/ExegesisDeleteDialog";

export default function AdminDailyExegesis() {
  const navigate = useNavigate();
  const { data, actions } = useAdminDailyExegesis();

  return (
    <div className="min-h-screen bg-background">
      <AdminDailyExegesisHeader
        // onBack={() => navigate("/admin")}
        onAdd={() => actions.openEdit()}
      />

      <AdminPageContent className="py-6">
        <ExegesisSearchBar
          value={data.search}
          onChange={actions.setSearch}
          onSearch={actions.handleSearch}
        />

        {data.loading && data.items.length === 0 ? (
          <ExegesisLoadingGrid />
        ) : data.items.length === 0 ? (
          <ExegesisEmptyState search={data.search} onAdd={() => actions.openEdit()} />
        ) : (
          <ExegesisGrid
            items={data.items}
            loadingMore={data.loadingMore}
            hasMore={data.hasMore}
            sentinelRef={data.sentinelRef}
            onEdit={(item) => actions.openEdit(item)}
            onDelete={(item) => actions.setDeleteTarget(item)}
          />
        )}
      </AdminPageContent>

      <ExegesisFormDialog
        open={data.dialogOpen}
        editItem={data.editItem}
        form={data.editForm}
        onFormChange={actions.setEditForm}
        saving={data.saving}
        onSave={actions.handleSave}
        onClose={actions.closeDialog}
      />

      <ExegesisDeleteDialog
        open={!!data.deleteTarget}
        title={data.deleteTarget?.title || null}
        deleting={data.deletingId === data.deleteTarget?.id}
        onOpenChange={(o) => !o && actions.setDeleteTarget(null)}
        onConfirm={actions.handleDelete}
      />
    </div>
  );
}

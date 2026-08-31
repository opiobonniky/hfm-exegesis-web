// AdminDailyExegesis — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminDailyExegesis } from "../hooks/useAdminDailyExegesis";
import { ExegesisCard, ExegesisFormDialog } from "../components";
import { AdminDailyExegesisHeader } from "../components/AdminDailyExegesisHeader";
import { ExegesisLoadingGrid } from "../components/ExegesisLoadingGrid";
import { ExegesisEmptyState } from "../components/ExegesisEmptyState";
import { ExegesisDeleteDialog } from "../components/ExegesisDeleteDialog";

export default function AdminDailyExegesis() {
  const navigate = useNavigate();
  const h = useAdminDailyExegesis();

  return (
    <div className="min-h-screen bg-background">
      <AdminDailyExegesisHeader
        onBack={() => navigate("/admin")}
        onAdd={() => h.openEdit()}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or passage..."
              value={h.search}
              onChange={(e) => h.setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && h.handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={h.handleSearch}>
            Search
          </Button>
        </div>

        {/* Content */}
        {h.loading && h.items.length === 0 ? (
          <ExegesisLoadingGrid />
        ) : h.items.length === 0 ? (
          <ExegesisEmptyState search={h.search} onAdd={() => h.openEdit()} />
        ) : (
          <>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {h.items.map((item) => (
                <ExegesisCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  passageReference={item.passageReference}
                  displayDate={item.displayDate}
                  teachingBody={item.teachingBody}
                  isPublished={item.isPublished}
                  onEdit={() => h.openEdit(item)}
                  onDelete={() => h.setDeleteTarget(item)}
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
                All exegeses loaded
              </p>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
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

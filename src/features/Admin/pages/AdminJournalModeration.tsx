// AdminJournalModeration — thin page composing hook + components (no inline HTML)
"use client";

import { BookOpen } from "lucide-react";
import { useAdminJournalModeration } from "../hooks/useAdminJournalModeration";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
  AdminPageContent,
} from "../components";
import { JournalTable } from "../components/JournalTable";
import { JournalDeleteDialog } from "../components/JournalDeleteDialog";

export default function AdminJournalModeration() {
  const h = useAdminJournalModeration();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Journal Moderation"
        subtitle={`${h.totalCount || h.entries.length} entries`}
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        onBack={h.goBack}
      />

      <AdminPageContent>
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
          onSearch={h.handleSearch}
          placeholder="Search entries..."
        />

        {h.loading && h.entries.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.entries.length === 0 ? (
          <AdminEmptyState
            icon={<BookOpen className="w-12 h-12" />}
            title="No entries found"
          />
        ) : (
          <JournalTable
            entries={h.entries}
            actionLoading={h.actionLoading}
            loadingMore={h.loadingMore}
            hasMore={h.hasMore}
            sentinelRef={h.sentinelRef}
            onTogglePublication={h.handleTogglePublication}
            onDelete={h.requestDelete}
            onView={h.viewEntry}
          />
        )}
      </AdminPageContent>

      <JournalDeleteDialog
        open={!!h.deleteTarget}
        title={h.deleteTarget?.title || null}
        deleting={h.deleting}
        onOpenChange={h.handleDeleteDialogChange}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}

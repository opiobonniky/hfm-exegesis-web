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
  const { data, actions } = useAdminJournalModeration();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Journal Moderation"
        subtitle={`${data.totalCount || data.entries.length} entries`}
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        onBack={actions.goBack}
      />

      <AdminPageContent>
        <AdminSearchBar
          value={data.search}
          onChange={actions.setSearch}
          onSearch={actions.handleSearch}
          placeholder="Search entries..."
        />

        {data.loading && data.entries.length === 0 ? (
          <AdminLoadingGrid />
        ) : data.entries.length === 0 ? (
          <AdminEmptyState
            icon={<BookOpen className="w-12 h-12" />}
            title="No entries found"
          />
        ) : (
          <JournalTable
            entries={data.entries}
            actionLoading={data.actionLoading}
            loadingMore={data.loadingMore}
            hasMore={data.hasMore}
            sentinelRef={data.sentinelRef}
            onTogglePublication={actions.handleTogglePublication}
            onDelete={actions.requestDelete}
            onView={actions.viewEntry}
          />
        )}
      </AdminPageContent>

      <JournalDeleteDialog
        open={!!data.deleteTarget}
        title={data.deleteTarget?.title || null}
        deleting={data.deleting}
        onOpenChange={actions.handleDeleteDialogChange}
        onConfirm={actions.handleDelete}
      />
    </div>
  );
}

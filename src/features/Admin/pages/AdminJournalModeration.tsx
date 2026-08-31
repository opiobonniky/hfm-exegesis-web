// AdminJournalModeration — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAdminJournalModeration } from "../hooks/useAdminJournalModeration";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
} from "../components";
import { JournalTable } from "../components/JournalTable";
import { JournalDeleteDialog } from "../components/JournalDeleteDialog";

export default function AdminJournalModeration() {
  const h = useAdminJournalModeration();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Journal Moderation"
        subtitle={`${h.totalCount || h.entries.length} entries`}
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        onBack={() => window.history.back()}
        onAdd={() => {}}
        addLabel=""
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
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
            onTogglePublication={(entry) => h.handleTogglePublication(entry)}
            onDelete={(entry) => h.setDeleteTarget(entry)}
            onView={(entry) =>
              navigate(`/admin/journal-moderation/${entry.id}`)
            }
          />
        )}
      </div>

      <JournalDeleteDialog
        open={!!h.deleteTarget}
        title={h.deleteTarget?.title || null}
        deleting={h.deleting}
        onOpenChange={(o) => !o && h.setDeleteTarget(null)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}

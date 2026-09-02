"use client";

import { useAdminJournalModerationPage } from "../hooks/useAdminJournalModerationPage";
import { LoadingState } from "@/components/ui/states";
import {
  JournalModerationHeader,
  JournalModerationFilters,
  JournalModerationGrid,
  JournalEntryViewDialog,
} from "../components";

export default function AdminJournalModerationPage() {
  const h = useAdminJournalModerationPage();

  return (
    <div className="space-y-6 p-6">
      <JournalModerationHeader refreshing={h.refreshing} onRefresh={() => h.fetchEntries(true)} />

      <JournalModerationFilters
        search={h.search}
        onSearchChange={h.setSearch}
        onSearch={() => h.fetchEntries()}
        filter={h.filter}
        onFilterChange={h.setFilter}
      />

      {h.loading ? (
        <LoadingState message="Loading journal entries..." />
      ) : (
        <JournalModerationGrid
          entries={h.filteredEntries}
          actionLoading={h.actionLoading}
          onToggle={h.togglePublication}
          onView={h.setViewEntry}
        />
      )}

      <JournalEntryViewDialog entry={h.viewEntry} onClose={() => h.setViewEntry(null)} />
    </div>
  );
}

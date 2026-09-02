import type { JournalPageEntry } from "../hooks/useJournalPageFull";
import { JournalEntryCard } from "./JournalEntryCard";

interface JournalListEntriesGridProps {
  entries: JournalPageEntry[];
  selectionMode: boolean;
  selectedIds: Set<number>;
  onSelect: (id: number) => void;
  onView: (id: number) => void;
  onDelete: (entry: JournalPageEntry) => void;
}

export function JournalListEntriesGrid({ entries, selectionMode, selectedIds, onSelect, onView, onDelete }: JournalListEntriesGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <JournalEntryCard
          key={entry.id}
          entry={entry}
          selectionMode={selectionMode}
          selected={selectedIds.has(entry.id)}
          onSelect={onSelect}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

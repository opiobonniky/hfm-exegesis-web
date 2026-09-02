import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/states";
import { JournalModerationCard } from "./JournalModerationCard";
import type { JournalModerationEntry } from "../hooks/useAdminJournalModerationPage";

interface Props {
  entries: JournalModerationEntry[];
  actionLoading: number | null;
  onToggle: (id: number, published: boolean) => void;
  onView: (entry: JournalModerationEntry) => void;
}

export function JournalModerationGrid({ entries, actionLoading, onToggle, onView }: Props) {
  if (entries.length === 0) {
    return <EmptyState title="No entries found" message="No journal entries match your filters." icon={BookOpen} />;
  }

  return (
    <div className="grid gap-4">
      {entries.map((entry) => (
        <JournalModerationCard
          key={entry.id}
          entry={entry}
          actionLoading={actionLoading}
          onToggle={onToggle}
          onView={onView}
        />
      ))}
    </div>
  );
}

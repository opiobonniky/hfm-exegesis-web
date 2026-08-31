// JournalTable — responsive table (desktop) / card list (mobile) with infinite scroll
import { RefObject } from "react";
import { Loader2, Globe, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JournalEntryRow } from "./JournalEntryRow";

interface JournalEntry {
  id: number;
  title: string;
  content?: string;
  bookName?: string;
  chapter?: number;
  category?: string;
  isPublished?: boolean;
  createdOn?: string;
}

interface JournalTableProps {
  entries: JournalEntry[];
  actionLoading: number | null;
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onTogglePublication: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
  onView: (entry: JournalEntry) => void;
}

export function JournalTable({
  entries,
  actionLoading,
  loadingMore,
  hasMore,
  sentinelRef,
  onTogglePublication,
  onDelete,
  onView,
}: JournalTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Title</th>
              <th className="text-left p-3 text-sm font-medium">Category</th>
              <th className="text-left p-3 text-sm font-medium">Visibility</th>
              <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">
                Date
              </th>
              <th className="text-right p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <JournalEntryRow
                key={entry.id}
                entry={entry}
                actionLoading={actionLoading}
                onTogglePublication={() => onTogglePublication(entry)}
                onDelete={() => onDelete(entry)}
                onView={() => onView(entry)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="border rounded-xl p-3 bg-card"
            onClick={() => onView(entry)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">
                  {entry.title || "Untitled"}
                </p>
                {entry.bookName && (
                  <p className="text-xs text-muted-foreground">
                    {entry.bookName} {entry.chapter}
                  </p>
                )}
              </div>
              <Badge
                variant={entry.isPublished ? "default" : "outline"}
                className="text-[10px] shrink-0"
              >
                {entry.isPublished ? (
                  <Globe className="w-2.5 h-2.5 mr-0.5" />
                ) : (
                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                )}
                {entry.isPublished ? "Public" : "Private"}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {entry.category || "general"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {entry.createdOn
                    ? new Date(entry.createdOn).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onTogglePublication(entry)}
                  disabled={actionLoading === entry.id}
                >
                  {actionLoading === entry.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : entry.isPublished ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => onDelete(entry)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!hasMore && entries.length > 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-4">
          All entries loaded
        </p>
      )}
    </>
  );
}

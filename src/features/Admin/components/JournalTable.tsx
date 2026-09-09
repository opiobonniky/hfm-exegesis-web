// JournalTable — responsive table (desktop) / card list (mobile) with infinite scroll
import { Loader2, Globe, Lock, Trash2 } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JournalEntryRow } from "./JournalEntryRow";
import type { JournalModerationEntry } from "../hooks/useAdminJournalModeration";

interface JournalTableProps {
  entries: JournalModerationEntry[];
  actionLoading: number | null;
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onTogglePublication: (entry: JournalModerationEntry) => void;
  onDelete: (entry: JournalModerationEntry) => void;
  onView: (entry: JournalModerationEntry) => void;
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
  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm md:block">
        <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/[0.06] via-card to-accent/[0.06] px-5 py-4">
          <div>
            <h2 className="font-semibold tracking-tight">Journal entries</h2>
            <p className="text-xs text-muted-foreground">Review visibility and community content</p>
          </div>
          <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] table-fixed">
          <thead className="bg-muted/30">
            <tr className="border-b">
              <th className="w-[38%] px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Entry</th>
              <th className="w-[18%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
              <th className="w-[16%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visibility</th>
              <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</th>
              <th className="w-[14%] px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
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
      </div>

      {/* Mobile card list */}
      <div className="space-y-3 md:hidden">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-xl border bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <button type="button" className="block w-full text-left font-medium text-sm leading-5 line-clamp-2 break-words" onClick={() => onView(entry)}>
                  {entry.title || "Untitled"}
                </button>
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
                  {formatDate(entry.createdOn)}
                </span>
              </div>
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 sm:h-8 sm:w-8"
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
                  className="h-10 w-10 text-destructive sm:h-8 sm:w-8"
                  onClick={() => onDelete(entry)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!hasMore && entries.length > 0 && (
        <p className="py-4 text-center text-xs text-muted-foreground/50">
          All entries loaded
        </p>
      )}
    </>
  );
}

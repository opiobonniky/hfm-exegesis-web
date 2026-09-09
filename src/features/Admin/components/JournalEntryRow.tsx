// JournalEntryRow — single entry row for journal moderation table
import { Globe, Lock, Trash2, Eye, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JournalModerationEntry } from "../hooks/useAdminJournalModeration";

interface Props {
  entry: JournalModerationEntry;
  actionLoading: number | null;
  onTogglePublication: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function JournalEntryRow({
  entry,
  actionLoading,
  onTogglePublication,
  onDelete,
  onView,
}: Props) {
  const isLoading = actionLoading === entry.id;
  const createdDate = entry.createdOn ? new Date(entry.createdOn) : null;
  const formattedDate = createdDate && !Number.isNaN(createdDate.getTime())
    ? new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(createdDate)
    : "—";

  return (
    <tr className="group border-b last:border-0 transition-colors hover:bg-primary/[0.03]">
      <td className="max-w-0 p-4 pl-5">
        <button type="button" onClick={onView} title={entry.title || "Untitled"} className="block w-full text-left">
        <div className="line-clamp-2 break-words text-sm font-semibold leading-5 transition-colors group-hover:text-primary">
          {entry.title || "Untitled"}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">
          {entry.bookName ? `${entry.bookName} ${entry.chapter || ""}` : entry.category || "Journal entry"}
        </div>
        </button>
      </td>
      <td className="p-4">
        <Badge variant="secondary" className="rounded-full">{entry.category || "general"}</Badge>
      </td>
      <td className="p-4">
        <Badge variant={entry.isPublished ? "default" : "outline"} className="rounded-full">
          {entry.isPublished ? (
            <Globe className="w-3 h-3 mr-1" />
          ) : (
            <Lock className="w-3 h-3 mr-1" />
          )}
          {entry.isPublished ? "Public" : "Private"}
        </Badge>
      </td>
      <td className="p-4">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {formattedDate}
        </span>
      </td>
      <td className="p-4 pr-5 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onView}
            title="View details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onTogglePublication}
            disabled={isLoading}
            title={entry.isPublished ? "Make private" : "Make public"}
          >
            {isLoading ? (
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
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

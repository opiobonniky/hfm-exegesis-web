// JournalEntryRow — single entry row for journal moderation table
import { Globe, Lock, Trash2, Eye, Loader2 } from "lucide-react";
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
}: Props) {
  const isLoading = actionLoading === entry.id;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="p-3">
        <div className="font-medium text-sm line-clamp-1">
          {entry.title || "Untitled"}
        </div>
        {entry.bookName && (
          <div className="text-xs text-muted-foreground">
            {entry.bookName} {entry.chapter}
          </div>
        )}
      </td>
      <td className="p-3 hidden md:table-cell">
        <Badge variant="secondary">{entry.category || "general"}</Badge>
      </td>
      <td className="p-3">
        <Badge variant={entry.isPublished ? "default" : "outline"}>
          {entry.isPublished ? (
            <Globe className="w-3 h-3 mr-1" />
          ) : (
            <Lock className="w-3 h-3 mr-1" />
          )}
          {entry.isPublished ? "Public" : "Private"}
        </Badge>
      </td>
      <td className="p-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {entry.createdOn
            ? new Date(entry.createdOn).toLocaleDateString()
            : "—"}
        </span>
      </td>
      <td className="p-3 text-right">
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

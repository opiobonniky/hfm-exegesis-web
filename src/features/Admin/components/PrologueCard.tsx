// PrologueCard — single prologue card with summary, author, key theme info
import { Edit2, Trash2, Eye, User, BookOpen, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrologueItem {
  bookName: string;
  title?: string;
  summary?: string;
  author?: string;
  keyTheme?: string;
  purpose?: string;
  chapters?: number;
  christConnection?: string;
  isPublished?: boolean;
}

interface Props {
  item: PrologueItem;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function PrologueCard({ item, onEdit, onDelete, onView }: Props) {
  const title = item.title || item.bookName;
  const preview = item.summary || item.purpose || "";
  const themePreview = item.keyTheme
    ? item.keyTheme.length > 80
      ? item.keyTheme.slice(0, 80) + "\u2026"
      : item.keyTheme
    : null;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{title}</CardTitle>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {item.author && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> {item.author}
                </span>
              )}
              {item.chapters && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {item.chapters} chapters
                </span>
              )}
            </div>
          </div>
          <Badge
            variant={item.isPublished ? "default" : "secondary"}
            className="shrink-0 ml-2"
          >
            {item.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key theme */}
        {themePreview && (
          <div className="flex items-start gap-1.5 mb-2">
            <Tag className="w-3 h-3 text-primary shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-primary/80">{themePreview}</p>
          </div>
        )}

        {/* Summary preview */}
        {preview ? (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {preview}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic mb-3">
            No summary available
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
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
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

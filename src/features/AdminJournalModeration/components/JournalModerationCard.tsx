import { Loader2, CheckCircle2, XCircle, Eye, User, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JournalModerationEntry } from "../hooks/useAdminJournalModerationPage";

interface Props {
  entry: JournalModerationEntry;
  actionLoading: number | null;
  onToggle: (id: number, published: boolean) => void;
  onView: (entry: JournalModerationEntry) => void;
}

export function JournalModerationCard({ entry, actionLoading, onToggle, onView }: Props) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{entry.title}</h3>
              {entry.flags > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {entry.flags} flag{entry.flags > 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant={entry.isPublished ? "default" : "secondary"} className="text-xs">
                {entry.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {entry.username}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(entry.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onView(entry)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={entry.isPublished ? "outline" : "default"}
              size="sm"
              disabled={actionLoading === entry.id}
              onClick={() => onToggle(entry.id, !entry.isPublished)}
            >
              {actionLoading === entry.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : entry.isPublished ? (
                <><XCircle className="mr-1 h-3 w-3" /> Unpublish</>
              ) : (
                <><CheckCircle2 className="mr-1 h-3 w-3" /> Publish</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

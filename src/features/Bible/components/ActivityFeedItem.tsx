import { ChevronRight, Trash2, Loader2, Eye, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "highlights" | "notes" | "favorites" | "history";
  data: any;
  ts: string;
}

interface Props {
  item: ActivityItem;
  formatTimeAgo: (ts: string) => string;
  goToReader: (book: string, ch: number) => void;
  onDelete: (type: string, id: number, endpoint: string, field: string) => void;
  deleting: number | null;
}

export default function ActivityFeedItem({ item, formatTimeAgo, goToReader, onDelete, deleting }: Props) {
  const { type, data } = item;
  const verseRef = `${data.bookName} ${data.chapter}:${data.verseNumber}`;
  const endpoints: Record<string, { endpoint: string; field: string }> = {
    highlights: { endpoint: "delete-highlights", field: "highlightId" },
    notes: { endpoint: "delete-verse-note", field: "noteId" },
    favorites: { endpoint: "delete-favorites", field: "favoriteId" },
    history: { endpoint: "delete-read-history", field: "readHistoryId" },
  };

  return (
    <div
      className="group p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/30 hover:border-primary/20 transition-all cursor-pointer"
      onClick={() => goToReader(data.bookName, data.chapter)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-foreground">{verseRef}</span>
            {data.bibleVersion && <span className="text-[10px] font-mono text-muted-foreground/50">{data.bibleVersion}</span>}
          </div>
        </div>
        {type === "highlights" && data.highlightColor && (
          <div className="w-5 h-5 rounded-full shrink-0 border border-border/50" style={{ backgroundColor: data.highlightColor }} />
        )}
      </div>
      {/* Note content */}
      {type === "notes" && data.note && (
        <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 px-3.5 py-2.5">
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{data.note}</p>
        </div>
      )}
      {/* Note on highlight */}
      {type === "highlights" && data.note && (
        <p className="mt-2 text-xs text-muted-foreground/60 line-clamp-1">{data.note}</p>
      )}
      {/* Bottom bar */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
        <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1 group-hover:text-primary/60 transition-colors">
          Open in reader<ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all max-sm:opacity-100"
          onClick={(e) => { e.stopPropagation(); onDelete(type, data.id, endpoints[type].endpoint, endpoints[type].field); }} disabled={deleting === data.id}>
          {deleting === data.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}

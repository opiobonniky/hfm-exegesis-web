// DailyContentCard — content card for list view in AdminDailyContent
import { Check, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DailyItem } from "../types";

interface Props {
  item: DailyItem;
  onEdit: (item: DailyItem) => void;
  onDelete: (item: DailyItem) => void;
}
export function DailyContentCard({ item, onEdit, onDelete }: Props) {
  return (
    <div className="p-4 border border-border/40 rounded-xl bg-card hover:bg-muted/10 hover:border-primary/20 transition-all duration-200 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className="text-[10px] bg-muted/50">
              {item.displayDate ? new Date(item.displayDate).toLocaleDateString() : "—"}
            </Badge>
            {item.isPublished ? (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">
                <Check className="w-2.5 h-2.5 mr-0.5" /> Published
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Draft</Badge>
            )}
          </div>
          {item.title && <p className="font-medium text-sm truncate">{item.title}</p>}
          {item.bookName && <p className="text-xs text-muted-foreground">{item.bookName} {item.chapter}:{item.verseNumber}</p>}
          {item.passageReference && <p className="text-xs text-muted-foreground font-mono">{item.passageReference}</p>}
          {item.creatorName && <p className="text-[10px] text-muted-foreground/60 mt-1">by {item.creatorName}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onEdit(item)}>
            <Edit2 className="w-4 h-4 text-foreground/60" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(item)}>
            <Trash2 className="w-4 h-4 text-foreground/60" />
          </Button>
        </div>
      </div>
    </div>
  );
}

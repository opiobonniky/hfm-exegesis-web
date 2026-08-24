// DailyContentListItem — reusable card for daily content items (verse/devotion/exegesis)
import { Check, Edit2, Trash2, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  id: number;
  date: string;
  published: boolean;
  title?: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  passageRef?: string;
  creatorName?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function DailyContentListItem({ date, published, title, bookName, chapter, verseNumber, passageRef, creatorName, onEdit, onDelete }: Props) {
  return (
    <div className="p-4 border border-border/40 rounded-xl bg-card hover:bg-muted/10 hover:border-primary/20 transition-all space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className="text-[10px] bg-muted/50">
              <Calendar className="w-3 h-3 mr-1" />
              {date ? new Date(date).toLocaleDateString() : "—"}
            </Badge>
            {published ? (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                <Check className="w-2.5 h-2.5 mr-0.5" /> Published
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Draft</Badge>
            )}
          </div>
          {title && <p className="font-medium text-sm truncate">{title}</p>}
          {bookName && <p className="text-xs text-muted-foreground"><BookOpen className="w-3 h-3 inline mr-1" />{bookName} {chapter}:{verseNumber}</p>}
          {passageRef && <p className="text-xs text-muted-foreground font-mono">{passageRef}</p>}
          {creatorName && <p className="text-[10px] text-muted-foreground/60 mt-1">by {creatorName}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}><Edit2 className="w-4 h-4 text-foreground/60" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}><Trash2 className="w-4 h-4 text-foreground/60" /></Button>
        </div>
      </div>
    </div>
  );
}

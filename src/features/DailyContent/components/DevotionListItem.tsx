import { Calendar, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import type { DailyDevotionItem } from "../types";

interface Props {
  item: DailyDevotionItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}

export function DevotionListItem({ item, isSelected, onSelect, onEdit, onDelete, isAdmin }: Props) {
  const { t } = useLanguage();
  const dateStr = item.displayDate && typeof item.displayDate === "string"
    ? new Date(item.displayDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm",
        isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 bg-card hover:bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{dateStr}</span>
          </div>
          {item.content && (
            <p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-2">{item.content.substring(0, 120)}...</p>
          )}
          {item.bookName && (
            <p className="text-xs text-primary mt-1">
              {item.bookName} {item.chapter}:{item.verseNumber}
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      {item.isPublished && (
        <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
          {t.common?.published || "Published"}
        </span>
      )}
    </div>
  );
}

import { Calendar, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import type { DailyDevotionItem } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';
import { displayDate } from '@/services/numberLocale/format';
import { DailyContentMetadata } from './DailyContentMetadata';

interface Props {
  item: DailyDevotionItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}

export function DevotionListItem({ item, isSelected, onSelect, onEdit, onDelete, isAdmin }: Props) {
  const { lang } = useLanguage();
  const dateStr = item.displayDate && typeof item.displayDate === "string"
    ? displayDate(item.displayDate, lang, { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div
      className={cn(
        "p-3 rounded-xl border text-card-foreground transition-all hover:shadow-sm flex flex-col gap-2 min-w-0",
        isSelected
          ? "border-primary/60 bg-primary/5 shadow-sm ring-1 ring-primary/10"
          : "border-border/60 bg-card hover:border-primary/30 hover:bg-accent/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="flex-1 min-w-0 text-start" onClick={onSelect}>
          <p className="font-semibold text-sm text-foreground truncate">{item.title}</p>
          {!isAdmin && <p className="mt-1 text-xs text-muted-foreground">{dateStr}</p>}
          {item.explanation && (
            <p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-2">{item.explanation.substring(0, 150)}</p>
          )}
          {item.bookName && (
            <p className="text-xs text-primary mt-1">
              {item.bookName} {item.chapter}:{item.verseNumber}
            </p>
          )}
        </button>
        {isAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <Button aria-label={tt('Edit devotion')} variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button aria-label={tt('Delete devotion')} variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
      {isAdmin && (
        <DailyContentMetadata
          creatorName={item.creatorName}
          createdOn={item.createdOn}
          displayDate={item.displayDate}
          showStatus
          isPublished={item.isPublished}
        />
      )}
    </div>
  );
}

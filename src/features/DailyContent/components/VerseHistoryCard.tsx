// Verse history card showing a past daily verse entry
import { Calendar, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerseHistoryCardProps {
  reference: string;
  text: string;
  translation: string;
  displayDate: string;
  isToday?: boolean;
}

export function VerseHistoryCard({ reference, text, translation, displayDate, isToday }: VerseHistoryCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all",
      isToday ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card",
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 text-primary" />
          <span className="text-xs font-bold text-primary">{reference}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="w-2.5 h-2.5" />
          {displayDate}
        </div>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed italic line-clamp-3">"{text}"</p>
      {translation && (
        <p className="text-[10px] text-muted-foreground mt-1.5 font-semibold">{translation}</p>
      )}
    </div>
  );
}

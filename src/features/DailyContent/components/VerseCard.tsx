"use client";
import { Sun, Heart, Share2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import type { DailyVerseItem } from "../types";
import { formatDisplayDate, isToday, isFuture } from "../constants";

interface VerseCardProps {
  verse: DailyVerseItem; isSelected: boolean; onSelect: () => void;
  onShare?: () => void; onFavorite?: () => void; isFavorited?: boolean;
}
export default function VerseCard({ verse, isSelected, onSelect, onShare, onFavorite, isFavorited }: VerseCardProps) {
  const { t } = useLanguage();
  const today = isToday(verse.displayDate);
  return (
    <button onClick={onSelect} className={cn("w-full text-left p-4 rounded-xl border transition-all", isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50", isFuture(verse.displayDate) && "opacity-60")}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Sun className={cn("w-4 h-4", today ? "text-primary" : "text-muted-foreground")} />
          <div><p className="text-sm font-semibold">{verse.bookName} {verse.chapter}:{verse.verseNumber}</p><p className="text-xs text-muted-foreground">{formatDisplayDate(verse.displayDate)}</p></div>
        </div>
        <div className="flex items-center gap-1">
          {verse.isPublished && <Badge variant="secondary" className="text-[10px]">{t.dailyVerse?.publishedLabel || "Published"}</Badge>}
          {today && <Badge className="text-[10px]">{t.dailyVerse?.today || "Today"}</Badge>}
        </div>
      </div>
      {verse.verseText && <p className="text-sm text-muted-foreground italic line-clamp-2 mb-2">"{verse.verseText}"</p>}
      {verse.reflection && <p className="text-xs text-muted-foreground line-clamp-2"><Lightbulb className="w-3 h-3 inline mr-1" />{verse.reflection}</p>}
      <div className="flex items-center gap-2 mt-2">
        {verse.bibleVersion && <Badge variant="outline" className="text-[10px]">{verse.bibleVersion}</Badge>}
        <div className="flex-1" />
        {onFavorite && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onFavorite(); }}><Heart className={cn("w-3 h-3", isFavorited ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} /></Button>}
        {onShare && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onShare(); }}><Share2 className="w-3 h-3 text-muted-foreground" /></Button>}
      </div>
    </button>
  );
}

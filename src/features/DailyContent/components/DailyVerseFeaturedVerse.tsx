import { Calendar, BookOpen, PenLine, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/languages/languageProvider";
import { getVerseText } from "@/utilities/bibleUtils";
import { formatDisplayDate, isToday, isFuture } from "../constants";
import type { DailyVerseItem } from "../types";

interface Props {
  verse: DailyVerseItem;
  onOpenBible: (verse: DailyVerseItem) => void;
  onWriteJournal: (verse: DailyVerseItem) => void;
}

export default function DailyVerseFeaturedVerse({ verse, onOpenBible, onWriteJournal }: Props) {
  const { t } = useLanguage();
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-xs">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDisplayDate(verse.displayDate)}
        </Badge>
        {isToday(verse.displayDate) && <Badge className="text-xs">Today</Badge>}
        {isFuture(verse.displayDate) && (
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">Upcoming</Badge>
        )}
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {verse.bookName} {verse.chapter}:{verse.verseNumber}
      </h2>
      <blockquote
        className="text-2xl lg:text-3xl font-serif leading-relaxed mb-4 text-foreground/90"
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      >
        &ldquo;{verse.verseText || getVerseText(verse.bookName, verse.chapter, verse.verseNumber)}&rdquo;
      </blockquote>
      <div className="bg-muted/50 rounded-xl p-5 mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {t.dailyVerse?.explanation || "Explanation"}
        </h3>
        <p className="text-base leading-relaxed text-foreground/85 whitespace-pre-line">
          {verse.explanation || verse.reflection || "No explanation available."}
        </p>
        {verse.learnMore && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              {t.dailyVerse?.learnMore || "Learn More"}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {verse.learnMore}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 gap-2 h-11" onClick={() => onOpenBible(verse)}>
          <BookOpen className="w-4 h-4" />Open in Bible
        </Button>
        <Button variant="outline" className="flex-1 gap-2 h-11" onClick={() => onWriteJournal(verse)}>
          <PenLine className="w-4 h-4" />Write in Journal
        </Button>
      </div>
    </section>
  );
}

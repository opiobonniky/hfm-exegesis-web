import { ArrowUpRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Chapter {
  id: number;
  bookName: string;
  chapter: number;
  chapterEnd?: number;
  verseStart?: number;
  verseEnd?: number;
}
interface Props {
  chapters: Chapter[];
  onOpenChapter: (chapter: Chapter) => void;
}

export default function DailyReadingChapters({ chapters, onOpenChapter }: Props) {
  if (!chapters.length) return null;
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-bold">Today's Reading</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Open each passage in the Bible Reader when you are ready.</p>
      </div>
      <div className="space-y-2">
      {chapters.map((ch) => (
        <div key={`${ch.id}-${ch.bookName}-${ch.chapter}`} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">
              {ch.bookName} {ch.chapter}{ch.chapterEnd && ch.chapterEnd !== ch.chapter ? `-${ch.chapterEnd}` : ""}
              {ch.verseStart ? `:${ch.verseStart}${ch.verseEnd && ch.verseEnd !== ch.verseStart ? `-${ch.verseEnd}` : ""}` : ""}
            </p>
            <p className="text-xs text-muted-foreground">Read in context</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => onOpenChapter(ch)}>
            Open <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      </div>
    </section>
  );
}

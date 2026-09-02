import { BookOpen } from "lucide-react";

export interface JournalDetailTitleBlockProps {
  title: string | null;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
}

export default function JournalDetailTitleBlock({ title, bookName, chapter, verseNumber }: JournalDetailTitleBlockProps) {
  return (
    <>
      {title && <div className="text-3xl sm:text-4xl font-bold text-foreground dark:text-stone-100 leading-tight mb-2 tracking-tight font-serif">{title}</div>}
      {bookName && (
        <div className="flex items-center gap-1.5 mt-1 mb-6 text-xs text-muted-foreground/70 dark:text-muted-foreground">
          <BookOpen className="w-3 h-3" />
          <div className="font-medium">{bookName} {chapter}:{verseNumber}</div>
        </div>
      )}
    </>
  );
}

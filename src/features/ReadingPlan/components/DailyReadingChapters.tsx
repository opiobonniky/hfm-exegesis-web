import { BookOpen, CheckCircle, Circle } from "lucide-react";

interface Chapter { id: number; bookName: string; chapter: number; completed: boolean; }
interface Props { chapters: Chapter[]; }

export default function DailyReadingChapters({ chapters }: Props) {
  if (!chapters.length) return null;
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Today's Reading</h3>
      {chapters.map((ch) => (
        <div key={ch.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/20">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{ch.bookName} {ch.chapter}</p>
          </div>
          {ch.completed ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

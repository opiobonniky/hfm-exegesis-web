// DailyVerseDetail — read-only detail view for a daily verse
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, BookOpen, Edit3, Tag,
  MessageSquare, Lightbulb, Layers, BookMarked,
  Clock, CheckCircle, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextBlock, ListBlock, WordStudiesBlock } from "../components";
import { parseList, fmtDate } from "../helpers/contentDetailHelpers";

export default function DailyVerseDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const verseParam = params.get("verse");
  let verse: any = null;
  try { verse = verseParam ? JSON.parse(verseParam) : null; } catch { /* invalid */ }

  if (!verse) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-background gap-4 text-center px-6">
        <BookOpen className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-lg font-bold">Verse not found</h2>
        <p className="text-sm text-muted-foreground">No verse data was provided.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const reference = `${verse.bookName || ""} ${verse.chapter || ""}:${verse.verseNumber || ""}`;

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Daily Verse Detail</h1>
            <p className="text-xs text-muted-foreground">{reference}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/add-daily-verse`, { state: { verse } })}>
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{reference}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={verse.isPublished ? "default" : "secondary"}>
              {verse.isPublished ? <><CheckCircle className="w-3 h-3 mr-1" /> Published</> : <><XCircle className="w-3 h-3 mr-1" /> Draft</>}
            </Badge>
            {verse.bibleVersion && <Badge variant="outline" className="text-xs">{verse.bibleVersion}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(verse.displayDate)}</span>
          {verse.createdOn && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created {fmtDate(verse.createdOn)}</span>}
          {verse.updatedOn && <span>Updated {fmtDate(verse.updatedOn)}</span>}
        </div>

        <div className="h-px bg-border/40" />

        {verse.verseText && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 px-5 py-4">
            <p className="text-sm font-semibold text-primary mb-1">Verse Text</p>
            <p className="text-base italic text-foreground/90 leading-relaxed font-serif">"{verse.verseText}"</p>
          </div>
        )}

        <div className="space-y-1">
          <TextBlock label="Explanation" value={verse.explanation} icon={Lightbulb} />
          <TextBlock label="Application" value={verse.application} icon={Tag} />
          <TextBlock label="Verse Introduction" value={verse.verseIntroduction} icon={BookMarked} />
          <TextBlock label="Learn More" value={verse.learnMore} icon={Layers} />
        </div>

        {(verse.backgroundAuthor || verse.backgroundBook || verse.backgroundContext) && (
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground mb-2">Background</h3>
            <TextBlock label="Author" value={verse.backgroundAuthor} />
            <TextBlock label="Book" value={verse.backgroundBook} />
            <TextBlock label="Context" value={verse.backgroundContext} />
          </div>
        )}

        <WordStudiesBlock value={verse.wordStudies} />

        <div className="space-y-1">
          <ListBlock label="Practical Applications" items={parseList(verse.practicalApplications)} icon={Lightbulb} />
          <ListBlock label="Key Themes" items={parseList(verse.keyThemes)} icon={Tag} />
          <ListBlock label="Cross References" items={parseList(verse.crossReferences)} icon={Layers} />
          <TextBlock label="Final Thoughts" value={verse.finalThoughts} />
          <ListBlock label="Takeaways" items={parseList(verse.takeaways)} icon={BookMarked} />
        </div>
      </div>
    </div>
  );
}

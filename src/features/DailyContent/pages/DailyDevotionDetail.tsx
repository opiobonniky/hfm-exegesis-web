// DailyDevotionDetail — read-only detail view for a daily devotion
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, BookOpen, Edit3, Tag,
  MessageSquare, Lightbulb, Layers, BookMarked,
  Clock, CheckCircle, XCircle, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextBlock, ListBlock, WordStudiesBlock } from "../components";
import { parseList, fmtDate } from "../helpers/contentDetailHelpers";

export default function DailyDevotionDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const devotionParam = params.get("devotion");
  let devotion: any = null;
  try { devotion = devotionParam ? JSON.parse(devotionParam) : null; } catch { /* invalid */ }

  if (!devotion) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-background gap-4 text-center px-6">
        <Heart className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-lg font-bold">Devotion not found</h2>
        <p className="text-sm text-muted-foreground">No devotion data was provided.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const reference = devotion.bookName
    ? `${devotion.bookName} ${devotion.chapter || ""}:${devotion.verseNumber || ""}`
    : null;

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{devotion.title || "Daily Devotion"}</h1>
            <p className="text-xs text-muted-foreground">{fmtDate(devotion.displayDate)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/add-daily-devotion`, { state: { devotion } })}>
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{devotion.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={devotion.isPublished ? "default" : "secondary"}>
              {devotion.isPublished ? <><CheckCircle className="w-3 h-3 mr-1" /> Published</> : <><XCircle className="w-3 h-3 mr-1" /> Draft</>}
            </Badge>
            {reference && <Badge variant="outline" className="text-xs">{reference}</Badge>}
            {devotion.bibleVersion && <Badge variant="outline" className="text-xs">{devotion.bibleVersion}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(devotion.displayDate)}</span>
          {devotion.createdOn && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created {fmtDate(devotion.createdOn)}</span>}
          {devotion.updatedOn && <span>Updated {fmtDate(devotion.updatedOn)}</span>}
        </div>

        <div className="h-px bg-border/40" />

        <div className="py-4">
          <p className="text-sm font-semibold text-primary mb-1">Content</p>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{devotion.content}</p>
        </div>

        <div className="space-y-1">
          <TextBlock label="Explanation" value={devotion.explanation} icon={Lightbulb} />
          <TextBlock label="Application" value={devotion.application} icon={Tag} />
          <TextBlock label="Introduction" value={devotion.verseIntroduction} icon={BookMarked} />
          <TextBlock label="Learn More" value={devotion.learnMore} icon={Layers} />
        </div>

        {(devotion.backgroundAuthor || devotion.backgroundBook || devotion.backgroundContext) && (
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground mb-2">Background</h3>
            <TextBlock label="Author" value={devotion.backgroundAuthor} />
            <TextBlock label="Book" value={devotion.backgroundBook} />
            <TextBlock label="Context" value={devotion.backgroundContext} />
          </div>
        )}

        <WordStudiesBlock value={devotion.wordStudies} />

        <div className="space-y-1">
          <ListBlock label="Practical Applications" items={parseList(devotion.practicalApplications)} icon={Lightbulb} />
          <ListBlock label="Key Themes" items={parseList(devotion.keyThemes)} icon={Tag} />
          <ListBlock label="Cross References" items={parseList(devotion.crossReferences)} icon={Layers} />
          <TextBlock label="Final Thoughts" value={devotion.finalThoughts} />
          <ListBlock label="Takeaways" items={parseList(devotion.takeaways)} icon={BookMarked} />
        </div>
      </div>
    </div>
  );
}

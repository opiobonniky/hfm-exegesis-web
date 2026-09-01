// DailyVerseDetail — read-only detail view for a daily verse
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Lightbulb, Tag, Layers, BookMarked } from "lucide-react";
import {
  DailyContentDetailHeader,
  DailyContentDetailEmpty,
  DailyContentDetailMeta,
  TextBlock,
  ListBlock,
  WordStudiesBlock,
} from "../components";
import { DetailPageContent } from "../components/DetailPageContent";
import { parseList } from "../helpers/contentDetailHelpers";

export default function DailyVerseDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const verseParam = params.get("verse");
  let verse: any = null;
  try { verse = verseParam ? JSON.parse(verseParam) : null; } catch { /* invalid */ }

  if (!verse) {
    return (
      <DailyContentDetailEmpty
        icon={BookOpen}
        title="Verse not found"
        message="No verse data was provided."
        onBack={() => navigate(-1)}
      />
    );
  }

  const reference = `${verse.bookName || ""} ${verse.chapter || ""}:${verse.verseNumber || ""}`;

  return (
    <div className="min-h-full bg-background">
      <DailyContentDetailHeader
        title="Daily Verse Detail"
        subtitle={reference}
        onBack={() => navigate(-1)}
        onEdit={() => navigate(`/add-daily-verse`, { state: { verse } })}
      />

      <DetailPageContent>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{reference}</h2>
          <DailyContentDetailMeta
            isPublished={verse.isPublished}
            extraBadge={verse.bibleVersion}
            displayDate={verse.displayDate}
            createdOn={verse.createdOn}
            updatedOn={verse.updatedOn}
          />
        </div>

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
      </DetailPageContent>
    </div>
  );
}

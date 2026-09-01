// DailyDevotionDetail — read-only detail view for a daily devotion
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Lightbulb, Tag, Layers, BookMarked } from "lucide-react";
import {
  DailyContentDetailHeader,
  DailyContentDetailEmpty,
  DailyContentDetailMeta,
  TextBlock,
  ListBlock,
  WordStudiesBlock,
} from "../components";
import { parseList, fmtDate } from "../helpers/contentDetailHelpers";

export default function DailyDevotionDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const devotionParam = params.get("devotion");
  let devotion: any = null;
  try { devotion = devotionParam ? JSON.parse(devotionParam) : null; } catch { /* invalid */ }

  if (!devotion) {
    return (
      <DailyContentDetailEmpty
        icon={Heart}
        title="Devotion not found"
        message="No devotion data was provided."
        onBack={() => navigate(-1)}
      />
    );
  }

  const reference = devotion.bookName
    ? `${devotion.bookName} ${devotion.chapter || ""}:${devotion.verseNumber || ""}`
    : null;

  return (
    <div className="min-h-full bg-background">
      <DailyContentDetailHeader
        title={devotion.title || "Daily Devotion"}
        subtitle={fmtDate(devotion.displayDate)}
        onBack={() => navigate(-1)}
        onEdit={() => navigate(`/add-daily-devotion`, { state: { devotion } })}
      />

      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{devotion.title}</h2>
          <DailyContentDetailMeta
            isPublished={devotion.isPublished}
            reference={reference}
            extraBadge={devotion.bibleVersion}
            displayDate={devotion.displayDate}
            createdOn={devotion.createdOn}
            updatedOn={devotion.updatedOn}
          />
        </div>

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

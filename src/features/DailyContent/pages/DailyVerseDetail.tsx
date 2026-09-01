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
  DetailSection,
  VerseTextDisplay,
  DetailTitleBlock,
  DetailPageLayout,
  DetailPageInner,
} from "../components";
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
    <DetailPageLayout>
      <DailyContentDetailHeader
        title="Daily Verse Detail"
        subtitle={reference}
        onBack={() => navigate(-1)}
        onEdit={() => navigate(`/add-daily-verse`, { state: { verse } })}
      />

      <DetailPageInner>
        <DetailTitleBlock title={reference}>
          <DailyContentDetailMeta
            isPublished={verse.isPublished}
            extraBadge={verse.bibleVersion}
            displayDate={verse.displayDate}
            createdOn={verse.createdOn}
            updatedOn={verse.updatedOn}
          />
        </DetailTitleBlock>

        {verse.verseText && <VerseTextDisplay text={verse.verseText} />}

        <DetailSection>
          <TextBlock label="Explanation" value={verse.explanation} icon={Lightbulb} />
          <TextBlock label="Application" value={verse.application} icon={Tag} />
          <TextBlock label="Verse Introduction" value={verse.verseIntroduction} icon={BookMarked} />
          <TextBlock label="Learn More" value={verse.learnMore} icon={Layers} />
        </DetailSection>

        {(verse.backgroundAuthor || verse.backgroundBook || verse.backgroundContext) && (
          <DetailSection title="Background">
            <TextBlock label="Author" value={verse.backgroundAuthor} />
            <TextBlock label="Book" value={verse.backgroundBook} />
            <TextBlock label="Context" value={verse.backgroundContext} />
          </DetailSection>
        )}

        <WordStudiesBlock value={verse.wordStudies} />

        <DetailSection>
          <ListBlock label="Practical Applications" items={parseList(verse.practicalApplications)} icon={Lightbulb} />
          <ListBlock label="Key Themes" items={parseList(verse.keyThemes)} icon={Tag} />
          <ListBlock label="Cross References" items={parseList(verse.crossReferences)} icon={Layers} />
          <TextBlock label="Final Thoughts" value={verse.finalThoughts} />
          <ListBlock label="Takeaways" items={parseList(verse.takeaways)} icon={BookMarked} />
        </DetailSection>
      </DetailPageInner>
    </DetailPageLayout>
  );
}

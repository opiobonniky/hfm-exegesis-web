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
  DetailSection,
  DetailTitleBlock,
  DetailPageLayout,
  DetailPageInner,
  ContentBlock,
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
    <DetailPageLayout>
      <DailyContentDetailHeader
        title={devotion.title || "Daily Devotion"}
        subtitle={fmtDate(devotion.displayDate)}
        onBack={() => navigate(-1)}
        onEdit={() => navigate(`/add-daily-devotion`, { state: { devotion } })}
      />

      <DetailPageInner>
        <DetailTitleBlock title={devotion.title}>
          <DailyContentDetailMeta
            isPublished={devotion.isPublished}
            reference={reference}
            extraBadge={devotion.bibleVersion}
            displayDate={devotion.displayDate}
            createdOn={devotion.createdOn}
            updatedOn={devotion.updatedOn}
          />
        </DetailTitleBlock>

        <ContentBlock label="Content" text={devotion.content} />

        <DetailSection>
          <TextBlock label="Explanation" value={devotion.explanation} icon={Lightbulb} />
          <TextBlock label="Application" value={devotion.application} icon={Tag} />
          <TextBlock label="Introduction" value={devotion.verseIntroduction} icon={BookMarked} />
          <TextBlock label="Learn More" value={devotion.learnMore} icon={Layers} />
        </DetailSection>

        {(devotion.backgroundAuthor || devotion.backgroundBook || devotion.backgroundContext) && (
          <DetailSection title="Background">
            <TextBlock label="Author" value={devotion.backgroundAuthor} />
            <TextBlock label="Book" value={devotion.backgroundBook} />
            <TextBlock label="Context" value={devotion.backgroundContext} />
          </DetailSection>
        )}

        <WordStudiesBlock value={devotion.wordStudies} />

        <DetailSection>
          <ListBlock label="Practical Applications" items={parseList(devotion.practicalApplications)} icon={Lightbulb} />
          <ListBlock label="Key Themes" items={parseList(devotion.keyThemes)} icon={Tag} />
          <ListBlock label="Cross References" items={parseList(devotion.crossReferences)} icon={Layers} />
          <TextBlock label="Final Thoughts" value={devotion.finalThoughts} />
          <ListBlock label="Takeaways" items={parseList(devotion.takeaways)} icon={BookMarked} />
        </DetailSection>
      </DetailPageInner>
    </DetailPageLayout>
  );
}

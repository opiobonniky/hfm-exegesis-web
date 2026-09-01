// DailyDevotionDetail — read-only detail view for a daily devotion
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
import { useDailyDevotionDetailPage } from "../hooks/useDailyDevotionDetailPage";

export default function DailyDevotionDetail() {
  const p = useDailyDevotionDetailPage();

  if (!p.devotion) {
    return (
      <DailyContentDetailEmpty
        icon={Heart}
        title="Devotion not found"
        message="No devotion data was provided."
        onBack={p.goBack}
      />
    );
  }

  return (
    <DetailPageLayout>
      <DailyContentDetailHeader
        title={p.headerTitle}
        subtitle={p.subtitle}
        onBack={p.goBack}
        onEdit={p.editDevotion}
      />

      <DetailPageInner>
        <DetailTitleBlock title={p.devotion.title}>
          <DailyContentDetailMeta
            isPublished={p.devotion.isPublished}
            reference={p.reference}
            extraBadge={p.devotion.bibleVersion}
            displayDate={p.devotion.displayDate}
            createdOn={p.devotion.createdOn}
            updatedOn={p.devotion.updatedOn}
          />
        </DetailTitleBlock>

        <ContentBlock label="Content" text={p.devotion.content} />

        <DetailSection>
          <TextBlock label="Explanation" value={p.devotion.explanation} icon={Lightbulb} />
          <TextBlock label="Application" value={p.devotion.application} icon={Tag} />
          <TextBlock label="Introduction" value={p.devotion.verseIntroduction} icon={BookMarked} />
          <TextBlock label="Learn More" value={p.devotion.learnMore} icon={Layers} />
        </DetailSection>

        {p.hasBackground && (
          <DetailSection title="Background">
            <TextBlock label="Author" value={p.devotion.backgroundAuthor} />
            <TextBlock label="Book" value={p.devotion.backgroundBook} />
            <TextBlock label="Context" value={p.devotion.backgroundContext} />
          </DetailSection>
        )}

        <WordStudiesBlock value={p.devotion.wordStudies} />

        <DetailSection>
          <ListBlock label="Practical Applications" items={p.practicalApplications} icon={Lightbulb} />
          <ListBlock label="Key Themes" items={p.keyThemes} icon={Tag} />
          <ListBlock label="Cross References" items={p.crossReferences} icon={Layers} />
          <TextBlock label="Final Thoughts" value={p.devotion.finalThoughts} />
          <ListBlock label="Takeaways" items={p.takeaways} icon={BookMarked} />
        </DetailSection>
      </DetailPageInner>
    </DetailPageLayout>
  );
}

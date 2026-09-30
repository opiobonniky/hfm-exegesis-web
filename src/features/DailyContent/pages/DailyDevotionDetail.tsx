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
import { tt } from '@/components/languages/hardcodedTranslate';

export default function DailyDevotionDetail() {
  const { data, actions } = useDailyDevotionDetailPage();
  const p = { ...data, ...actions };

  if (!p.devotion) {
    return (
      <DailyContentDetailEmpty
        icon={Heart}
        title={tt("Devotion not found")}
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

        <ContentBlock label={tt("Content")} text={p.devotion.content} />

        <DetailSection>
          <TextBlock label={tt("Explanation")} value={p.devotion.explanation} icon={Lightbulb} />
          <TextBlock label={tt("Application")} value={p.devotion.application} icon={Tag} />
          <TextBlock label={tt("Introduction")} value={p.devotion.verseIntroduction} icon={BookMarked} />
          <TextBlock label={tt("Learn More")} value={p.devotion.learnMore} icon={Layers} />
        </DetailSection>

        {p.hasBackground && (
          <DetailSection title={tt("Background")}>
            <TextBlock label={tt("Author")} value={p.devotion.backgroundAuthor} />
            <TextBlock label={tt("Book")} value={p.devotion.backgroundBook} />
            <TextBlock label={tt("Context")} value={p.devotion.backgroundContext} />
          </DetailSection>
        )}

        <WordStudiesBlock value={p.devotion.wordStudies} />

        <DetailSection>
          <ListBlock label={tt("Practical Applications")} items={p.practicalApplications} icon={Lightbulb} />
          <ListBlock label={tt("Key Themes")} items={p.keyThemes} icon={Tag} />
          <ListBlock label={tt("Cross References")} items={p.crossReferences} icon={Layers} />
          <TextBlock label={tt("Final Thoughts")} value={p.devotion.finalThoughts} />
          <ListBlock label={tt("Takeaways")} items={p.takeaways} icon={BookMarked} />
        </DetailSection>
      </DetailPageInner>
    </DetailPageLayout>
  );
}

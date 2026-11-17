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
import { tt } from '@/components/languages/hardcodedTranslate';
import { referenceLabel } from '../helpers/editorContent';
import { usePassagePreview } from '../hooks/usePassagePreview';

export default function DailyVerseDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const verseParam = params.get("verse");
  let verse: any = null;
  try { verse = verseParam ? JSON.parse(verseParam) : null; } catch { /* invalid */ }
  const preview = usePassagePreview(verse?.bookName || '', verse?.chapter || '', verse?.verseNumber || '', verse?.verseEnd, verse?.bibleVersion || 'BSB');

  if (!verse) {
    return (
      <DailyContentDetailEmpty
        icon={BookOpen}
        title={tt("Verse not found")}
        message="No verse data was provided."
        onBack={() => navigate(-1)}
      />
    );
  }

   const reference = referenceLabel(verse);

  return (
    <DetailPageLayout>
      <DailyContentDetailHeader
        title={tt("Daily Verse Detail")}
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

        {(preview.text || verse.verseText) && <VerseTextDisplay text={preview.text || verse.verseText} />}

        <DetailSection>
          <TextBlock label={tt("Explanation")} value={verse.explanation} icon={Lightbulb} />
          <TextBlock label={tt("Application")} value={verse.application} icon={Tag} />
          <TextBlock label={tt("Verse Introduction")} value={verse.verseIntroduction} icon={BookMarked} />
          <TextBlock label={tt("Learn More")} value={verse.learnMore} icon={Layers} />
        </DetailSection>

        {(verse.backgroundAuthor || verse.backgroundBook || verse.backgroundContext) && (
          <DetailSection title={tt("Background")}>
            <TextBlock label={tt("Author")} value={verse.backgroundAuthor} />
            <TextBlock label={tt("Book")} value={verse.backgroundBook} />
            <TextBlock label={tt("Context")} value={verse.backgroundContext} />
          </DetailSection>
        )}

        <WordStudiesBlock value={verse.wordStudies} />

        <DetailSection>
          <ListBlock label={tt("Practical Applications")} items={parseList(verse.practicalApplications)} icon={Lightbulb} />
          <ListBlock label={tt("Key Themes")} items={parseList(verse.keyThemes)} icon={Tag} />
          <ListBlock label={tt("Cross References")} items={parseList(verse.crossReferences)} icon={Layers} />
          <TextBlock label={tt("Final Thoughts")} value={verse.finalThoughts} />
          <ListBlock label={tt("Takeaways")} items={parseList(verse.takeaways)} icon={BookMarked} />
        </DetailSection>
      </DetailPageInner>
    </DetailPageLayout>
  );
}

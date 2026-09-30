// DailyExegesisDetail — read-only detail view for a daily exegesis
import { Sparkles, BookOpen, MessageSquare, Lightbulb, Layers, Tag, BookMarked } from "lucide-react";
import {
  DailyContentDetailHeader,
  DailyContentDetailEmpty,
  DailyContentDetailMeta,
  TextBlock,
  TagsBlock,
  DetailSection,
  DetailTitleBlock,
  DetailPageLayout,
  DetailPageInner,
} from "../components";
import { useDailyExegesisDetail } from "../hooks/useDailyExegesisDetail";
import { tt } from '@/components/languages/hardcodedTranslate';

export default function DailyExegesisDetail() {
  const { data, actions } = useDailyExegesisDetail();

  if (!data.exegesis) {
    return (
      <DailyContentDetailEmpty
        icon={Sparkles}
        title={tt("Exegesis not found")}
        message="No exegesis data was provided."
        onBack={actions.goBack}
      />
    );
  }

  return (
    <DetailPageLayout>
      <DailyContentDetailHeader
        title={data.exegesis.title || tt("Daily Exegesis")}
        subtitle={data.displayDate}
        onBack={actions.goBack}
        onEdit={actions.openEdit}
      />

      <DetailPageInner>
        <DetailTitleBlock title={data.exegesis.title}>
          <DailyContentDetailMeta
            isPublished={data.exegesis.isPublished}
            reference={data.exegesis.passageReference}
            displayDate={data.exegesis.displayDate}
            createdOn={data.exegesis.createdOn}
          />
        </DetailTitleBlock>

        <DetailSection>
          <TextBlock label={tt("Passage Reference")} value={data.exegesis.passageReference} icon={BookOpen} />
          <TextBlock label={tt("Teaching Body")} value={data.exegesis.teachingBody} icon={MessageSquare} />
        </DetailSection>

        <DetailSection>
          <TextBlock label={tt("Introduction")} value={data.exegesis.introduction} icon={Lightbulb} />
          <TextBlock label={tt("Context Summary")} value={data.exegesis.contextSummary} icon={Layers} />
        </DetailSection>

        <DetailSection>
          <TextBlock label={tt("Application")} value={data.exegesis.application} icon={Tag} />
          <TextBlock label={tt("Prayer")} value={data.exegesis.prayer} icon={BookMarked} />
        </DetailSection>

        <TagsBlock tags={data.exegesis.tags} />
      </DetailPageInner>
    </DetailPageLayout>
  );
}

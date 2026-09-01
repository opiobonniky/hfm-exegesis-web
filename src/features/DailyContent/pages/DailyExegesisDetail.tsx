// DailyExegesisDetail — read-only detail view for a daily exegesis
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { fmtDate } from "../helpers/contentDetailHelpers";

export default function DailyExegesisDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const exegesisParam = params.get("exegesis");
  let exegesis: any = null;
  try { exegesis = exegesisParam ? JSON.parse(exegesisParam) : null; } catch { /* invalid */ }

  if (!exegesis) {
    return (
      <DailyContentDetailEmpty
        icon={Sparkles}
        title="Exegesis not found"
        message="No exegesis data was provided."
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <DetailPageLayout>
      <DailyContentDetailHeader
        title={exegesis.title || "Daily Exegesis"}
        subtitle={fmtDate(exegesis.displayDate)}
        onBack={() => navigate(-1)}
        onEdit={() => navigate(`/add-daily-exegesis`, { state: { exegesis } })}
      />

      <DetailPageInner>
        <DetailTitleBlock title={exegesis.title}>
          <DailyContentDetailMeta
            isPublished={exegesis.isPublished}
            reference={exegesis.passageReference}
            displayDate={exegesis.displayDate}
            createdOn={exegesis.createdOn}
          />
        </DetailTitleBlock>

        <DetailSection>
          <TextBlock label="Passage Reference" value={exegesis.passageReference} icon={BookOpen} />
          <TextBlock label="Teaching Body" value={exegesis.teachingBody} icon={MessageSquare} />
        </DetailSection>

        <DetailSection>
          <TextBlock label="Introduction" value={exegesis.introduction} icon={Lightbulb} />
          <TextBlock label="Context Summary" value={exegesis.contextSummary} icon={Layers} />
        </DetailSection>

        <DetailSection>
          <TextBlock label="Application" value={exegesis.application} icon={Tag} />
          <TextBlock label="Prayer" value={exegesis.prayer} icon={BookMarked} />
        </DetailSection>

        <TagsBlock tags={exegesis.tags} />
      </DetailPageInner>
    </DetailPageLayout>
  );
}

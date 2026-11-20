// DailyDevotionDetail — read-only detail view for a daily devotion
import { Heart } from "lucide-react";
import {
  DailyContentDetailHeader,
  DailyContentDetailEmpty,
  DailyContentDetailMeta,
  DetailTitleBlock,
  DetailPageLayout,
  DetailPageInner,
  DevotionDetailContent,
} from "../components";
import { useDailyDevotionDetailPage } from "../hooks/useDailyDevotionDetailPage";
import { tt } from '@/components/languages/hardcodedTranslate';
import "@/features/Admin/theme/bookPrologueDetail.css";

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

        <DevotionDetailContent devotion={p.devotion} />
      </DetailPageInner>
    </DetailPageLayout>
  );
}

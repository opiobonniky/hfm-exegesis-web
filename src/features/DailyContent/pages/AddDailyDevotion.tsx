"use client";

/**
 * AddDailyDevotion — add/edit daily devotion with all rich content fields.
 * All state in useAddDailyDevotion hook, UI split into section components.
 * Single root div — no inline HTML beyond components.
 */
import { Sun, BookOpen } from "lucide-react";
import { useAddDailyDevotion } from "../hooks/useAddDailyDevotion";
import {
  StructuredContentSection, CollapsibleSection as Section,
  DailyContentPageHeader, DailyContentFormActions, DailyContentFormCard,
  PublishToggle, PageContentWrapper, DateTimeFields,
  AddDailyDevotionCoreSections, AddDailyDevotionReferenceSection,
  AddDailyDevotionContentFields, AddDailyDevotionBackgroundSection,
} from "../components";

const AddDailyDevotion = () => {
  const h = useAddDailyDevotion();

  return (
    <PageContentWrapper isRtl={h.isRtl}>
      <DailyContentPageHeader
        backTo="/daily-devotions"
        backLabel={h.t.common.back}
        icon={Sun}
        title={h.pageTitle}
        subtitle={h.t.devotions.addPageSubtitle}
      />

      <DailyContentFormCard
        icon={BookOpen}
        title={h.t.devotions.devotionDetails}
        description={h.t.devotions.devotionDetailsDesc}
      >
        <form onSubmit={h.handleSave} className="space-y-8">
          <AddDailyDevotionCoreSections model={h} />
          <AddDailyDevotionReferenceSection model={h} />
          <AddDailyDevotionContentFields model={h} />
          <AddDailyDevotionBackgroundSection model={h} />

          <Section title="Rich Content" defaultOpen={false}>
            <StructuredContentSection
              wordStudies={h.wordStudies} setWordStudies={h.setWordStudies}
              practicalApplications={h.practicalApplications} setPracticalApplications={h.setPracticalApplications}
              keyThemes={h.keyThemes} setKeyThemes={h.setKeyThemes}
              crossReferences={h.crossReferences} setCrossReferences={h.setCrossReferences}
              finalThoughts={h.finalThoughts} setFinalThoughts={h.setFinalThoughts}
              takeaways={h.takeaways} setTakeaways={h.setTakeaways}
              isRtl={h.isRtl}
            />
          </Section>

          <Section title="Schedule & Publish">
            <PublishToggle
              published={h.published}
              onCheckedChange={h.setPublished}
              publishedLabel="Published"
              publishedDesc="Show to all users"
            />
            <DateTimeFields
              selectedDate={h.selectedDate} setSelectedDate={h.setSelectedDate}
              selectedTime={h.selectedTime} handleTimeChange={h.handleTimeChange}
            />
          </Section>

          <DailyContentFormActions
            cancelTo="/daily-devotions"
            cancelLabel={h.t.common.cancel}
            saveLabel={h.saveLabel}
            disabled={h.saveDisabled}
            onSave={h.handleSave}
          />
        </form>
      </DailyContentFormCard>
    </PageContentWrapper>
  );
};

export default AddDailyDevotion;

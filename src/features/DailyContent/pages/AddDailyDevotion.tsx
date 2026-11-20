import { Sun, BookOpen } from "lucide-react";
import { useAddDailyDevotion } from "../hooks/useAddDailyDevotion";
import {
  AddDailyDevotionCoreSections,
  AddDailyDevotionReferenceSection,
  AddDailyDevotionContentFields,
  AddDailyDevotionConflictDialog,
  DailyContentFormActions,
  PublishToggle,
  DateTimeFields,
  DailyContentFormCard,
  DailyContentPageHeader,
  PageContentWrapper,
} from "../components";

export default function AddDailyDevotion() {
  const { data, actions } = useAddDailyDevotion();

  return (
    <PageContentWrapper isRtl={data.isRtl}>
      <DailyContentPageHeader
        backTo="/daily-devotions"
        backLabel={data.t.common.back}
        icon={Sun}
        title={data.pageTitle}
        subtitle={data.t.devotions.addPageSubtitle}
      />
      <DailyContentFormCard
        icon={BookOpen}
        title={data.t.devotions.devotionDetails}
        description={data.t.devotions.devotionDetailsDesc}
        onSubmit={actions.handleSave}
      >
        <AddDailyDevotionCoreSections
          error={data.fieldErrors.title}
          title={data.title}
          setTitle={actions.setTitle}
        />
        <AddDailyDevotionReferenceSection
          error={data.fieldErrors.reference}
          book={data.book}
          chapter={data.chapter}
          verseNumber={data.verseNumber}
          bibleVersion={data.bibleVersion}
          verseNumbers={data.verseNumbers}
          verseText={data.verseText}
          isVerseLoading={data.isVerseLoading}
          bibleVersionOptions={data.bibleVersionOptions}
          setBook={actions.setBook}
          setChapter={actions.setChapter}
          setVerseNumber={actions.setVerseNumber}
          setBibleVersion={actions.setBibleVersion}
        />
        <AddDailyDevotionContentFields
          errors={data.fieldErrors}
          explanation={data.explanation}
          reflectionQuestions={data.reflectionQuestions}
          prayer={data.prayer}
          practicalApplications={data.practicalApplications}
          learningPoints={data.learningPoints}
          setExplanation={actions.setExplanation}
          setReflectionQuestions={actions.setReflectionQuestions}
          setPrayer={actions.setPrayer}
          setPracticalApplications={actions.setPracticalApplications}
          setLearningPoints={actions.setLearningPoints}
        />
        <div className="rounded-xl border bg-muted/10 p-5 space-y-5">
          <PublishToggle
            published={data.published}
            onCheckedChange={actions.setPublished}
            publishedLabel="Published"
            publishedDesc="Show to all users"
          />
          <DateTimeFields
            selectedDate={data.selectedDate}
            setSelectedDate={actions.setSelectedDate}
            selectedTime={data.selectedTime}
            handleTimeChange={actions.handleTimeChange}
          />
        </div>
        <DailyContentFormActions
          cancelTo="/daily-devotions"
          cancelLabel={data.t.common.cancel}
          saveLabel={data.saveLabel}
          saving={data.saving}
          onSave={actions.handleSave}
        />
      </DailyContentFormCard>
      <AddDailyDevotionConflictDialog data={data} actions={actions} />
    </PageContentWrapper>
  );
}

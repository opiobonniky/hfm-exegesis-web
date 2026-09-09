import { Sun, BookOpen } from "lucide-react";
import { useAddDailyDevotion } from "../hooks/useAddDailyDevotion";
import {
  CollapsibleSection as Section,
  AddDailyDevotionCoreSections,
  AddDailyDevotionReferenceSection,
  AddDailyDevotionContentFields,
  AddDailyDevotionBackgroundSection,
  DailyContentFormActions,
  PublishToggle,
  DateTimeFields,
  StructuredContentSection,
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
          title={data.title}
          content={data.content}
          setTitle={actions.setTitle}
          setContent={actions.setContent}
        />
        <AddDailyDevotionReferenceSection
          testament={data.testament}
          book={data.book}
          chapter={data.chapter}
          verseNumber={data.verseNumber}
          bibleVersion={data.bibleVersion}
          testamentOptions={data.testamentOptions}
          bookOptions={data.bookOptions}
          chapterOptions={data.chapterOptions}
          bibleVersionOptions={data.bibleVersionOptions}
          setTestament={actions.setTestament}
          setBook={actions.setBook}
          setChapter={actions.setChapter}
          setVerseNumber={actions.setVerseNumber}
          setBibleVersion={actions.setBibleVersion}
          t={data.t}
        />
        <AddDailyDevotionContentFields
          explanation={data.explanation}
          application={data.application}
          verseIntroduction={data.verseIntroduction}
          learnMore={data.learnMore}
          contentPlaceholder={data.t.devotions.contentPlaceholder}
          setExplanation={actions.setExplanation}
          setApplication={actions.setApplication}
          setVerseIntroduction={actions.setVerseIntroduction}
          setLearnMore={actions.setLearnMore}
        />
        <AddDailyDevotionBackgroundSection
          backgroundAuthor={data.backgroundAuthor}
          backgroundBook={data.backgroundBook}
          backgroundContext={data.backgroundContext}
          setBackgroundAuthor={actions.setBackgroundAuthor}
          setBackgroundBook={actions.setBackgroundBook}
          setBackgroundContext={actions.setBackgroundContext}
        />
        <Section title="Rich Content" defaultOpen={false}>
          <StructuredContentSection
            wordStudies={data.wordStudies}
            setWordStudies={actions.setWordStudies}
            practicalApplications={data.practicalApplications}
            setPracticalApplications={actions.setPracticalApplications}
            keyThemes={data.keyThemes}
            setKeyThemes={actions.setKeyThemes}
            crossReferences={data.crossReferences}
            setCrossReferences={actions.setCrossReferences}
            finalThoughts={data.finalThoughts}
            setFinalThoughts={actions.setFinalThoughts}
            takeaways={data.takeaways}
            setTakeaways={actions.setTakeaways}
            bibleVersion={data.bibleVersion}
            isRtl={data.isRtl}
          />
        </Section>
        <Section title="Schedule & Publish">
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
        </Section>
        <DailyContentFormActions
          cancelTo="/daily-devotions"
          cancelLabel={data.t.common.cancel}
          saveLabel={data.saveLabel}
          disabled={data.saveDisabled}
          onSave={actions.handleSave}
        />
      </DailyContentFormCard>
    </PageContentWrapper>
  );
}

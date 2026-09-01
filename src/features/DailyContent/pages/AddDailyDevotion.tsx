"use client";

/**
 * AddDailyDevotion — add/edit daily devotion with all rich content fields.
 * All state in useAddDailyDevotion hook, UI split into section components.
 * Single root div — no inline HTML beyond components.
 */
import { Sun, BookOpen } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { useAddDailyDevotion } from "../hooks/useAddDailyDevotion";
import {
  StructuredContentSection, CollapsibleSection as Section,
  DailyContentPageHeader, DailyContentFormActions, DailyContentFormCard,
  PublishToggle, PageContentWrapper, FormField, FormGrid, DateTimeFields,
} from "../components";

const AddDailyDevotion = () => {
  const h = useAddDailyDevotion();

  return (
    <PageContentWrapper isRtl={h.isRtl}>
      <DailyContentPageHeader
        backTo="/daily-devotions"
        backLabel={h.t.common.back}
        icon={Sun}
        title={h.isEditing ? "Edit Devotion" : h.t.devotions.addDevotion}
        subtitle={h.t.devotions.addPageSubtitle}
      />

      <DailyContentFormCard
        icon={BookOpen}
        title={h.t.devotions.devotionDetails}
        description={h.t.devotions.devotionDetailsDesc}
      >
        <form onSubmit={h.handleSave} className="space-y-8">
          <Section title="Devotion Title">
            <FormField label="Title" required>
              <Input value={h.title} onChange={(e) => h.setTitle(e.target.value)}
                placeholder="Enter devotion title..." className="text-lg" />
            </FormField>
          </Section>

          <Section title="Devotion Content">
            <FormField label="Content" required>
              <Textarea value={h.content} onChange={(e) => h.setContent(e.target.value)}
                placeholder="Write your devotional message..."
                className="min-h-[200px] leading-relaxed resize-none" />
            </FormField>
          </Section>

          <Section title="Optional Bible Reference" defaultOpen={false}>
            <FormGrid columns={4}>
              <FormField label="Testament">
                <Combobox
                  options={[{ value: "Old", label: h.t.dailyVerse.oldTestament }, { value: "New", label: h.t.dailyVerse.newTestament }]}
                  value={h.testament} onChange={h.setTestament}
                  placeholder={h.t.devotions.selectTestament} width="w-full" />
              </FormField>
              <FormField label="Book">
                <Combobox options={h.books.map((b) => ({ value: b, label: b }))}
                  value={h.book} onChange={h.setBook} placeholder={h.t.dailyVerse.selectBook}
                  disabled={!h.testament} width="w-full" />
              </FormField>
              <FormField label="Chapter">
                <Combobox options={h.chapters.map((c) => ({ value: String(c), label: String(c) }))}
                  value={h.chapter} onChange={h.setChapter} placeholder={h.t.dailyVerse.selectChapter}
                  disabled={!h.book} width="w-full" />
              </FormField>
              <FormField label="Verse">
                <Input type="number" value={h.verseNumber} onChange={(e) => h.setVerseNumber(e.target.value)}
                  placeholder="Verse #" disabled={!h.chapter} min={1} />
              </FormField>
            </FormGrid>
            <FormField label="Bible Version">
              <Combobox
                options={[{ value: "BSB", label: "BSB (Berean Study Bible)" }, { value: "KJV", label: "KJV (King James)" }, { value: "ESV", label: "ESV" }, { value: "NIV", label: "NIV" }]}
                value={h.bibleVersion} onChange={h.setBibleVersion}
                placeholder="Select version" width="w-full" />
            </FormField>
          </Section>

          <Section title="Content Fields">
            <FormField label="Explanation">
              <Textarea value={h.explanation} onChange={(e) => h.setExplanation(e.target.value)}
                placeholder={h.t.devotions.contentPlaceholder || "Explain the heart of this devotion and its key message..."}
                rows={5} className="resize-none" />
            </FormField>
            <FormField label="Application">
              <Textarea value={h.application} onChange={(e) => h.setApplication(e.target.value)}
                placeholder={h.t.devotions.contentPlaceholder || "How should readers respond and apply this to daily life?"}
                rows={4} className="resize-none" />
            </FormField>
            <FormField label="Introduction">
              <Textarea value={h.verseIntroduction} onChange={(e) => h.setVerseIntroduction(e.target.value)}
                placeholder="Introduce the devotion, the verse, and its central purpose..."
                rows={4} className="resize-none" />
            </FormField>
            <FormField label="Learn More" optional>
              <Textarea value={h.learnMore} onChange={(e) => h.setLearnMore(e.target.value)}
                placeholder="Additional resources, related verses, or deeper insights..."
                rows={4} className="resize-none" />
            </FormField>
          </Section>

          <Section title="Background" defaultOpen={false}>
            <FormField label="Author">
              <Textarea value={h.backgroundAuthor} onChange={(e) => h.setBackgroundAuthor(e.target.value)}
                placeholder="Who wrote the book and why does that matter?"
                rows={3} className="resize-none" />
            </FormField>
            <FormField label="Book">
              <Textarea value={h.backgroundBook} onChange={(e) => h.setBackgroundBook(e.target.value)}
                placeholder="Summarize the book and its major purpose..."
                rows={3} className="resize-none" />
            </FormField>
            <FormField label="Context">
              <Textarea value={h.backgroundContext} onChange={(e) => h.setBackgroundContext(e.target.value)}
                placeholder="Describe the immediate historical and literary context..."
                rows={3} className="resize-none" />
            </FormField>
          </Section>

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
            saveLabel={h.isEditing ? "Update Devotion" : h.t.devotions.saveDevotion}
            disabled={h.saveDisabled}
            onSave={h.handleSave}
          />
        </form>
      </DailyContentFormCard>
    </PageContentWrapper>
  );
};

export default AddDailyDevotion;

"use client";

/**
 * AddDailyExegesis — add/edit daily exegesis with all fields.
 * All state in useAddDailyExegesis hook, UI split into section components.
 * Zero raw divs — pure compositor.
 */
import { Sparkles, BookOpen } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddDailyExegesis } from "../hooks/useAddDailyExegesis";
import {
  CollapsibleSection as Section, DailyContentPageHeader, DailyContentFormActions,
  DailyContentFormCard, PublishToggle, PageContentWrapper, FormField, DateTimeFields,
} from "../components";

const AddDailyExegesis = () => {
  const h = useAddDailyExegesis();

  return (
    <PageContentWrapper isRtl={h.isRtl}>
      <DailyContentPageHeader
        backTo="/daily-exegesis"
        backLabel={h.t.common.back}
        icon={Sparkles}
        title={h.isEditing ? "Edit Exegesis" : "Add Daily Exegesis"}
        subtitle="Teach, explain, and apply Scripture with rich context"
      />

      <DailyContentFormCard
        icon={BookOpen}
        title="Exegesis Details"
        description="Provide the passage, teaching body, and supporting content"
      >
        <form onSubmit={h.handleSave} className="space-y-8">
          <Section title="Title">
            <FormField label="Title" required>
              <Input value={h.title} onChange={(e) => h.setTitle(e.target.value)}
                placeholder="Enter exegesis title..." className="text-lg" />
            </FormField>
          </Section>

          <Section title="Passage Reference">
            <FormField label="Passage Reference" required description="The Bible passage this exegesis covers">
              <Input value={h.passageReference} onChange={(e) => h.setPassageReference(e.target.value)}
                placeholder="e.g., Psalm 46:10, John 15:1-5, Romans 8:28-30" />
            </FormField>
          </Section>

          <Section title="Teaching Body">
            <FormField label="Teaching Body" required>
              <Textarea value={h.teachingBody} onChange={(e) => h.setTeachingBody(e.target.value)}
                placeholder="Write the main teaching content — the expository explanation of the passage..."
                rows={10} className="min-h-[250px] leading-relaxed resize-none" />
            </FormField>
          </Section>

          <Section title="Introduction & Context" defaultOpen={false}>
            <FormField label="Introduction">
              <Textarea value={h.introduction} onChange={(e) => h.setIntroduction(e.target.value)}
                placeholder="Introduce the passage, its purpose, and what the reader will learn..."
                rows={4} className="resize-none" />
            </FormField>
            <FormField label="Context Summary">
              <Textarea value={h.contextSummary} onChange={(e) => h.setContextSummary(e.target.value)}
                placeholder="Describe the historical, literary, and theological context..."
                rows={4} className="resize-none" />
            </FormField>
          </Section>

          <Section title="Application & Prayer" defaultOpen={false}>
            <FormField label="Application">
              <Textarea value={h.application} onChange={(e) => h.setApplication(e.target.value)}
                placeholder="How should readers apply this passage to their lives?"
                rows={4} className="resize-none" />
            </FormField>
            <FormField label="Prayer">
              <Textarea value={h.prayer} onChange={(e) => h.setPrayer(e.target.value)}
                placeholder="Write a prayer inspired by this passage..."
                rows={4} className="resize-none" />
            </FormField>
          </Section>

          <Section title="Tags" defaultOpen={false}>
            <FormField label="Tags" description="Comma-separated tags for categorization">
              <Input value={h.tags} onChange={(e) => h.setTags(e.target.value)}
                placeholder="e.g., daily, exegesis, psalms, trust" />
            </FormField>
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
            cancelTo="/daily-exegesis"
            cancelLabel={h.t.common.cancel}
            saveLabel={h.isEditing ? "Update Exegesis" : "Create Exegesis"}
            disabled={h.saveDisabled}
            onSave={h.handleSave}
          />
        </form>
      </DailyContentFormCard>
    </PageContentWrapper>
  );
};

export default AddDailyExegesis;

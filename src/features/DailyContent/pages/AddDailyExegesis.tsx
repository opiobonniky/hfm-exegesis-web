import { Sparkles, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddDailyExegesis } from "../hooks/useAddDailyExegesis";
import {
  CollapsibleSection as Section,
  DailyContentFormActions,
  DailyContentFormCard,
  DailyContentPageHeader,
  FormField,
  PageContentWrapper,
  PublishToggle,
  DateTimeFields,
} from "../components";

export default function AddDailyExegesis() {
  const { data, actions } = useAddDailyExegesis();

  return (
    <PageContentWrapper isRtl={data.isRtl}>
      <DailyContentPageHeader
        backTo="/daily-exegesis"
        backLabel={data.t.common.back}
        icon={Sparkles}
        title={data.isEditing ? "Edit Exegesis" : "Add Daily Exegesis"}
        subtitle="Teach, explain, and apply Scripture with rich context"
      />
      <DailyContentFormCard
        icon={BookOpen}
        title="Exegesis Details"
        description="Provide the passage, teaching body, and supporting content"
        onSubmit={actions.handleSave}
      >
        <Section title="Title">
          <FormField label="Title" required>
            <Input
              value={data.title}
              onChange={(e) => actions.setTitle(e.target.value)}
              placeholder="Enter exegesis title..."
              className="text-lg"
            />
          </FormField>
        </Section>

        <Section title="Passage Reference">
          <FormField label="Passage Reference" required description="The Bible passage this exegesis covers">
            <Input
              value={data.passageReference}
              onChange={(e) => actions.setPassageReference(e.target.value)}
              placeholder="e.g., Psalm 46:10, John 15:1-5, Romans 8:28-30"
            />
          </FormField>
        </Section>

        <Section title="Teaching Body">
          <FormField label="Teaching Body" required>
            <Textarea
              value={data.teachingBody}
              onChange={(e) => actions.setTeachingBody(e.target.value)}
              placeholder="Write the main teaching content — the expository explanation of the passage..."
              rows={10}
              className="min-h-[250px] leading-relaxed resize-none"
            />
          </FormField>
        </Section>

        <Section title="Introduction & Context" defaultOpen={false}>
          <FormField label="Introduction">
            <Textarea
              value={data.introduction}
              onChange={(e) => actions.setIntroduction(e.target.value)}
              placeholder="Introduce the passage, its purpose, and what the reader will learn..."
              rows={4}
              className="resize-none"
            />
          </FormField>
          <FormField label="Context Summary">
            <Textarea
              value={data.contextSummary}
              onChange={(e) => actions.setContextSummary(e.target.value)}
              placeholder="Describe the historical, literary, and theological context..."
              rows={4}
              className="resize-none"
            />
          </FormField>
        </Section>

        <Section title="Application & Prayer" defaultOpen={false}>
          <FormField label="Application">
            <Textarea
              value={data.application}
              onChange={(e) => actions.setApplication(e.target.value)}
              placeholder="How should readers apply this passage to their lives?"
              rows={4}
              className="resize-none"
            />
          </FormField>
          <FormField label="Prayer">
            <Textarea
              value={data.prayer}
              onChange={(e) => actions.setPrayer(e.target.value)}
              placeholder="Write a prayer inspired by this passage..."
              rows={4}
              className="resize-none"
            />
          </FormField>
        </Section>

        <Section title="Tags" defaultOpen={false}>
          <FormField label="Tags" description="Comma-separated tags for categorization">
            <Input
              value={data.tags}
              onChange={(e) => actions.setTags(e.target.value)}
              placeholder="e.g., daily, exegesis, psalms, trust"
            />
          </FormField>
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
          cancelTo="/daily-exegesis"
          cancelLabel={data.t.common.cancel}
          saveLabel={data.isEditing ? "Update Exegesis" : "Create Exegesis"}
          disabled={data.saveDisabled}
          onSave={actions.handleSave}
        />
      </DailyContentFormCard>
    </PageContentWrapper>
  );
}

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
import { tt } from '@/components/languages/hardcodedTranslate';

export default function AddDailyExegesis() {
  const { data, actions } = useAddDailyExegesis();

  return (
    <PageContentWrapper isRtl={data.isRtl}>
      <DailyContentPageHeader
        backTo="/daily-exegesis"
        backLabel={data.t.common.back}
        icon={Sparkles}
        title={data.isEditing ? tt("Edit Exegesis") : tt("Add Daily Exegesis")}
        subtitle={tt("Teach, explain, and apply Scripture with rich context")}
      />
      <DailyContentFormCard
        icon={BookOpen}
        title={tt("Exegesis Details")}
        description={tt("Provide the passage, teaching body, and supporting content")}
        onSubmit={actions.handleSave}
      >
        <Section title={tt("Title")}>
          <FormField label={tt("Title")} required>
            <Input
              value={data.title}
              onChange={(e) => actions.setTitle(e.target.value)}
              placeholder={tt("Enter exegesis title...")}
              className="text-lg"
            />
          </FormField>
        </Section>

        <Section title={tt("Passage Reference")}>
          <FormField label={tt("Passage Reference")} required description={tt("The Bible passage this exegesis covers")}>
            <Input
              value={data.passageReference}
              onChange={(e) => actions.setPassageReference(e.target.value)}
              placeholder={tt("e.g., Psalm 46:10, John 15:1-5, Romans 8:28-30")}
            />
          </FormField>
        </Section>

        <Section title={tt("Teaching Body")}>
          <FormField label={tt("Teaching Body")} required>
            <Textarea
              value={data.teachingBody}
              onChange={(e) => actions.setTeachingBody(e.target.value)}
              placeholder={tt("Write the main teaching content — the expository explanation of the passage...")}
              rows={10}
              className="min-h-[250px] leading-relaxed resize-none"
            />
          </FormField>
        </Section>

        <Section title={tt("Introduction & Context")} defaultOpen={false}>
          <FormField label={tt("Introduction")}>
            <Textarea
              value={data.introduction}
              onChange={(e) => actions.setIntroduction(e.target.value)}
              placeholder={tt("Introduce the passage, its purpose, and what the reader will learn...")}
              rows={4}
              className="resize-none"
            />
          </FormField>
          <FormField label={tt("Context Summary")}>
            <Textarea
              value={data.contextSummary}
              onChange={(e) => actions.setContextSummary(e.target.value)}
              placeholder={tt("Describe the historical, literary, and theological context...")}
              rows={4}
              className="resize-none"
            />
          </FormField>
        </Section>

        <Section title={tt("Application & Prayer")} defaultOpen={false}>
          <FormField label={tt("Application")}>
            <Textarea
              value={data.application}
              onChange={(e) => actions.setApplication(e.target.value)}
              placeholder={tt("How should readers apply this passage to their lives?")}
              rows={4}
              className="resize-none"
            />
          </FormField>
          <FormField label={tt("Prayer")}>
            <Textarea
              value={data.prayer}
              onChange={(e) => actions.setPrayer(e.target.value)}
              placeholder={tt("Write a prayer inspired by this passage...")}
              rows={4}
              className="resize-none"
            />
          </FormField>
        </Section>

        <Section title={tt("Tags")} defaultOpen={false}>
          <FormField label={tt("Tags")} description={tt("Comma-separated tags for categorization")}>
            <Input
              value={data.tags}
              onChange={(e) => actions.setTags(e.target.value)}
              placeholder={tt("e.g., daily, exegesis, psalms, trust")}
            />
          </FormField>
        </Section>

        <Section title={tt("Schedule & Publish")}>
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

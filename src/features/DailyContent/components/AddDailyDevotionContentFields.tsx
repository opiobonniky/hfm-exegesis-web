import { Textarea } from "@/components/ui/textarea";
import type { AddDailyDevotionContentFieldsProps } from "../types";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";

export function AddDailyDevotionContentFields({ explanation, application, verseIntroduction, learnMore, contentPlaceholder, setExplanation, setApplication, setVerseIntroduction, setLearnMore }: AddDailyDevotionContentFieldsProps) {
  return (
    <CollapsibleSection title="Content Fields">
      <FormField label="Explanation">
        <Textarea
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          placeholder={contentPlaceholder || "Explain the heart of this devotion and its key message..."}
          rows={5}
          className="resize-none"
        />
      </FormField>
      <FormField label="Application">
        <Textarea
          value={application}
          onChange={(event) => setApplication(event.target.value)}
          placeholder={contentPlaceholder || "How should readers respond and apply this to daily life?"}
          rows={4}
          className="resize-none"
        />
      </FormField>
      <FormField label="Introduction">
        <Textarea
          value={verseIntroduction}
          onChange={(event) => setVerseIntroduction(event.target.value)}
          placeholder="Introduce the devotion, the verse, and its central purpose..."
          rows={4}
          className="resize-none"
        />
      </FormField>
      <FormField label="Learn More" optional>
        <Textarea
          value={learnMore}
          onChange={(event) => setLearnMore(event.target.value)}
          placeholder="Additional resources, related verses, or deeper insights..."
          rows={4}
          className="resize-none"
        />
      </FormField>
    </CollapsibleSection>
  );
}

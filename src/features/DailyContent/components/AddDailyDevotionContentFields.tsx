import { Textarea } from "@/components/ui/textarea";
import type { AddDailyDevotionPageModel } from "../hooks/useAddDailyDevotion";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";

interface Props {
  model: AddDailyDevotionPageModel;
}

export function AddDailyDevotionContentFields({ model: h }: Props) {
  return (
    <CollapsibleSection title="Content Fields">
      <FormField label="Explanation">
        <Textarea
          value={h.explanation}
          onChange={(event) => h.setExplanation(event.target.value)}
          placeholder={h.t.devotions.contentPlaceholder || "Explain the heart of this devotion and its key message..."}
          rows={5}
          className="resize-none"
        />
      </FormField>
      <FormField label="Application">
        <Textarea
          value={h.application}
          onChange={(event) => h.setApplication(event.target.value)}
          placeholder={h.t.devotions.contentPlaceholder || "How should readers respond and apply this to daily life?"}
          rows={4}
          className="resize-none"
        />
      </FormField>
      <FormField label="Introduction">
        <Textarea
          value={h.verseIntroduction}
          onChange={(event) => h.setVerseIntroduction(event.target.value)}
          placeholder="Introduce the devotion, the verse, and its central purpose..."
          rows={4}
          className="resize-none"
        />
      </FormField>
      <FormField label="Learn More" optional>
        <Textarea
          value={h.learnMore}
          onChange={(event) => h.setLearnMore(event.target.value)}
          placeholder="Additional resources, related verses, or deeper insights..."
          rows={4}
          className="resize-none"
        />
      </FormField>
    </CollapsibleSection>
  );
}

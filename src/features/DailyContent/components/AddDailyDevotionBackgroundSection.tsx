import { Textarea } from "@/components/ui/textarea";
import type { AddDailyDevotionPageModel } from "../hooks/useAddDailyDevotion";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";

interface Props {
  model: AddDailyDevotionPageModel;
}

export function AddDailyDevotionBackgroundSection({ model: h }: Props) {
  return (
    <CollapsibleSection title="Background" defaultOpen={false}>
      <FormField label="Author">
        <Textarea
          value={h.backgroundAuthor}
          onChange={(event) => h.setBackgroundAuthor(event.target.value)}
          placeholder="Who wrote the book and why does that matter?"
          rows={3}
          className="resize-none"
        />
      </FormField>
      <FormField label="Book">
        <Textarea
          value={h.backgroundBook}
          onChange={(event) => h.setBackgroundBook(event.target.value)}
          placeholder="Summarize the book and its major purpose..."
          rows={3}
          className="resize-none"
        />
      </FormField>
      <FormField label="Context">
        <Textarea
          value={h.backgroundContext}
          onChange={(event) => h.setBackgroundContext(event.target.value)}
          placeholder="Describe the immediate historical and literary context..."
          rows={3}
          className="resize-none"
        />
      </FormField>
    </CollapsibleSection>
  );
}

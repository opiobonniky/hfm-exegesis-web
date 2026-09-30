import { Textarea } from "@/components/ui/textarea";
import type { AddDailyDevotionBackgroundSectionProps } from "../types";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";
import { tt } from '@/components/languages/hardcodedTranslate';

export function AddDailyDevotionBackgroundSection({ backgroundAuthor, backgroundBook, backgroundContext, setBackgroundAuthor, setBackgroundBook, setBackgroundContext }: AddDailyDevotionBackgroundSectionProps) {
  return (
    <CollapsibleSection title={tt("Background")} defaultOpen={false}>
      <FormField label={tt("Author")}>
        <Textarea
          value={backgroundAuthor}
          onChange={(event) => setBackgroundAuthor(event.target.value)}
          placeholder={tt("Who wrote the book and why does that matter?")}
          rows={3}
          className="resize-none"
        />
      </FormField>
      <FormField label={tt("Book")}>
        <Textarea
          value={backgroundBook}
          onChange={(event) => setBackgroundBook(event.target.value)}
          placeholder={tt("Summarize the book and its major purpose...")}
          rows={3}
          className="resize-none"
        />
      </FormField>
      <FormField label={tt("Context")}>
        <Textarea
          value={backgroundContext}
          onChange={(event) => setBackgroundContext(event.target.value)}
          placeholder={tt("Describe the immediate historical and literary context...")}
          rows={3}
          className="resize-none"
        />
      </FormField>
    </CollapsibleSection>
  );
}

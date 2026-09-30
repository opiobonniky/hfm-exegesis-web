import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AddDailyDevotionCoreSectionsProps } from "../types";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";
import { tt } from '@/components/languages/hardcodedTranslate';

export function AddDailyDevotionCoreSections({ title, content, setTitle, setContent }: AddDailyDevotionCoreSectionsProps) {
  return (
    <>
      <CollapsibleSection title={tt("Devotion Title")}>
        <FormField label={tt("Title")} required>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={tt("Enter devotion title...")}
            className="text-lg"
          />
        </FormField>
      </CollapsibleSection>

      <CollapsibleSection title={tt("Devotion Content")}>
        <FormField label={tt("Content")} required>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={tt("Write your devotional message...")}
            className="min-h-[200px] leading-relaxed resize-none"
          />
        </FormField>
      </CollapsibleSection>
    </>
  );
}

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AddDailyDevotionCoreSectionsProps } from "../types";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";

export function AddDailyDevotionCoreSections({ title, content, setTitle, setContent }: AddDailyDevotionCoreSectionsProps) {
  return (
    <>
      <CollapsibleSection title="Devotion Title">
        <FormField label="Title" required>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter devotion title..."
            className="text-lg"
          />
        </FormField>
      </CollapsibleSection>

      <CollapsibleSection title="Devotion Content">
        <FormField label="Content" required>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your devotional message..."
            className="min-h-[200px] leading-relaxed resize-none"
          />
        </FormField>
      </CollapsibleSection>
    </>
  );
}

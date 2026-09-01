import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AddDailyDevotionPageModel } from "../hooks/useAddDailyDevotion";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";

interface Props {
  model: AddDailyDevotionPageModel;
}

export function AddDailyDevotionCoreSections({ model: h }: Props) {
  return (
    <>
      <CollapsibleSection title="Devotion Title">
        <FormField label="Title" required>
          <Input
            value={h.title}
            onChange={(event) => h.setTitle(event.target.value)}
            placeholder="Enter devotion title..."
            className="text-lg"
          />
        </FormField>
      </CollapsibleSection>

      <CollapsibleSection title="Devotion Content">
        <FormField label="Content" required>
          <Textarea
            value={h.content}
            onChange={(event) => h.setContent(event.target.value)}
            placeholder="Write your devotional message..."
            className="min-h-[200px] leading-relaxed resize-none"
          />
        </FormField>
      </CollapsibleSection>
    </>
  );
}

import { Input } from "@/components/ui/input";
import type { AddDailyDevotionCoreSectionsProps } from "../types";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";
import { tt } from '@/components/languages/hardcodedTranslate';

export function AddDailyDevotionCoreSections({ title, setTitle, error }: AddDailyDevotionCoreSectionsProps) {
  return (
    <>
      <CollapsibleSection title={tt("Devotion Title")}>
        <FormField label={tt("Title")} required error={error}>
          <Input
            value={title}
            aria-invalid={!!error}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={tt("Enter devotion title...")}
            className="text-lg"
          />
        </FormField>
      </CollapsibleSection>
    </>
  );
}

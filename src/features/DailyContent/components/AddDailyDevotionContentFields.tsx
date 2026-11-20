import { Textarea } from "@/components/ui/textarea";
import type { AddDailyDevotionContentFieldsProps } from "../types";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";
import { tt } from '@/components/languages/hardcodedTranslate';
import { DevotionListEditor } from './DevotionListEditor';

export function AddDailyDevotionContentFields({ explanation, reflectionQuestions, prayer, practicalApplications, learningPoints, setExplanation, setReflectionQuestions, setPrayer, setPracticalApplications, setLearningPoints, errors = {} }: AddDailyDevotionContentFieldsProps) {
  return (
    <CollapsibleSection title={tt("Devotional Content")}>
      <FormField label={tt("Explanation")} required error={errors.explanation}>
        <Textarea
          data-validation-field="explanation"
          value={explanation}
          aria-invalid={!!errors.explanation}
          onChange={(event) => setExplanation(event.target.value)}
          placeholder={tt("Write the full devotional explanation...")}
          className="min-h-[260px] resize-y leading-relaxed"
        />
      </FormField>
      <DevotionListEditor label={tt('Reflection Questions')} itemLabel={tt('Reflection question')}
        addLabel={tt('Add question')} removeLabel={tt('Remove question')} emptyLabel={tt('No reflection questions added yet.')}
        placeholder={tt('Write a reflection question...')} value={reflectionQuestions} onChange={setReflectionQuestions}
        error={errors.reflectionQuestions} validationField="reflectionQuestions" rows={2} />
      <FormField label={tt("Prayer")} required error={errors.prayer}>
        <Textarea
          data-validation-field="prayer"
          value={prayer}
          aria-invalid={!!errors.prayer}
          onChange={(event) => setPrayer(event.target.value)}
          placeholder={tt("Write a closing prayer...")}
          rows={6}
        />
      </FormField>
      <DevotionListEditor label={tt('Practical Application')} itemLabel={tt('Application')}
        addLabel={tt('Add application')} removeLabel={tt('Remove application')} emptyLabel={tt('No practical applications added yet.')}
        placeholder={tt('Write a practical action...')} value={practicalApplications} onChange={setPracticalApplications}
        error={errors.practicalApplications} validationField="practicalApplications" rows={3} />
      <DevotionListEditor label={tt('We Learn Three Things From This Devotional')} itemLabel={tt('Learning point')}
        addLabel={tt('Add learning point')} removeLabel={tt('Remove learning point')} emptyLabel={tt('No learning points added yet.')}
        placeholder={tt('Write a concise learning point...')} value={learningPoints} onChange={setLearningPoints}
        error={errors.learningPoints} validationField="learningPoints" rows={3} maxItems={3} />
    </CollapsibleSection>
  );
}

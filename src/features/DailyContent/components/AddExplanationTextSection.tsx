import { ScrollText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { AddExplanationPageModel } from "../hooks/useAddExplanation";
import { CharCount } from "./CharCount";
import { FieldLabelWithCounter } from "./FieldLabelWithCounter";
import { FormSectionCard } from "./FormSectionCard";
import { InlineWarning } from "./InlineWarning";

interface Props {
  model: AddExplanationPageModel;
}

export function AddExplanationTextSection({ model: h }: Props) {
  return (
    <FormSectionCard
      icon={ScrollText}
      title={h.t.verseExplanations.explanationTitle}
      description={h.t.verseExplanations.explanationDesc}
    >
      <FieldLabelWithCounter
        label={h.t.verseExplanations.explanationText}
        counter={<CharCount value={h.explanation} max={5000} />}
      />
      <Textarea
        rows={8}
        placeholder={h.t.verseExplanations.explanationPlaceholder}
        value={h.explanation}
        onChange={(event) => h.setExplanation(event.target.value)}
        maxLength={5000}
        className="resize-y font-mono text-sm leading-relaxed"
      />
      {h.showExplanationWarning && (
        <InlineWarning message={h.t.verseExplanations.minCharsError} />
      )}
    </FormSectionCard>
  );
}

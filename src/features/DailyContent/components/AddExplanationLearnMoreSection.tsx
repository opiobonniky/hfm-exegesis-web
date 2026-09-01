import { Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { AddExplanationPageModel } from "../hooks/useAddExplanation";
import { CharCount } from "./CharCount";
import { FieldLabelWithCounter } from "./FieldLabelWithCounter";
import { FormSectionCard } from "./FormSectionCard";

interface Props {
  model: AddExplanationPageModel;
}

export function AddExplanationLearnMoreSection({ model: h }: Props) {
  return (
    <FormSectionCard
      icon={Info}
      title={h.t.verseExplanations.learnMoreTitle}
      variant="amber"
      description={h.t.verseExplanations.learnMoreDesc}
    >
      <FieldLabelWithCounter
        label={h.t.verseExplanations.learnMoreLabel}
        counter={<CharCount value={h.learnMore} max={8000} />}
      />
      <Textarea
        rows={6}
        placeholder={h.t.verseExplanations.learnMorePlaceholder}
        value={h.learnMore}
        onChange={(event) => h.setLearnMore(event.target.value)}
        maxLength={8000}
        className="resize-y font-mono text-sm leading-relaxed"
      />
    </FormSectionCard>
  );
}

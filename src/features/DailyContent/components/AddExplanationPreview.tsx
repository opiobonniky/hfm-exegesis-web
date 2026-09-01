import type { AddExplanationPageModel } from "../hooks/useAddExplanation";
import { FormattingTips, ValidationChecklist } from "./ValidationChecklist";
import { LivePreview } from "./LivePreview";
import { LivePreviewPanel } from "./LivePreviewPanel";

interface Props {
  model: AddExplanationPageModel;
}

export function AddExplanationPreview({ model: h }: Props) {
  return (
    <LivePreviewPanel label={h.t.verseExplanations.appPreview}>
      <LivePreview
        bookName={h.bookName}
        chapter={h.chapter}
        verseNumber={h.verseNumber}
        bibleVersion={h.bibleVersion}
        explanation={h.explanation}
        learnMore={h.learnMore}
        t={h.t}
      />
      <FormattingTips t={h.t} />
      <ValidationChecklist items={h.validationItems} valid={h.isValid} t={h.t} />
    </LivePreviewPanel>
  );
}

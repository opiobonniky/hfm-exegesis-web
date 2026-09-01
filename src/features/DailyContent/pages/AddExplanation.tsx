"use client";

import { useAddExplanation } from "../hooks/useAddExplanation";
import {
  AddExplanationHeader,
  AddExplanationLearnMoreSection,
  AddExplanationPreview,
  AddExplanationReferenceSection,
  AddExplanationSaveActions,
  AddExplanationTextSection,
  FormTwoColumn,
  PageContentWrapper,
  PromptSelector,
} from "../components";

const AddVerseExplanation = () => {
  const h = useAddExplanation();

  return (
    <PageContentWrapper isRtl={h.isRtl} maxWidth="mx-auto space-y-6">
      <AddExplanationHeader model={h} />
      <FormTwoColumn
        left={
          <>
            <AddExplanationReferenceSection model={h} />
            <AddExplanationTextSection model={h} />
            <AddExplanationLearnMoreSection model={h} />
            <PromptSelector
              prompts={h.prompts}
              loading={h.promptsLoading}
              selectedIds={h.selectedPromptIds}
              onToggle={h.togglePrompt}
              t={h.t}
            />
            <AddExplanationSaveActions model={h} />
          </>
        }
        right={<AddExplanationPreview model={h} />}
      />
    </PageContentWrapper>
  );
};

export default AddVerseExplanation;

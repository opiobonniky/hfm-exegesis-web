"use client";

import { useAdminAddTriviaQuestionPage } from "../hooks/useAdminAddTriviaQuestionPage";
import {
  TriviaQuestionHeader,
  TriviaQuestionField,
  TriviaOptionsSection,
  TriviaExplanationSection,
  TriviaMetadataSection,
  TriviaQuestionLoading,
} from "../components";

export default function AdminAddTriviaQuestionPage() {
  const h = useAdminAddTriviaQuestionPage();

  if (h.loading) return <TriviaQuestionLoading />;

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <TriviaQuestionHeader
        isEditing={h.isEditing}
        form={h.form}
        saving={h.saving}
        onGoBack={h.goBack}
        onSave={h.handleSave}
      />
      <TriviaQuestionField form={h.form} onFormChange={h.setForm} />
      <TriviaOptionsSection
        form={h.form}
        onFormChange={h.setForm}
        updateOption={h.updateOption}
        addOption={h.addOption}
        removeOption={h.removeOption}
      />
      <TriviaExplanationSection form={h.form} onFormChange={h.setForm} />
      <TriviaMetadataSection form={h.form} onFormChange={h.setForm} />
    </div>
  );
}

import { AddExplanationHeaderBar } from "../components/AddExplanationHeaderBar";
import { AddExplanationProgressCard } from "../components/AddExplanationProgressCard";
import { AddExplanationWorkspace } from "../components/AddExplanationWorkspace";
import { useAddExplanation } from "../hooks/useAddExplanation";

export default function AddExplanationPage() {
  const { data, actions } = useAddExplanation();

  if (data.loadingExisting) return null;

  return (
    <div className="min-h-screen bg-background text-foreground mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <AddExplanationHeaderBar
        isEditMode={data.isEditMode}
        isValid={data.isValid}
        saving={data.saving}
        goBack={actions.goBack}
        handleSave={actions.handleSave}
      />
      <AddExplanationProgressCard
        bookName={data.form.bookName}
        chapter={data.form.chapter}
        verseNumber={data.form.verseNumber}
        completionPercent={data.completionPercent}
      />
      <AddExplanationWorkspace data={data} actions={actions} />
    </div>
  );
}

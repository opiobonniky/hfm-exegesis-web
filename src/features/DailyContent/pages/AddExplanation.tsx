import { AddExplanationHeaderBar } from "../components/AddExplanationHeaderBar";
import { AddExplanationProgressCard } from "../components/AddExplanationProgressCard";
import { AddExplanationWorkspace } from "../components/AddExplanationWorkspace";
import { useAddExplanation } from "../hooks/useAddExplanation";
import { tt } from '@/components/languages/hardcodedTranslate';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

export default function AddExplanationPage() {
  // Add and Edit use the same URL. A new navigation must start a new editor
  // session rather than retaining the preceding record ID or study version.
  const { key } = useLocation();
  return <ExplanationEditor key={key} />;
}

function ExplanationEditor() {
  const { data, actions } = useAddExplanation();
  const loadingLabel = tt(data.isEditMode ? 'Loading explanation for editing…' : 'Checking for a saved explanation…');

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1440px] bg-background px-4 py-6 text-foreground sm:px-6 lg:py-8">
      <AddExplanationHeaderBar
        isEditMode={data.isEditMode}
        goBack={actions.goBack}
      />
      {data.checkingExisting ? (
        <div className="my-4 space-y-2 rounded-xl border border-border bg-card p-4">
          <p role="status" id="explanation-loading-label" className="text-sm font-medium">{loadingLabel}</p>
          <progress aria-labelledby="explanation-loading-label" className="block h-2 w-full accent-primary" />
        </div>
      ) :
        data.lookupError ? <div role="alert" className="my-4 rounded-xl border border-destructive/30 p-4 text-sm">
          <p>{tt('Could not check for an existing explanation. Retry before saving to avoid overwriting saved content.')}</p>
          <Button type="button" variant="outline" className="mt-2" onClick={actions.retryExisting}>{tt('Retry')}</Button>
        </div> : null}
      <AddExplanationProgressCard
        bookName={data.form.bookName}
        chapter={data.form.chapter}
        verseNumber={data.form.verseNumber}
        verseEnd={data.form.verseEnd}
        completionPercent={data.completionPercent}
      />
      <fieldset disabled={data.checkingExisting || data.lookupError || data.saving}
        aria-busy={data.checkingExisting || data.saving} className="min-w-0">
        <AddExplanationWorkspace data={data} actions={actions} />
      </fieldset>
    </div>
  );
}

import { AddExplanationHeaderBar } from "../components/AddExplanationHeaderBar";
import { AddExplanationProgressCard } from "../components/AddExplanationProgressCard";
import { AddExplanationWorkspace } from "../components/AddExplanationWorkspace";
import { useAddExplanation } from "../hooks/useAddExplanation";
import { tt } from '@/components/languages/hardcodedTranslate';
import { Button } from '@/components/ui/button';

export default function AddExplanationPage() {
  const { data, actions } = useAddExplanation();

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1440px] bg-background px-4 py-6 text-foreground sm:px-6 lg:py-8">
      <AddExplanationHeaderBar
        isEditMode={data.isEditMode}
        goBack={actions.goBack}
      />
      {data.checkingExisting ? <p role="status" className="my-4 rounded-xl border bg-muted/30 p-4 text-sm">{tt('Checking for a saved explanation…')}</p> :
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
      <fieldset disabled={data.checkingExisting || data.lookupError || data.saving} className="min-w-0">
        <AddExplanationWorkspace data={data} actions={actions} />
      </fieldset>
    </div>
  );
}

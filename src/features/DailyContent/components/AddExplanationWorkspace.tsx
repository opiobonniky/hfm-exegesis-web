import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VERSE_EXPLANATION_STEP_ORDER, VERSE_EXPLANATION_STEPS } from "../constants";
import type { AddExplanationPageActions, AddExplanationPageData } from "../hooks/useAddExplanation";
import { AddExplanationSidebar } from "./AddExplanationSidebar";
import { AddExplanationReferenceForm } from "./AddExplanationReferenceForm";
import { AddExplanationExegesisForm } from "./AddExplanationExegesisForm";
import { AddExplanationStudyForm } from "./AddExplanationStudyForm";
import { AddExplanationExtrasForm, AddExplanationPracticalApplications } from "./AddExplanationExtrasForm";
import { AddExplanationFooterActions } from "./AddExplanationFooterActions";
import type { AddExplanationWorkspaceProps } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';
import { useValidationFeedback } from '../hooks/useValidationFeedback';
import { Button } from '@/components/ui/button';

export function AddExplanationWorkspace({
  data,
  actions,
}: AddExplanationWorkspaceProps & {
  data: AddExplanationPageData;
  actions: AddExplanationPageActions;
}) {
  const feedback = useValidationFeedback();
  const scope = data.currentStep;
  const errors = { ...data.fieldErrors };
  for (const key of Object.keys(errors) as (keyof typeof errors)[]) {
    const error = errors[key];
    if (typeof error === 'string') {
      if (!feedback.visible(key, scope)) Object.assign(errors, { [key]: '' });
    } else {
      Object.assign(errors, { [key]: error.map((message, index) => feedback.visible(`${key}.${index}`, scope) ? message : '') });
    }
  }
  const next = () => {
    if (!data.canAdvanceFromCurrent) feedback.attempt(scope);
    else actions.goNext();
  };
  const save = () => {
    if (data.referenceOnlyMove) {
      void actions.handleSave();
      return;
    }
    const unfinished = VERSE_EXPLANATION_STEP_ORDER.find(step => !data.stepCompletion[step]);
    if (unfinished) {
      feedback.attempt(unfinished);
      actions.setActiveTab(unfinished);
    } else if (!data.isValid) feedback.attempt(scope);
    else void actions.handleSave();
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
      <AddExplanationSidebar
        currentStep={data.currentStep}
        currentStepIndex={data.currentStepIndex}
        stepCompletion={data.stepCompletion}
        referenceComplete={data.referenceComplete}
        exegesisComplete={data.exegesisComplete}
        onStepChange={step => {
          const targetIndex = VERSE_EXPLANATION_STEP_ORDER.indexOf(step);
          const unfinished = VERSE_EXPLANATION_STEP_ORDER.slice(data.currentStepIndex, targetIndex)
            .find(step => !data.stepCompletion[step]);
          if (unfinished) {
            feedback.attempt(unfinished);
            actions.setActiveTab(unfinished);
          } else actions.goToStep(step);
        }}
      />
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <Tabs {...feedback.capture(scope)} value={data.activeTab} onValueChange={(value) => actions.setActiveTab(value as typeof data.activeTab)}>
          <TabsList className="hidden" aria-hidden="true">
            {VERSE_EXPLANATION_STEPS.map(step => <TabsTrigger key={step.id} value={step.id}>{tt(step.label)}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="reference">
            <AddExplanationReferenceForm
              bookName={data.form.bookName}
              chapter={data.form.chapter}
              verseNumber={data.form.verseNumber}
              verseEnd={data.form.verseEnd}
              referenceError={feedback.visible(!data.form.bookName ? 'bookName' : !data.form.chapter ? 'chapter' : 'verseNumber', scope)
                ? data.fieldErrors.reference : ''}
              bibleVersionError={errors.bibleVersion}
              passageError={data.passageError}
              retryPassage={data.retryPassage}
              bibleVersion={data.form.bibleVersion}
              sortedTranslationOptions={data.sortedTranslationOptions}
              bookOptions={data.bookOptions}
              chapterOptions={data.chapterOptions}
              selectedVerse={data.selectedVerse}
              verseLoadingForTrigger={data.verseLoadingForTrigger}
              verseOptions={data.verseOptions}
              verseOptionsLoading={data.verseOptionsLoading}
              verseTextLoading={data.verseTextLoading}
              selectedVerseText={data.selectedVerseText}
              maxChapterNumber={data.maxChapterNumber}
              maxVerseNumber={data.maxVerseNumber}
              updateField={actions.updateField}
            />
            {data.referenceOnlyMove && (
              <Button type="button" className="mt-4" onClick={save} disabled={!data.isValid || data.saving}>
                {tt('Save reference change')}
              </Button>
            )}
          </TabsContent>
          <TabsContent value="exegesis">
            <AddExplanationExegesisForm
              explanationText={data.form.exegesis.explanationText}
              applicationText={data.form.exegesis.applicationText}
              errors={errors}
              updateNested={actions.updateNested}
            />
          </TabsContent>
          <TabsContent value="learnMore" className="space-y-8">
            <AddExplanationStudyForm
              showErrors={!data.isEditMode || data.richContentTouched}
              revealRowErrors={feedback.attempted(scope)}
              introduction={data.form.studyMetadata.introduction}
              backgroundAuthor={data.form.studyMetadata.backgroundAuthor}
              backgroundBook={data.form.studyMetadata.backgroundBook}
              backgroundContext={data.form.studyMetadata.backgroundContext}
              wordStudies={data.form.wordStudies}
              errors={errors}
              updateNested={actions.updateNested}
              addWordStudy={actions.addWordStudy}
              removeWordStudy={actions.removeWordStudy}
              updateWordStudy={actions.updateWordStudy}
              updateField={actions.updateField}
            />
            <AddExplanationPracticalApplications
              rows={data.form.practicalApps}
              errors={errors.practicalApps}
              sectionError={errors.practicalAppsCount}
              onChange={actions.updatePracticalApp}
              onAdd={actions.addPracticalApp}
              onRemove={actions.removePracticalApp}
            />
          </TabsContent>
          <TabsContent value="insights">
            <AddExplanationExtrasForm
              showErrors={!data.isEditMode || data.richContentTouched}
              revealRowErrors={feedback.attempted(scope)}
              errors={errors}
              bibleVersion={data.form.bibleVersion}
              onCrossReferencesChange={rows => actions.updateField('crossReferences', rows)}
              crossReferences={data.form.crossReferences}
              themes={data.form.themes}
              takeaways={data.form.studyMetadata.takeaways}
              finalThoughts={data.form.studyMetadata.finalThoughts}
              addTheme={actions.addTheme}
              removeTheme={actions.removeTheme}
              updateTheme={actions.updateTheme}
              updateTakeaways={(takeaways) => actions.updateNested("studyMetadata", "takeaways", takeaways)}
              updateFinalThoughts={(value) => actions.updateNested("studyMetadata", "finalThoughts", value)}
            />
          </TabsContent>
        </Tabs>
        <AddExplanationFooterActions
          isValid={data.isValid}
          saving={data.saving}
          isEditMode={data.isEditMode}
          handleSave={save}
          currentStepIndex={data.currentStepIndex}
          stepCount={VERSE_EXPLANATION_STEP_ORDER.length}
          onBack={actions.goPrevious}
          onNext={next}
        />
      </div>
    </div>
  );
}

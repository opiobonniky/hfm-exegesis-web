import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VERSE_EXPLANATION_STEP_ORDER } from "../constants";
import type { AddExplanationPageActions, AddExplanationPageData } from "../hooks/useAddExplanation";
import { AddExplanationSidebar } from "./AddExplanationSidebar";
import { AddExplanationReferenceForm } from "./AddExplanationReferenceForm";
import { AddExplanationExegesisForm } from "./AddExplanationExegesisForm";
import { AddExplanationStudyForm } from "./AddExplanationStudyForm";
import { AddExplanationExtrasForm } from "./AddExplanationExtrasForm";
import { AddExplanationFooterActions } from "./AddExplanationFooterActions";
import type { AddExplanationWorkspaceProps } from "../types";

export function AddExplanationWorkspace({
  data,
  actions,
}: AddExplanationWorkspaceProps & {
  data: AddExplanationPageData;
  actions: AddExplanationPageActions;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
      <AddExplanationSidebar
        currentStep={data.currentStep}
        currentStepIndex={data.currentStepIndex}
        stepCompletion={data.stepCompletion}
        referenceComplete={data.referenceComplete}
        exegesisComplete={data.exegesisComplete}
        onStepChange={actions.goToStep}
      />
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <Tabs value={data.activeTab} onValueChange={(value) => actions.setActiveTab(value as typeof data.activeTab)}>
          <TabsList className="hidden" aria-hidden="true">
            <TabsTrigger value="reference">Reference</TabsTrigger>
            <TabsTrigger value="exegesis">Exegesis</TabsTrigger>
            <TabsTrigger value="study">Study</TabsTrigger>
            <TabsTrigger value="extras">Extras</TabsTrigger>
          </TabsList>
          <TabsContent value="reference">
            <AddExplanationReferenceForm
              bookName={data.form.bookName}
              chapter={data.form.chapter}
              verseNumber={data.form.verseNumber}
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
          </TabsContent>
          <TabsContent value="exegesis">
            <AddExplanationExegesisForm
              explanationText={data.form.exegesis.explanationText}
              applicationText={data.form.exegesis.applicationText}
              updateNested={actions.updateNested}
            />
          </TabsContent>
          <TabsContent value="study">
            <AddExplanationStudyForm
              introduction={data.form.studyMetadata.introduction}
              backgroundAuthor={data.form.studyMetadata.backgroundAuthor}
              backgroundBook={data.form.studyMetadata.backgroundBook}
              backgroundContext={data.form.studyMetadata.backgroundContext}
              wordStudies={data.form.wordStudies}
              updateNested={actions.updateNested}
              addWordStudy={actions.addWordStudy}
              removeWordStudy={actions.removeWordStudy}
              updateWordStudy={actions.updateWordStudy}
            />
          </TabsContent>
          <TabsContent value="extras">
            <AddExplanationExtrasForm
              practicalApps={data.form.practicalApps}
              crossReferences={data.form.crossReferences}
              themes={data.form.themes}
              takeaways={data.form.studyMetadata.takeaways}
              finalThoughts={data.form.studyMetadata.finalThoughts}
              crossRefVerseOptions={data.crossRefVerseOptions}
              crossRefVerseLoading={data.crossRefVerseLoading}
              crossReferenceBookOptions={data.crossReferenceBookOptions}
              crossReferenceChapterOptions={data.crossReferenceChapterOptions}
              crossReferenceVerseLoading={data.crossReferenceVerseLoading}
              updatePracticalApp={actions.updatePracticalApp}
              addPracticalApp={actions.addPracticalApp}
              removePracticalApp={actions.removePracticalApp}
              addCrossRef={actions.addCrossRef}
              removeCrossRef={actions.removeCrossRef}
              updateCrossRef={actions.updateCrossRef}
              pickCrossRefVerse={actions.pickCrossRefVerse}
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
          handleSave={actions.handleSave}
          currentStepIndex={data.currentStepIndex}
          stepCount={VERSE_EXPLANATION_STEP_ORDER.length}
          onBack={actions.goPrevious}
          onNext={actions.goNext}
          canAdvance={data.canAdvanceFromCurrent}
        />
      </div>
    </div>
  );
}

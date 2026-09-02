import type { useLabFlowPage } from "../hooks/useLabFlowPage";
import LabPassageSelector from "./LabPassageSelector";
import LabLookStage from "./LabLookStage";
import LabListenStage from "./LabListenStage";
import LabLearnStage from "./LabLearnStage";
import LabAbideStage from "./LabAbideStage";
import LabApplyStage from "./LabApplyStage";
import LabCompletedStage from "./LabCompletedStage";

interface Props {
  h: ReturnType<typeof useLabFlowPage>;
}

export function LabFlowStageContent({ h }: Props) {
  const { data, actions } = h;
  const lab = data.lab;
  const labActions = actions.lab;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
        {lab.error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {lab.error}
          </div>
        )}

        {lab.stage === "passage" && (
          <LabPassageSelector
            bookName={lab.bookName}
            chapter={lab.chapter}
            verseStart={lab.verseStart}
            verseEnd={lab.verseEnd}
            loading={lab.loading}
            previewText={data.previewText}
            previewLoading={data.previewLoading}
            onSelectBook={(book) => labActions.update({ bookName: book, chapter: "", verseStart: "", verseEnd: "" })}
            onSelectChapter={(ch) => labActions.update({ chapter: ch, verseStart: "", verseEnd: "" })}
            onSelectVerseStart={(v) => labActions.update({ verseStart: v })}
            onSelectVerseEnd={(v) => labActions.update({ verseEnd: v })}
            onBeginStudy={labActions.startSession}
          />
        )}

        {lab.stage === "look" && (
          <LabLookStage
            passageRef={lab.passageRef}
            bookName={lab.bookName}
            chapter={lab.chapter}
            passageVerses={data.passageVerses}
            versesLoading={data.versesLoading}
            lookNotes={lab.lookNotes}
            setLookNotes={(v) => labActions.update({ lookNotes: v })}
            saving={lab.saving}
            onAdvance={labActions.advanceLook}
          />
        )}

        {lab.stage === "listen" && (
          <LabListenStage
            passageRef={lab.passageRef}
            bookName={lab.bookName}
            chapter={lab.chapter}
            passageVerses={data.passageVerses}
            selectedRepeats={lab.selectedRepeats}
            setSelectedRepeats={(v) => labActions.update({ selectedRepeats: v })}
            repeatCount={lab.repeatCount}
            listenComplete={lab.listenComplete}
            saving={lab.saving}
            audio={data.audio}
            onStartListening={actions.startListeningWithTTS}
            onAdvance={labActions.advanceListen}
            onReset={() => { data.audio.stopPlayback(); labActions.resetListening(); }}
            onSkip={() => { data.audio.stopPlayback(); labActions.advanceListen(); }}
          />
        )}

        {lab.stage === "learn" && (
          <LabLearnStage
            passageRef={lab.passageRef}
            bookName={lab.bookName}
            chapter={lab.chapter}
            verseStart={lab.verseStart}
            learnNotes={lab.learnNotes}
            setLearnNotes={(v) => labActions.update({ learnNotes: v })}
            learnDataLoading={data.wordsLoading || data.resourcesLoading}
            verseResources={data.verseResources}
            bookPrologue={data.bookPrologue}
            verseWords={data.verseWords}
            translations={data.translations}
            translationsLoading={data.translationsLoading}
            isPublic={lab.isPublic}
            setIsPublic={(v) => labActions.update({ isPublic: v })}
            saving={lab.saving}
            onAdvance={labActions.advanceLearn}
            onWordTap={actions.handleWordTap}
          />
        )}

        {lab.stage === "abide" && (
          <LabAbideStage
            reflection={lab.reflection}
            setReflection={(v) => labActions.update({ reflection: v })}
            prayer={lab.prayer}
            setPrayer={(v) => labActions.update({ prayer: v })}
            appText={lab.appText}
            setAppText={(v) => labActions.update({ appText: v })}
            tags={lab.tags}
            setTags={(v) => labActions.update({ tags: v })}
            isPublic={lab.isPublic}
            setIsPublic={(v) => labActions.update({ isPublic: v })}
            saving={lab.saving}
            onAdvance={labActions.saveAbide}
          />
        )}

        {lab.stage === "apply" && (
          <LabApplyStage
            passageRef={lab.passageRef}
            bookName={lab.bookName}
            chapter={lab.chapter}
            verseStart={lab.verseStart}
            passageVerses={data.passageVerses}
            challengeText={lab.challengeText}
            setChallengeText={(v) => labActions.update({ challengeText: v })}
            resultsText={lab.resultsText}
            setResultsText={(v) => labActions.update({ resultsText: v })}
            saving={lab.saving}
            onComplete={labActions.saveApply}
            onOpenBibleReader={() => actions.openBibleReader(lab.bookName, lab.chapter)}
          />
        )}

        {lab.stage === "completed" && (
          <LabCompletedStage
            passageRef={lab.passageRef}
            onReset={labActions.resetAll}
            journalEntryId={lab.journalEntryId}
          />
        )}
      </div>
    </div>
  );
}

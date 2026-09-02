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

export default function LabFlowStageContent({ h }: Props) {
  const { lab } = h;

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
            previewText={h.previewText}
            previewLoading={h.previewLoading}
            onSelectBook={(book) => lab.update({ bookName: book, chapter: "", verseStart: "", verseEnd: "" })}
            onSelectChapter={(ch) => lab.update({ chapter: ch, verseStart: "", verseEnd: "" })}
            onSelectVerseStart={(v) => lab.update({ verseStart: v })}
            onSelectVerseEnd={(v) => lab.update({ verseEnd: v })}
            onBeginStudy={lab.startSession}
          />
        )}

        {lab.stage === "look" && (
          <LabLookStage
            passageRef={lab.passageRef}
            bookName={lab.bookName}
            chapter={lab.chapter}
            passageVerses={h.passageVerses}
            versesLoading={h.versesLoading}
            lookNotes={lab.lookNotes}
            setLookNotes={(v) => lab.update({ lookNotes: v })}
            saving={lab.saving}
            onAdvance={lab.advanceLook}
          />
        )}

        {lab.stage === "listen" && (
          <LabListenStage
            passageRef={lab.passageRef}
            bookName={lab.bookName}
            chapter={lab.chapter}
            passageVerses={h.passageVerses}
            selectedRepeats={lab.selectedRepeats}
            setSelectedRepeats={(v) => lab.update({ selectedRepeats: v })}
            repeatCount={lab.repeatCount}
            listenComplete={lab.listenComplete}
            saving={lab.saving}
            audio={h.audio}
            onStartListening={h.startListeningWithTTS}
            onAdvance={lab.advanceListen}
            onReset={() => { h.audio.stopPlayback(); lab.resetListening(); }}
            onSkip={() => { h.audio.stopPlayback(); lab.advanceListen(); }}
          />
        )}

        {lab.stage === "learn" && (
          <LabLearnStage
            passageRef={lab.passageRef}
            bookName={lab.bookName}
            chapter={lab.chapter}
            verseStart={lab.verseStart}
            learnNotes={lab.learnNotes}
            setLearnNotes={(v) => lab.update({ learnNotes: v })}
            learnDataLoading={h.wordsLoading || h.resourcesLoading}
            verseResources={h.verseResources}
            bookPrologue={h.bookPrologue}
            verseWords={h.verseWords}
            translations={h.translations}
            translationsLoading={h.translationsLoading}
            isPublic={lab.isPublic}
            setIsPublic={(v) => lab.update({ isPublic: v })}
            saving={lab.saving}
            onAdvance={lab.advanceLearn}
            onWordTap={h.handleWordTap}
          />
        )}

        {lab.stage === "abide" && (
          <LabAbideStage
            reflection={lab.reflection}
            setReflection={(v) => lab.update({ reflection: v })}
            prayer={lab.prayer}
            setPrayer={(v) => lab.update({ prayer: v })}
            appText={lab.appText}
            setAppText={(v) => lab.update({ appText: v })}
            tags={lab.tags}
            setTags={(v) => lab.update({ tags: v })}
            isPublic={lab.isPublic}
            setIsPublic={(v) => lab.update({ isPublic: v })}
            saving={lab.saving}
            onAdvance={lab.saveAbide}
          />
        )}

        {lab.stage === "apply" && (
          <LabApplyStage
            passageRef={lab.passageRef}
            bookName={lab.bookName}
            chapter={lab.chapter}
            verseStart={lab.verseStart}
            passageVerses={h.passageVerses}
            challengeText={lab.challengeText}
            setChallengeText={(v) => lab.update({ challengeText: v })}
            resultsText={lab.resultsText}
            setResultsText={(v) => lab.update({ resultsText: v })}
            saving={lab.saving}
            onComplete={lab.saveApply}
            onOpenBibleReader={() => h.openBibleReader(lab.bookName, lab.chapter)}
          />
        )}

        {lab.stage === "completed" && (
          <LabCompletedStage
            passageRef={lab.passageRef}
            onReset={lab.resetAll}
            journalEntryId={lab.journalEntryId}
          />
        )}
      </div>
    </div>
  );
}

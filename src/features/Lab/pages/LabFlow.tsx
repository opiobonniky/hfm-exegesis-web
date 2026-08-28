/**
 * LabFlow — composable page for the 5-stage Bible study flow.
 * Uses useLabFlowPage which wraps useLabFlow + data fetching.
 */
import { useNavigate } from "react-router-dom";
import Gate from "@/components/Gate";
import { useRTL } from "@/providers/RTLProvider";
import { useLabFlowPage } from "../hooks/useLabFlowPage";

import LabFlowHeader from "../components/LabFlowHeader";
import LabPassageSelector from "../components/LabPassageSelector";
import LabLookStage from "../components/LabLookStage";
import LabListenStage from "../components/LabListenStage";
import LabLearnStage from "../components/LabLearnStage";
import LabAbideStage from "../components/LabAbideStage";
import LabApplyStage from "../components/LabApplyStage";
import LabCompletedStage from "../components/LabCompletedStage";

export default function LabFlow() {
  const { isRtl } = useRTL();
  const navigate = useNavigate();
  const h = useLabFlowPage();
  const { lab } = h;

  const handleBack = () => {
    if (lab.stage === "passage" || lab.completed) {
      navigate("/lab");
    } else {
      lab.saveCurrentProgress();
      navigate("/lab");
    }
  };

  if (lab.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading study session...</p>
        </div>
      </div>
    );
  }

  return (
    <Gate featureName="Exegesis Lab" featureDescription="The full 5-stage Scripture study journey is available for Legacy Sower and Covenant Sower subscribers.">
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex flex-col bg-background">
        <LabFlowHeader
          passageRef={lab.passageRef}
          stage={lab.stage}
          saving={lab.saving}
          completed={lab.completed}
          onBack={handleBack}
          onSave={() => lab.saveCurrentProgress()}
          onGoToStage={lab.goToStage}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">

            {/* Error banner */}
            {lab.error && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {lab.error}
              </div>
            )}

            {/* Stage: Passage selector */}
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

            {/* Stage: Look */}
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

            {/* Stage: Listen */}
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
                onStart={() => { lab.startListening(); /* TTS would go here */ lab.incrementRepeat(); }}
                onAdvance={lab.advanceListen}
                onReset={lab.resetListening}
                onSkip={lab.advanceListen}
              />
            )}

            {/* Stage: Learn */}
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

            {/* Stage: Abide */}
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

            {/* Stage: Apply */}
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
                onOpenBibleReader={() => navigate(`/bible-reader?book=${lab.bookName}&chapter=${lab.chapter}`)}
              />
            )}

            {/* Stage: Completed */}
            {lab.stage === "completed" && (
              <LabCompletedStage
                passageRef={lab.passageRef}
                onReset={lab.resetAll}
                journalEntryId={lab.journalEntryId}
              />
            )}

          </div>
        </div>
      </div>
    </Gate>
  );
}

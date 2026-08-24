 * LabFlow — thin page composing extracted components.
 * Zero raw HTML tags — all UI in extracted components.
 */
import { Loader2, Sparkles, Timer } from "lucide-react";
import Gate from "@/components/Gate";
import { useLabFlow, STAGE_ORDER } from "@/hooks/useLabFlow";
import { useLabFlowPage } from "../hooks/useLabFlowPage";
import { MAX_CHAPTERS, STAGE_PURPOSE, STAGE_TIME } from "../constants";
import LabFlowHeader from "../components/LabFlowHeader";
import LabFlowStageProgress from "../components/LabFlowStageProgress";
import LabFlowPassageSelector from "../components/LabFlowPassageSelector";
import LabFlowCompletedStage from "../components/LabFlowCompletedStage";
import LabFlowShortcuts, { LabFlowShortcutHint, LabFlowShortcutToggle } from "../components/LabFlowShortcuts";
import LookStage from "./LookStage";
import ListenStage from "./ListenStage";
import LearnStage from "./LearnStage";
import AbideStage from "./AbideStage";
import WordDetailSheet from "@/components/WordDetailSheet";
import { STAGE_ORDER as ORDER, LISTEN_OPTIONS, LOOK_PROMPTS } from "@/hooks/useLabFlow";

export default function LabFlow() {
  const p = useLabFlowPage();
  const { lab } = p;
  const isRtl = lab.isRtl || false;
  const maxChapters = MAX_CHAPTERS[lab.bookName] || 50;
  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <LabFlowHeader stage={lab.stage || "passage"} onBack={() => { if (lab.stage !== "passage" && lab.completed !== undefined) lab.saveCurrentProgress(true); p.navigate(-1); }} />
      {lab.stage !== "passage" && lab.stage !== "completed" && (
        <LabFlowStageProgress currentStage={lab.stage || "passage"} onGoToStage={(s) => lab.goToStage(s)} />
      )}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
          {lab.loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              <p className="text-sm font-semibold text-muted-foreground">Loading...</p>
            </div>
          ) : lab.stage === "passage" ? (
            <LabFlowPassageSelector bookName={lab.bookName} chapter={String(lab.chapter)} verseStart={String(lab.verseStart)} verseEnd={String(lab.verseEnd || "")} previewText={p.previewText} previewLoading={p.previewLoading} maxChapters={maxChapters} bookNames={lab.BOOK_NAMES} onStart={() => lab.startStudy()} onUpdate={(data) => lab.update(data)} />
          ) : (
            <Gate featureName="Exegesis Lab" featureDescription="The full 4-stage Scripture study journey is available for Sower subscribers.">
              {/* Why This Stage teaching card */}
              {lab.stage && lab.stage !== "completed" && (
                <div className="rounded-xl bg-gradient-to-br from-primary/[0.03] to-primary/[0.01] border border-primary/10 p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><Sparkles className="w-3 h-3 text-primary" /></div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-0.5">Why This Stage Matters</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{STAGE_PURPOSE[lab.stage]}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border/30 shrink-0">
                      <Timer className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-[9px] font-bold text-muted-foreground/70">{STAGE_TIME[lab.stage]}</span>
                  </div>
                </div>
              )}
              {lab.stage === "look" && <LookStage lookNotes={lab.lookNotes} currentPromptIdx={lab.currentPromptIdx} passageRef={lab.passageRef} passageVerses={p.passageVerses} versesLoading={p.versesLoading} verseWords={p.verseWords} wordsLoading={p.wordsLoading} onWordTap={p.handleWordTap} saving={lab.saving} onUpdate={lab.update} onAdvance={lab.advanceLook} onSaveProgress={() => lab.saveCurrentProgress()} stageLabel="Look" lookPrompts={LOOK_PROMPTS} />}
              {lab.stage === "listen" && <ListenStage selectedRepeats={lab.selectedRepeats} repeatCount={lab.repeatCount} listenComplete={lab.listenComplete} passageRef={lab.passageRef} bookName={lab.bookName} chapter={lab.chapter} verseStart={lab.verseStart} verseEnd={lab.verseEnd} passageVerses={p.passageVerses.map((v) => ({ text: v.text }))} onUpdate={lab.update} onStartListening={lab.startListening} onResetListening={lab.resetListening} onAdvance={lab.advanceListen} onIncrementRepeat={lab.incrementRepeat} stageLabel="Listen" listenOptions={LISTEN_OPTIONS} />}
              {lab.stage === "learn" && <LearnStage learnNotes={lab.learnNotes} bookName={lab.bookName} chapter={lab.chapter} verseStart={lab.verseStart} passageRef={lab.passageRef} saving={lab.saving} verseWords={p.verseWords} wordsLoading={p.wordsLoading} bookPrologue={p.bookPrologue} prologueLoading={p.prologueLoading} verseResources={p.verseResources} resourcesLoading={p.resourcesLoading} translations={p.translations} translationsLoading={p.translationsLoading} translationsError={p.translationsError} isPublic={lab.isPublic} onUpdate={lab.update} onAdvance={lab.advanceLearn} onSaveProgress={() => lab.saveCurrentProgress()} onWordTap={p.handleWordTap} stageLabel="Learn" />}
              {lab.stage === "abide" && <AbideStage reflection={lab.reflection} prayer={lab.prayer} appText={lab.appText} tags={lab.tags} isPublic={lab.isPublic} passageRef={lab.passageRef} saving={lab.saving} onUpdate={lab.update} onSaveAbide={lab.saveAbide} onSaveProgress={() => lab.saveCurrentProgress()} stageLabel="Abide" />}
              {lab.stage === "completed" && <LabFlowCompletedStage passageRef={lab.passageRef} onCopy={p.handleCopy} onShare={p.handleShare} onReset={lab.reset} copied={p.copied} sharing={p.sharing} />}
            </Gate>
          )}
        </div>
      </div>
      <WordDetailSheet open={p.wordModalOpen} onOpenChange={p.setWordModalOpen} strongsId={p.selectedWord?.strongsId || null} wordEntry={p.selectedWord as any || null} verseRef={lab.passageRef || (lab.bookName && lab.verseStart ? `${lab.bookName} ${lab.chapter}:${lab.verseStart}` : undefined)} translationBadge="BSB" />
      <LabFlowShortcutHint text={p.shortcutHint} />
      <LabFlowShortcutToggle onClick={() => p.setShowShortcuts((prev: boolean) => !prev)} />
      <LabFlowShortcuts open={p.showShortcuts} onClose={() => p.setShowShortcuts(false)} stage={lab.stage || "passage"} saving={lab.saving} />
    </div>
  );
}

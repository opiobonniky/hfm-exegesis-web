/**
 * LabFlow — thin page composing extracted components.
 * Zero raw HTML tags — all UI in extracted components.
 */
import { Loader2, Sparkles, Timer } from "lucide-react";
import Gate from "@/components/Gate";
import { useLabFlowPage } from "../hooks/useLabFlowPage";
import { useRTL } from "@/providers/RTLProvider";
import {
  LabFlowLoadingState,
  LabFlowHero,
  LabFlowStageBar,
  LabFlowLookSection,
  LabFlowListenSection,
  LabFlowLearnSection,
  LabFlowAbideSection,
  LabFlowActions,
} from "../components";

export default function LabFlow() {
  const { isRtl } = useRTL();
  const h = useLabFlowPage();

  if (h.loading) return <LabFlowLoadingState />;

  return (
    <Gate >
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex flex-col bg-background">
        <LabFlowHero
          passageRef={h.session?.passageRef}
          onBack={() => h.navigate(-1)}
          onReview={h.goToReview}
        />

        <LabFlowStageBar
          activeStage={h.activeStage}
          stages={h.stages}
          stageContent={h.stageContent}
          onStageChange={h.setActiveStage}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
            {h.activeStage === "look" && (
              <LabFlowLookSection
                prompts={h.lookPrompts}
                notes={h.lookNotes}
                onNotesChange={h.setLookNotes}
                promptResponses={h.lookPromptResponses}
                onPromptResponseChange={h.setLookPromptResponse}
              />
            )}

            {h.activeStage === "listen" && (
              <LabFlowListenSection
                audioUrl={h.audioUrl}
                elapsed={h.listenElapsed}
                duration={h.listenDuration}
                completed={h.listenCompleted}
                onToggleComplete={() => h.setListenCompleted(!h.listenCompleted)}
                onTimerTick={h.handleTimerTick}
              />
            )}

            {h.activeStage === "learn" && (
              <LabFlowLearnSection
                notes={h.learnNotes}
                onNotesChange={h.setLearnNotes}
                selectedWords={h.selectedWords}
                onWordToggle={h.handleWordToggle}
                strongsWords={h.strongsWords}
              />
            )}

            {h.activeStage === "abide" && (
              <LabFlowAbideSection
                reflection={h.abideReflection}
                onReflectionChange={h.setAbideReflection}
                prayer={h.abidePrayer}
                onPrayerChange={h.setAbidePrayer}
                application={h.abideApplication}
                onApplicationChange={h.setAbideApplication}
                tags={h.tags}
                onTagAdd={h.addTag}
                onTagRemove={h.removeTag}
                tagSuggestions={h.tagSuggestions}
              />
            )}

            <LabFlowActions
              saving={h.saving}
              canComplete={h.canComplete}
              onSave={h.handleSave}
              onComplete={h.handleComplete}
              onReview={h.goToReview}
            />
          </div>
        </div>
      </div>
    </Gate>
  );
}

 * TriviaPage — thin page composing extracted components.
 * Zero raw HTML tags — all UI in extracted components.
 */
import { useTriviaPage } from "../hooks/useTriviaPage";
import StarBurst from "@/components/trivia/StarBurst";
import SanctuarySeal, { MILESTONE_THRESHOLDS } from "@/components/trivia/SanctuarySeal";
import BadgeUnlockPanel from "@/components/trivia/BadgeUnlockPanel";
import TriviaPageHeader from "../components/TriviaPageHeader";
import TriviaPlanScreen from "../components/TriviaPlanScreen";
import TriviaGameScreen from "../components/TriviaGameScreen";
import DailyChallengeGame from "../components/DailyChallengeGame";

export default function TriviaPage() {
  const p = useTriviaPage();
  return (
    <>
      <BadgeUnlockPanel badges={p.justUnlocked} onClose={p.clearUnlocked} />
      <div className="min-h-screen flex flex-col bg-background" dir={p.isRtl ? "rtl" : "ltr"}>
        {/* Subtle dot texture */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <TriviaPageHeader onBack={() => p.navigate(-1)} difficulty={p.difficulty} score={p.score} />
        <StarBurst visible={p.showStarBurst} onFinish={() => p.setShowStarBurst(false)} />
        <SanctuarySeal visible={p.showMilestone} total={p.score.total} correct={p.score.correct} percentage={p.score.total > 0 ? Math.round((p.score.correct / p.score.total) * 100) : 0} onFinish={() => p.setShowMilestone(false)} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 pb-20">
            {/* Daily Challenge mode */}
            {p.gameMode === "daily" && (
              <DailyChallengeGame session={p.dcSession} isRtl={p.isRtl} consecutiveDays={p.consecutiveDays} todayKey={p.todayKey} onSelect={p.handleSelectDaily} onDismiss={p.handleDismissDaily} onBack={p.handleDailyBackToPlan} onStart={p.startDailyChallenge} onReferencePress={p.handleReferencePress} />
            )}
            {/* Normal mode: Plan screen */}
            {p.gameMode !== "daily" && p.phase === "plan" && (
              <TriviaPlanScreen difficulty={p.difficulty} setDifficulty={p.setDifficulty} stats={p.stats} isTodayCompleted={p.isTodayCompleted} consecutiveDays={p.consecutiveDays} todayKey={p.todayKey} weekHistory={p.weekHistory} startDailyChallenge={p.startDailyChallenge} startQuiz={p.startQuiz} leaderboardState={p.leaderboardState} leaderboardComparison={p.leaderboardComparison} resetLeaderboard={p.resetLeaderboard} isRtl={p.isRtl} />
            {/* Normal mode: Game screen */}
            {p.gameMode !== "daily" && p.phase !== "plan" && (
              <TriviaGameScreen phase={p.phase} question={p.question} selectedAnswer={p.selectedAnswer} result={p.result} score={p.score} streak={p.streak} difficulty={p.difficulty} totalCount={p.totalCount} loading={p.loading} error={p.error} resultDismissed={p.resultDismissed} autoAdvanceProgress={p.autoAdvanceProgress} isRtl={p.isRtl} onSelect={p.handleSelect} onDismiss={p.handleDismissWithCancel} onNext={p.nextQuestion} onReset={p.reset} onSetDifficulty={p.setDifficulty} onReferencePress={p.handleReferencePress} leaderboardComparison={p.leaderboardComparison} leaderboardState={p.leaderboardState} stats={p.stats} />
          </div>
        </div>
      </div>
    </>
  );
}

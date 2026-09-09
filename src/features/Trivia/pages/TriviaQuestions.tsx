import StarBurst from "@/components/trivia/StarBurst";
import SanctuarySeal from "@/components/trivia/SanctuarySeal";
import DailyChallengeGame from "../components/DailyChallengeGame";
import TriviaGameScreen from "../components/TriviaGameScreen";
import TriviaQuestionsHeader from "../components/TriviaQuestionsHeader";
import { TriviaContentWrapper, TriviaDotTexture, TriviaPageLayout } from "../components";
import { useTriviaQuestions } from "../hooks/useTriviaQuestions";

export default function TriviaQuestions() {
  const { data, actions } = useTriviaQuestions();

  return (
    <TriviaPageLayout
      isRtl={data.isRtl}
      dotTexture={<TriviaDotTexture primaryColor="hsl(var(--primary))" backgroundSize="32px 32px" />}
    >
      <TriviaQuestionsHeader
        questionNumber={data.score.total + (data.phase === "playing" ? 1 : 0)}
        difficulty={data.difficulty}
        onExit={actions.exitQuiz}
      />
      <StarBurst visible={data.showStarBurst} onFinish={() => actions.setShowStarBurst(false)} />
      <SanctuarySeal
        visible={data.showMilestone}
        total={data.score.total}
        correct={data.score.correct}
        percentage={data.score.total > 0 ? Math.round((data.score.correct / data.score.total) * 100) : 0}
        onFinish={() => actions.setShowMilestone(false)}
      />
      <TriviaContentWrapper>
        {data.gameMode === "daily" ? (
          <DailyChallengeGame
            session={data.dcSession}
            isRtl={data.isRtl}
            consecutiveDays={data.consecutiveDays}
            todayKey={data.todayKey}
            onSelect={actions.handleSelectDaily}
            onDismiss={actions.handleDismissDaily}
            onBack={actions.exitDailyChallenge}
            onStart={actions.startDailyChallenge}
            onReferencePress={actions.handleReferencePress}
          />
        ) : (
          <TriviaGameScreen
            phase={data.phase}
            question={data.question}
            selectedAnswer={data.selectedAnswer}
            result={data.result}
            score={data.score}
            streak={data.streak}
            difficulty={data.difficulty}
            totalCount={data.totalCount}
            loading={data.loading}
            error={data.error}
            resultDismissed={data.resultDismissed}
            autoAdvanceProgress={data.autoAdvanceProgress}
            isRtl={data.isRtl}
            onSelect={actions.handleSelect}
            onDismiss={actions.handleDismissWithCancel}
            onNext={actions.nextQuestion}
            onReset={actions.reset}
            onSetDifficulty={actions.setDifficulty}
            onReferencePress={actions.handleReferencePress}
            leaderboardComparison={data.leaderboardComparison}
            leaderboardState={data.leaderboardState}
            stats={data.stats}
          />
        )}
      </TriviaContentWrapper>
    </TriviaPageLayout>
  );
}

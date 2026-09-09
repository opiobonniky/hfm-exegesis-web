import { useTriviaHome } from "../hooks/useTriviaHome";
import TriviaPlanScreen from "../components/TriviaPlanScreen";
import TriviaHomeActions from "../components/TriviaHomeActions";
import TriviaHomeHero from "../components/TriviaHomeHero";

export default function TriviaHome() {
  const { data, actions } = useTriviaHome();
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 pb-4 sm:space-y-10 sm:px-6 lg:px-8">
      <TriviaHomeHero answeredCount={data.stats?.totalAnswered ?? 0} />
      <TriviaHomeActions
        onStartQuiz={actions.startQuiz}
        onOpenPerformance={actions.openPerformance}
      />
      <TriviaPlanScreen
        difficulty={data.difficulty}
        setDifficulty={actions.setDifficulty}
        stats={data.stats}
        isTodayCompleted={data.isTodayCompleted}
        consecutiveDays={data.consecutiveDays}
        todayKey={data.todayKey}
        weekHistory={data.weekHistory}
        leaderboardState={data.leaderboardState}
        leaderboardComparison={data.leaderboardComparison}
        resetLeaderboard={actions.resetLeaderboard}
        isRtl={data.isRtl}
        startQuiz={actions.startQuiz}
        startDailyChallenge={actions.startDailyChallenge}
      />
    </div>
  );
}

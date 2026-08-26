import { Play, BookOpen, Trophy, Target, Sun } from "lucide-react";
import { DIFFICULTY_OPTIONS } from "../constants";
import StreakCalendar from "@/components/trivia/StreakCalendar";
import SessionLeaderboard from "@/components/trivia/SessionLeaderboard";
import type { DifficultyFilter } from "@/hooks/useTrivia";

interface Props {
  difficulty: DifficultyFilter;
  setDifficulty: (d: DifficultyFilter) => void;
  stats: { totalAnswered: number; correct: number } | null;
  isTodayCompleted: boolean;
  consecutiveDays: number;
  todayKey: string;
  weekHistory: unknown[];
  startDailyChallenge: () => void;
  startQuiz: () => void;
  leaderboardState: { bestSession: { total: number } };
  leaderboardComparison: unknown;
  resetLeaderboard: () => void;
  isRtl: boolean;
}

export default function TriviaPlanScreen({
  difficulty, setDifficulty, stats, isTodayCompleted, consecutiveDays,
  todayKey, weekHistory, startDailyChallenge, startQuiz,
  leaderboardState, leaderboardComparison, resetLeaderboard,
}: Props) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex items-center gap-3 p-3 bg-background rounded-xl border">
        <BookOpen className="w-10 h-10 text-primary" />
        <div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Cinzel', serif" }}>Bible Trivia</h2>
          <p className="text-sm text-muted-foreground">Test your knowledge of the Scriptures.</p>
        </div>
      </div>

      {stats && stats.totalAnswered > 0 && (
        <div className="rounded-xl border border-primary/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Trophy className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground/80">
                {stats.correct}/{stats.totalAnswered} correct
              </p>
            </div>
            <p className="text-lg font-black text-primary">
              {Math.round((stats.correct / stats.totalAnswered) * 100)}%
            </p>
          </div>
        </div>
      )}

      {leaderboardState.bestSession.total > 0 && leaderboardComparison && (
        <SessionLeaderboard comparison={leaderboardComparison} onReset={resetLeaderboard} />
      )}

      <div className="rounded-xl border border-primary/10 p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary/60">Daily Challenge</p>
          </div>
          {isTodayCompleted ? (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-green-600 bg-green-500/10">
              Done
            </span>
          ) : (
            <button onClick={startDailyChallenge} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white">
              <Sun className="w-3 h-3" /> Start
            </button>
          )}
        </div>
        <StreakCalendar weekHistory={weekHistory} todayKey={todayKey} isTodayCompleted={isTodayCompleted} consecutiveDays={consecutiveDays} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3 h-3 text-primary/50" />
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70">Choose your path</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            const isSelected = difficulty === opt.value;
            return (
              <button key={opt.value ?? "all"} onClick={() => setDifficulty(opt.value)} className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all">
                <IconComp className="w-3.5 h-3.5" style={{ color: opt.color }} />
                <span className="text-[10px] font-extrabold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={startQuiz} className="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-card overflow-hidden tracking-wider uppercase bg-gradient-to-br from-primary to-primary/80">
        <Play className="w-[16px] h-[16px] fill-current" />
        Begin Quest
      </button>
      <p className="text-[10px] sm:text-[11px] text-center leading-5 px-4 sm:px-8 pb-2 text-muted-foreground/40">
        Questions are drawn from across the Bible. Tap a scripture reference to read the passage before answering.
      </p>
    </div>
  );
}

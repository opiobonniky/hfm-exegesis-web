import { Play, BookOpen, Trophy, Target, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_OPTIONS, ACCENT } from "../constants";
import StreakCalendar from "@/components/trivia/StreakCalendar";
import SessionLeaderboard from "@/components/trivia/SessionLeaderboard";
import type { DifficultyFilter } from "@/hooks/useTrivia";
import type { BADGE_DEFINITIONS } from "@/hooks/useBadges";

interface Props {
  difficulty: DifficultyFilter;
  setDifficulty: (d: DifficultyFilter) => void;
  stats: any;
  isTodayCompleted: boolean;
  consecutiveDays: number;
  todayKey: string;
  weekHistory: any[];
  startDailyChallenge: () => void;
  startQuiz: () => void;
  leaderboardState: any;
  leaderboardComparison: any;
  resetLeaderboard: () => void;
  isRtl: boolean;
}
export default function TriviaPlanScreen({
  difficulty, setDifficulty, stats, isTodayCompleted, consecutiveDays,
  todayKey, weekHistory, startDailyChallenge, startQuiz,
  leaderboardState, leaderboardComparison, resetLeaderboard, isRtl,
}: Props) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Hero */}
      <div className="flex items-center gap-3 p-3 bg-background rounded-xl border">
        <BookOpen className="w-10 h-10 text-primary" />
        <div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Cinzel', serif" }}>Bible Trivia</h2>
          <p className="text-sm text-muted-foreground">Test your knowledge of the Scriptures.</p>
        </div>
      </div>
      {/* Stats */}
      {stats && stats.totalAnswered > 0 && (
        <div className="rounded-xl border border-primary/10 p-3" style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.04), hsl(var(--primary)/0.01))" }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "hsl(var(--primary)/0.1)" }}>
                <Trophy className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary/60 leading-none mb-0.5">Your Record</p>
                <p className="text-xs font-semibold text-muted-foreground/80 truncate">{stats.correct}<span className="text-muted-foreground/40">/</span>{stats.totalAnswered} correct</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-px h-6" style={{ backgroundColor: "hsl(var(--primary)/0.1)" }} />
              <div className="text-right">
                <p className="text-lg font-black text-primary leading-none">
                  {stats.totalAnswered > 0 ? Math.round((stats.correct / stats.totalAnswered) * 100) : 0}
                  <span className="text-[8px] font-bold text-primary/50 ml-0.5">%</span>
                </p>
                <p className="text-[7px] font-bold text-primary/40 uppercase tracking-[0.2em] leading-none mt-0.5">acc</p>
          </div>
      )}
      {/* Leaderboard */}
      {leaderboardState.bestSession.total > 0 && leaderboardComparison && (
        <SessionLeaderboard comparison={leaderboardComparison} onReset={resetLeaderboard} />
      {/* Daily Challenge */}
      <div className="rounded-xl border border-primary/10 p-3">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(251,191,36,0.12)" }}>
              <Sun className="w-3.5 h-3.5" style={{ color: "#F59E0B" }} />
            <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary/60 leading-none">Daily Challenge</p>
          {isTodayCompleted ? (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-block" style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.25)" }}>
              Done
            </span>
          ) : (
            <button onClick={startDailyChallenge} className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.97] whitespace-nowrap" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#FFF", boxShadow: "0 2px 8px rgba(251,191,36,0.3)" }}>
              <Sun className="w-3 h-3" /> Start
            </button>
          )}
        <StreakCalendar weekHistory={weekHistory} todayKey={todayKey} isTodayCompleted={isTodayCompleted} consecutiveDays={consecutiveDays} />
      {/* Difficulty selection */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3 h-3 text-primary/50" />
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/70" style={{ fontFamily: "'Cinzel', serif" }}>Choose your path</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const IconComp = opt.icon;
            const isSelected = difficulty === opt.value;
            return (
              <button key={opt.value ?? "all"} onClick={() => setDifficulty(opt.value)} className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all active:scale-[0.97]" style={{ borderColor: isSelected ? opt.color : "hsl(var(--foreground)/0.06)", backgroundColor: isSelected ? `${opt.color}15` : "hsl(var(--foreground)/0.02)", boxShadow: isSelected ? `0 0 12px ${opt.color}12` : "none" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isSelected ? opt.color : `${opt.color}12` }}>
                  <IconComp className="w-3.5 h-3.5" style={{ color: isSelected ? "#0f0f2e" : opt.color }} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-extrabold leading-tight" style={{ color: isSelected ? opt.color : "hsl(var(--foreground))" }}>{opt.label}</p>
                  <p className="text-[8px] font-semibold text-muted-foreground/50 leading-tight truncate">{opt.desc}</p>
              </button>
            );
          })}
      {/* Start Quiz */}
      <button onClick={startQuiz} className="relative w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold text-card transition-all hover:brightness-110 active:scale-[0.98] overflow-hidden tracking-wider uppercase bg-gradient-to-br from-primary to-primary/80" style={{ boxShadow: "0 0 30px hsl(var(--primary)/0.3), 0 4px 20px hsl(var(--primary)/0.2)" }}>
        <Play className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] fill-current" />
        Begin Quest
      </button>
      <p className="text-[10px] sm:text-[11px] text-center leading-5 px-4 sm:px-8 pb-2 text-muted-foreground/40">
        Questions are drawn from across the Bible. Tap a scripture reference to read the passage before answering.
      </p>
    </div>
  );

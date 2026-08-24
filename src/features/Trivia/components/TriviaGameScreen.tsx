import { Play, RotateCcw, PartyPopper, BookOpen, Target, XCircle, Star, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StainedGlassQuestion from "@/components/trivia/StainedGlassQuestion";
import GlassResult from "@/components/trivia/GlassResult";
import AnimatedNumber from "@/components/trivia/AnimatedNumber";
import SessionLeaderboard from "@/components/trivia/SessionLeaderboard";
import type { DifficultyFilter } from "@/hooks/useTrivia";

interface Props {
  phase: string;
  question: any;
  selectedAnswer: number | null;
  result: any;
  score: { correct: number; total: number };
  streak: number;
  difficulty: DifficultyFilter;
  totalCount: number;
  loading: boolean;
  error: string | null;
  resultDismissed: boolean;
  autoAdvanceProgress: number | null;
  isRtl: boolean;
  onSelect: (index: number) => void;
  onDismiss: () => void;
  onNext: () => void;
  onReset: () => void;
  onSetDifficulty: (d: DifficultyFilter) => void;
  onReferencePress: (book: string, chapter: number, verse?: number | null) => void;
  leaderboardComparison: any;
  leaderboardState: any;
  stats: any;
}
export default function TriviaGameScreen({
  phase, question, selectedAnswer, result, score, streak, difficulty,
  totalCount, loading, error, resultDismissed, autoAdvanceProgress, isRtl,
  onSelect, onDismiss, onNext, onReset, onSetDifficulty, onReferencePress,
  leaderboardComparison, leaderboardState, stats,
}: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Difficulty filter chips */}
      <div className="p-2 rounded-xl mb-4" style={{ background: "hsl(var(--foreground)/0.02)", border: "1px solid hsl(var(--foreground)/0.06)" }}>
        <p className="px-3 pt-1 pb-2 text-[9px] font-extrabold uppercase tracking-[0.15em] text-primary/50">Difficulty</p>
        <div className={cn("flex items-center gap-1.5", isRtl && "flex-row-reverse")}>
          {(["all", "easy", "medium", "hard"] as const).map((d) => {
            const isActive = d === "all" ? difficulty === null : difficulty === d;
            const chipColor = d === "easy" ? "#22C55E" : d === "hard" ? "#EF4444" : d === "medium" ? "#3B82F6" : "hsl(var(--primary))";
            return (
              <button key={d} onClick={() => onSetDifficulty(d === "all" ? null : d)} className="flex-1 min-h-[40px] py-2 rounded-xl text-[10px] font-extrabold text-center transition-all border active:scale-[0.97] uppercase tracking-wider" style={{ backgroundColor: isActive ? `${chipColor}18` : "hsl(var(--foreground)/0.03)", borderColor: isActive ? `${chipColor}40` : "hsl(var(--foreground)/0.06)", color: isActive ? chipColor : "hsl(var(--muted-foreground)/0.5)", boxShadow: isActive ? `0 0 15px ${chipColor}15` : "none" }}>
                {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className={cn("flex items-center justify-between mb-1.5", isRtl && "flex-row-reverse")}>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-muted-foreground/70">Question {score.total + 1} of {totalCount}</p>
              <span className="w-1 h-1 rounded-full bg-primary/30" />
              <p className="text-[10px] font-medium text-muted-foreground/50">{difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "All"}</p>
            </div>
            <p className="text-[10px] font-extrabold text-primary">{Math.round((score.total / totalCount) * 100)}%</p>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--foreground)/0.04)", border: "1px solid hsl(var(--primary)/0.1)" }}>
            <div className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-primary/80" style={{ width: `${(score.total / totalCount) * 100}%`, boxShadow: "0 0 8px hsl(var(--primary)/0.3)" }} />
      )}
      {/* Loading */}
      {loading && !question && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24">
          <div className="w-12 h-12 rounded-full border-4 animate-spin mb-4" style={{ borderColor: "hsl(var(--primary)/0.15)", borderTopColor: "hsl(var(--primary))" }} />
          <p className="text-sm font-semibold text-muted-foreground/60">Loading question...</p>
      {/* Error */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
            <XCircle className="w-6 h-6 text-red-500" />
          <p className="text-sm font-semibold text-center max-w-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={onNext} className="gap-1.5 rounded-xl border-primary/30 text-primary"><RotateCcw className="w-3.5 h-3.5" /> Retry</Button>
      {/* Playing */}
      {phase === "playing" && question && (
        <div>
          <StainedGlassQuestion question={question} selectedAnswer={selectedAnswer} disabled={false} isRtl={isRtl} onSelect={onSelect} onReferencePress={onReferencePress} />
          <div className="flex items-center justify-center mt-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--foreground)/0.03)", border: "1px solid hsl(var(--foreground)/0.06)" }}>
              <Target className="w-3 h-3 text-primary/40" />
              <p className="text-[9px] font-semibold text-muted-foreground/50">Tap an option to answer</p>
      {/* Answered */}
      {phase === "answered" && question && result && (
          <div className="mb-2">
            <StainedGlassQuestion question={question} selectedAnswer={selectedAnswer} disabled={true} isRtl={isRtl} correctAnswerIndex={result?.correctAnswer} onSelect={() => {}} onReferencePress={onReferencePress} />
          {/* Streak indicator */}
          {streak >= 2 && (
            <div className={cn("flex items-center justify-center gap-1.5 mb-3 py-2 px-4 rounded-xl self-center mx-auto w-fit border", isRtl && "flex-row-reverse")} style={{ backgroundColor: streak >= 3 ? "hsl(var(--primary)/0.08)" : "hsl(var(--primary)/0.04)", borderColor: streak >= 3 ? "hsl(var(--primary)/0.3)" : "hsl(var(--primary)/0.15)", boxShadow: streak >= 3 ? "0 0 15px hsl(var(--primary)/0.15)" : "none" }}>
              <Star className="w-4 h-4" style={{ color: streak >= 3 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.6)" }} fill={streak >= 3 ? "hsl(var(--primary))" : "transparent"} />
              <p className="text-xs font-extrabold" style={{ color: streak >= 3 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.7)" }}>{streak} in a row{streak >= 3 ? " \u2726" : ""}</p>
          )}
          {/* Result */}
          <div className="min-h-[160px]">
            {!resultDismissed && <GlassResult result={result} isRtl={isRtl} autoAdvanceProgress={autoAdvanceProgress} onDismiss={onDismiss} />}
            {resultDismissed && (
              <div className="space-y-2">
                {result?.isCorrect && autoAdvanceProgress != null && autoAdvanceProgress >= 100 && (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground/50 animate-pulse">
                    <Timer className="w-3 h-3" /> Advancing to next question...
                  </div>
                )}
                <button onClick={onNext} className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-extrabold text-card transition-all hover:brightness-110 active:scale-[0.98] overflow-hidden relative uppercase tracking-wider bg-gradient-to-br from-primary to-primary/80" style={{ boxShadow: "0 0 20px hsl(var(--primary)/0.3), 0 4px 15px hsl(var(--primary)/0.2)" }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Play className="w-4 h-4 fill-current" /> Next Question
                </button>
              </div>
            )}
      {/* Finished */}
      {phase === "finished" && (
        <div className="flex flex-col items-center pt-6 sm:pt-10 gap-4 sm:gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ backgroundColor: "hsl(var(--primary))" }} />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl bg-gradient-to-br from-primary to-primary/80" style={{ boxShadow: "0 0 30px hsl(var(--primary)/0.3)" }}>
              <PartyPopper className="w-9 h-9 sm:w-11 sm:h-11 text-card" />
          <h2 className="text-xl sm:text-2xl font-black text-center text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>All Questions Completed!</h2>
          <p className="text-sm text-center max-w-sm leading-relaxed text-muted-foreground/70">You've answered every available question. Come back later for more!</p>
          <div className="w-full max-w-xs p-5 sm:p-6 rounded-2xl flex flex-col items-center gap-1 border-primary/15" style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.06), hsl(var(--primary)/0.02))" }}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary/50">Final Score</p>
            <p className="text-2xl sm:text-3xl font-black text-primary inline-flex items-center gap-1">
              <AnimatedNumber value={score.correct} springConfig={{ stiffness: 60, damping: 15 }} />
              <span className="text-primary/40">/</span>
              <AnimatedNumber value={score.total} springConfig={{ stiffness: 60, damping: 15 }} />
            </p>
            <p className="text-xs font-semibold text-muted-foreground/60">{score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</p>
          {leaderboardComparison && leaderboardState.bestSession.total > 0 && (
            <div className="w-full max-w-xs"><SessionLeaderboard comparison={leaderboardComparison} /></div>
          {stats && stats.totalAnswered > score.total && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "hsl(var(--foreground)/0.03)", border: "1px solid hsl(var(--foreground)/0.06)" }}>
              <BookOpen className="w-3.5 h-3.5 text-primary/40" />
              <p className="text-[10px] font-semibold text-muted-foreground/60">Lifetime: {stats.correct}/{stats.totalAnswered} ({stats.percentage}%)</p>
          <button onClick={onReset} className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl text-sm font-bold text-card transition-all hover:brightness-110 active:scale-[0.98] mt-2 overflow-hidden relative uppercase tracking-wider bg-gradient-to-br from-primary to-primary/80" style={{ boxShadow: "0 0 20px hsl(var(--primary)/0.3), 0 4px 15px hsl(var(--primary)/0.2)" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
    </div>
  );

// Daily challenge progress, streak, and weekly history panel
import { Sun, Flame, Trophy } from "lucide-react";
import type { DailyChallengeSession } from "@/hooks/useDailyChallenge";

interface DailyChallengePanelProps {
  session: DailyChallengeSession;
  consecutiveDays: number;
  onDismiss: () => void;
}
export function DailyChallengePanel({ session, consecutiveDays, onDismiss }: DailyChallengePanelProps) {
  const total = session.questions.length;
  const correct = session.answers.filter((a) => a.isCorrect).length;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-foreground">Daily Challenge</h3>
        </div>
        <span className="text-xs text-muted-foreground">{correct}/{total} correct</span>
      </div>
      {/* Streak */}
      {consecutiveDays > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
            {consecutiveDays} day streak!
          </span>
      )}
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round((session.currentIndex / total) * 100)}%</span>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(session.currentIndex / total) * 100}%` }}
          />
      {/* Score */}
      {session.phase === "finished" && (
        <div className="text-center p-4 rounded-xl bg-muted/30">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm font-bold text-foreground">
            {correct}/{total} correct
          </p>
          <button
            onClick={onDismiss}
            className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
          >
            Back to Quiz
          </button>
    </div>
  );

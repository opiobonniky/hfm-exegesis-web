// Quiz completion score card with performance metrics
import { Trophy, RotateCcw, SkipForward } from "lucide-react";

interface QuizScoreCardProps {
  correct: number;
  total: number;
  accuracyPct: number;
  performance: { label: string; emoji: string; color: string; passed: boolean };
  onRetry: () => void;
  onMarkComplete: () => void;
  canMarkComplete: boolean;
}
export function QuizScoreCard({ correct, total, accuracyPct, performance, onRetry, onMarkComplete, canMarkComplete }: QuizScoreCardProps) {
  return (
    <div className="text-center space-y-4 p-6 rounded-2xl bg-card border border-border">
      <div className="text-4xl">{performance.emoji}</div>
      <div>
        <p className="text-lg font-bold" style={{ color: performance.color }}>{performance.label}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {correct}/{total} correct ({accuracyPct}%)
        </p>
      </div>
      {/* Score ring */}
      <div className="flex justify-center">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
            <circle
              cx="40" cy="40" r="35" fill="none" stroke={performance.color} strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 35}`}
              strokeDashoffset={`${2 * Math.PI * 35 * (1 - accuracyPct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-6 h-6" style={{ color: performance.color }} />
          </div>
        </div>
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted/50 transition-all"
        >
          <RotateCcw className="w-3 h-3" /> Retry
        </button>
        {canMarkComplete && (
          <button
            onClick={onMarkComplete}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
          >
            <SkipForward className="w-3 h-3" /> Mark Complete
          </button>
        )}
    </div>
  );

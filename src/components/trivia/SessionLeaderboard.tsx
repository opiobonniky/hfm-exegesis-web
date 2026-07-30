import { cn } from "@/lib/utils";
import {
  Trophy,
  TrendingUp,
  Zap,
  Star,
  RotateCcw,
} from "lucide-react";

interface ComparisonData {
  current: {
    correct: number;
    total: number;
    percentage: number;
    streak: number;
  };
  best: {
    correct: number;
    total: number;
    percentage: number;
    date: string;
  };
  bestStreak: number;
  isNewBest: boolean;
  isNewStreak: boolean;
}

export default function SessionLeaderboard({
  comparison,
  onReset,
}: {
  comparison: ComparisonData;
  onReset?: () => void;
}) {
  const { current, best, bestStreak, isNewBest, isNewStreak } = comparison;

  const stats = [
    {
      label: "Score",
      current: `${current.correct}/${current.total}`,
      best: best.total > 0 ? `${best.correct}/${best.total}` : "—",
      bestPct: best.total > 0 ? `${best.percentage}%` : "",
      isNew: isNewBest,
      icon: Trophy,
      color: "#F59E0B",
    },
    {
      label: "Accuracy",
      current: `${current.percentage}%`,
      best: best.total > 0 ? `${best.percentage}%` : "—",
      isNew: isNewBest,
      icon: TrendingUp,
      color: "#22C55E",
    },
    {
      label: "Streak",
      current: `${current.streak}`,
      best: bestStreak > 0 ? `${bestStreak}` : "—",
      isNew: isNewStreak,
      icon: Zap,
      color: "#6366F1",
    },
  ];

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: "hsl(var(--primary)/0.12)",
        background: "linear-gradient(135deg, hsl(var(--primary)/0.04), hsl(var(--primary)/0.01))",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Star className="w-4 h-4 text-primary" fill="hsl(var(--primary))" />
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/60">
          Your Performance
        </p>
      </div>

      {/* Stats grid */}
      <div className="px-4 pb-3 space-y-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const beatBest =
            stat.label === "Streak"
              ? isNewStreak
              : isNewBest;

          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
              style={{
                backgroundColor: beatBest ? `${stat.color}08` : "hsl(var(--foreground)/0.02)",
                border: `1px solid ${beatBest ? `${stat.color}25` : "hsl(var(--foreground)/0.05)"}`,
              }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${stat.color}15`,
                }}
              >
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>

              {/* Label + current */}
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {stat.label}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "text-sm font-black",
                      beatBest ? "" : "text-foreground",
                    )}
                    style={beatBest ? { color: stat.color } : undefined}
                  >
                    {stat.current}
                  </span>
                  {beatBest && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider animate-pulse"
                      style={{ color: stat.color }}
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                      New Best!
                    </span>
                  )}
                </div>
              </div>

              {/* Best ever */}
              <div className="text-right shrink-0">
                <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/30">
                  Best
                </p>
                <p className="text-xs font-bold text-muted-foreground/60">
                  {stat.best}
                </p>
                {stat.bestPct && (
                  <p className="text-[8px] text-muted-foreground/30">
                    {stat.bestPct}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lifetime summary footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t"
        style={{ borderColor: "hsl(var(--primary)/0.08)" }}
      >
        <p className="text-[9px] font-semibold text-muted-foreground/50">
          {best.total > 0
            ? `Best session: ${best.percentage}% on ${new Date(best.date).toLocaleDateString()}`
            : "Complete a quiz to set your first record!"}
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

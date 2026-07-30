import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import {
  getLast7Days,
  getDayLabel,
  type DailyChallengeEntry,
} from "@/hooks/useDailyChallenge";

export default function StreakCalendar({
  weekHistory,
  todayKey,
  isTodayCompleted,
  consecutiveDays,
}: {
  weekHistory: Record<string, DailyChallengeEntry>;
  todayKey: string;
  isTodayCompleted: boolean;
  consecutiveDays: number;
}) {
  const days = getLast7Days();

  const getDayStyle = (dateKey: string) => {
    const entry = weekHistory[dateKey];
    const isToday = dateKey === todayKey;

    if (!entry || !entry.completed) {
      if (isToday) {
        return {
          bg: "hsl(var(--primary)/0.08)",
          border: "1px solid hsl(var(--primary)/0.3)",
          text: "hsl(var(--primary))",
          label: "Today",
        };
      }
      return {
        bg: "hsl(var(--foreground)/0.03)",
        border: "1px solid hsl(var(--foreground)/0.06)",
        text: "hsl(var(--muted-foreground)/0.4)",
        label: "",
      };
    }

    const pct = entry.score.total > 0
      ? Math.round((entry.score.correct / entry.score.total) * 100)
      : 0;

    if (pct === 100) {
      return {
        bg: "rgba(34, 197, 94, 0.15)",
        border: "1px solid rgba(34, 197, 94, 0.4)",
        text: "#22C55E",
        label: `${entry.score.correct}/${entry.score.total}`,
      };
    }
    if (pct >= 60) {
      return {
        bg: "rgba(251, 191, 36, 0.15)",
        border: "1px solid rgba(251, 191, 36, 0.4)",
        text: "#F59E0B",
        label: `${entry.score.correct}/${entry.score.total}`,
      };
    }
    return {
      bg: "rgba(239, 68, 68, 0.15)",
      border: "1px solid rgba(239, 68, 68, 0.4)",
      text: "#EF4444",
      label: `${entry.score.correct}/${entry.score.total}`,
    };
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Streak counter */}
      {consecutiveDays > 0 && (
        <div className="flex items-center gap-1.5">
          <Flame
            className="w-4 h-4"
            style={{
              color: consecutiveDays >= 3 ? "#F59E0B" : "#F59E0B99",
            }}
            fill={consecutiveDays >= 3 ? "#F59E0B" : "#F59E0B40"}
          />
          <span className="text-sm font-black text-foreground">
            {consecutiveDays} day{consecutiveDays !== 1 ? "s" : ""}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground/60">
            streak
          </span>
        </div>
      )}

      {consecutiveDays === 0 && (
        <p className="text-[10px] font-semibold text-muted-foreground/50">
          Complete today's challenge to start your streak
        </p>
      )}

      {/* Calendar row */}
      <div className="flex items-center gap-2">
        {days.map((dateKey) => {
          const style = getDayStyle(dateKey);
          const isToday = dateKey === todayKey;
          const dayLetter = getDayLabel(dateKey);

          return (
            <div
              key={dateKey}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                  isToday && "ring-2",
                )}
                style={{
                  backgroundColor: style.bg,
                  border: style.border,
                  color: style.text,
                  boxShadow: isToday ? `0 0 10px hsl(var(--primary)/0.15)` : "none",
                }}
              >
                <span className="text-xs font-black">{dayLetter}</span>
              </div>
              <span
                className={cn(
                  "text-[8px] font-bold uppercase tracking-wider",
                  isToday ? "text-primary/60" : "text-muted-foreground/30",
                )}
              >
                {isToday ? "Now" : dateKey.slice(-2)}
              </span>
              {style.label && (
                <span
                  className="text-[7px] font-bold"
                  style={{ color: style.text }}
                >
                  {style.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { BadgeDefinition } from "@/hooks/useBadges";

const CATEGORY_COLORS: Record<string, string> = {
  milestone: "#6366F1", // indigo
  streak: "#F59E0B", // amber
  exploration: "#10B981", // emerald
  difficulty: "#EC4899", // pink
};

export default function BadgeCrest({
  badge,
  unlocked,
  current,
  target,
  size = "md",
}: {
  badge: BadgeDefinition;
  unlocked: boolean;
  current: number;
  target: number;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const color = CATEGORY_COLORS[badge.category] || "#6366F1";
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = unlocked || progress >= 100;

  const dimClasses = {
    xs: "w-10",
    sm: "w-14",
    md: "w-20",
    lg: "w-24",
  };

  const iconSizes = {
    xs: "text-xs",
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const labelSizes = {
    xs: "text-[7px]",
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 group transition-all duration-300",
        dimClasses[size],
        !unlocked && "opacity-60 hover:opacity-90",
      )}
    >
      {/* Badge circle */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full border-2 transition-all duration-300",
          size === "xs" && "w-7 h-7",
          size === "sm" && "w-10 h-10",
          size === "md" && "w-14 h-14",                  size === "lg" && "w-16 h-16",
        )}
        style={{
          borderColor: isComplete ? `${color}60` : "hsl(var(--border))",
          backgroundColor: isComplete
            ? `${color}15`
            : "hsl(var(--foreground)/0.03)",
          boxShadow: isComplete ? `0 0 15px ${color}25` : "none",
        }}
      >
        {/* Circular progress ring */}
        <svg
          className={cn(
            "absolute -inset-0.5 -rotate-90",
            size === "xs" && "w-[34px] h-[34px]",
            size === "sm" && "w-[42px] h-[42px]",
            size === "md" && "w-[58px] h-[58px]",
            size === "lg" && "w-[74px] h-[74px]",
          )}
          viewBox="0 0 36 36"
        >
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border/30"
          />
          {current > 0 && (
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          )}
        </svg>

        {/* Icon */}
        <span className={cn("relative z-10", iconSizes[size])}>
          {badge.icon}
        </span>
      </div>

      {/* Label */}
      <p
        className={cn(
          "font-extrabold text-center leading-tight transition-colors",
          labelSizes[size],
          unlocked ? "text-foreground" : "text-muted-foreground/60",
        )}
      >
        {badge.name}
      </p>

      {/* Progress text */}
      {!unlocked && (
        <p
          className="text-[8px] font-semibold text-muted-foreground/40"
          style={{ color: current > 0 ? `${color}99` : undefined }}
        >
          {current}/{target}
        </p>
      )}

      {unlocked && (
        <p
          className="text-[8px] font-bold uppercase tracking-wider"
          style={{ color }}
        >
          Earned!
        </p>
      )}
    </div>
  );
}

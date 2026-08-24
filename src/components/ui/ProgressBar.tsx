"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = "bg-primary",
  height = "sm",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{value} / {max}</span>
          <span className="font-bold text-foreground/80">{pct}%</span>
        </div>
      )}
      <div className={cn("rounded-full bg-muted overflow-hidden", heightClasses[height])}>
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label?: string };
  className?: string;
}

/**
 * Reusable stats card for dashboards and overview sections.
 * Shows a value with label, optional icon, and trend indicator.
 */
export function StatsCard({ label, value, icon: Icon, iconColor = "text-primary", iconBg = "bg-primary/10", trend, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-xl font-bold text-foreground mt-0.5">{value}</p>
          {trend && (
            <p className={cn("text-[10px] font-semibold mt-0.5", trend.value >= 0 ? "text-emerald-500" : "text-red-500")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%{trend.label ? ` ${trend.label}` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact stats row — multiple stats in a horizontal grid.
 */
export function StatsRow({ stats, className }: { stats: StatsCardProps[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", className)}>
      {stats.map((stat, i) => <StatsCard key={i} {...stat} />)}
    </div>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable section header with optional icon, subtitle, and action button.
 * Replaces the repeated pattern of `<h2 className="text-xs font-bold uppercase tracking-wider">` + action button.
 */
export function SectionHeader({ title, subtitle, icon: Icon, iconColor = "text-muted-foreground", action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/50")}>
            <Icon className={cn("w-4 h-4", iconColor)} />
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/**
 * Compact section header — just uppercase text + optional action.
 * Use when you need a lightweight divider between sections.
 */
export function CompactSectionHeader({ title, count, action, className }: { title: string; count?: number; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.12em]">{title}</span>
        {count !== undefined && <span className="text-[10px] font-bold text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded-full">{count}</span>}
      </div>
      {action}
    </div>
  );
}

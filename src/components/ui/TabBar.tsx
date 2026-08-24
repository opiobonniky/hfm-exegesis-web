"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "default";
}

/**
 * Reusable tab bar with pill-style selection.
 * Replaces the repeated pattern of filter tabs across features.
 */
export function TabBar({ tabs, value, onChange, className, size = "default" }: TabBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5 p-1 rounded-xl border border-border bg-muted/30", className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg font-semibold transition-all",
              size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
              value === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className={cn(size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5")} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                value === tab.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

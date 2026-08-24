"use client";

import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
  icon?: any;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 p-1 rounded-xl border border-border bg-muted/30 w-fit",
        className,
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {tab.label}
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-bold">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

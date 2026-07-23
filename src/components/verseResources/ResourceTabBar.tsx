import React from "react";
import { cn } from "@/lib/utils";
import type { ResourceTab } from "./constants";

export function ResourceTabBar({
  tabs,
  activeTab,
  onTabChange,
  visibleTabs,
}: {
  tabs: ResourceTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  visibleTabs: string[];
}) {
  const filteredTabs = tabs.filter((t) => visibleTabs.includes(t.key));

  if (filteredTabs.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
      {filteredTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComp = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all shrink-0 active:scale-[0.97] whitespace-nowrap",
              isActive
                ? "text-white border-transparent shadow-sm"
                : "bg-card text-muted-foreground border-border/60 hover:bg-muted hover:border-border",
            )}
            style={
              isActive
                ? { backgroundColor: tab.color, borderColor: tab.color }
                : undefined
            }
          >
            <IconComp className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

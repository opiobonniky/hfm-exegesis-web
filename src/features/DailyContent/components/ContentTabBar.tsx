// Tab bar for content types in AdminDailyContent
import { BookOpen, Lightbulb, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "verses", label: "Daily Verses", icon: BookOpen },
  { key: "devotions", label: "Devotions", icon: Lightbulb },
  { key: "explanations", label: "Explanations", icon: MessageSquare },
] as const;

interface ContentTabBarProps {
  active: string;
  onTabChange: (tab: string) => void;
}

export function ContentTabBar({ active, onTabChange }: ContentTabBarProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-xl">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center",
            active === key
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

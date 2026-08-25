import { cn } from "@/lib/utils";

interface Tab {
  key: string;
  label: string;
  badge?: number;
}

interface Props {
  tabs: Tab[];
  active: string;
  onTabChange: (key: string) => void;
  accentColor?: "teal" | "blue" | "emerald" | "primary";
}

const ACCENT = {
  teal: { active: "border-teal-500 text-teal-700", badge: "bg-teal-100 text-teal-700" },
  blue: { active: "border-blue-500 text-blue-700", badge: "bg-blue-100 text-blue-700" },
  emerald: { active: "border-emerald-500 text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  primary: { active: "border-primary text-primary", badge: "bg-primary/10 text-primary" },
};

export function TabBar({ tabs, active, onTabChange, accentColor = "primary" }: Props) {
  const accent = ACCENT[accentColor] || ACCENT.primary;
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors",
            active === tab.key
              ? accent.active
              : "border-transparent text-muted-foreground hover:text-foreground/80",
          )}
        >
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className={cn("text-xs rounded-full px-1.5 py-0.5", accent.badge)}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

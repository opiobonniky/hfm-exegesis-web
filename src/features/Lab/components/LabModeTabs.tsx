import { cn } from "@/lib/utils";
import { LAB_MODE_TABS, type LabMode } from "../constants";

interface Props {
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
}

export function LabModeTabs({ mode, onModeChange }: Props) {
  return (
    <div className="flex items-center gap-1.5 mb-6 bg-muted/50 rounded-lg p-1 max-w-sm mx-auto">
      {LAB_MODE_TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} onClick={() => onModeChange(tab.id)}
            className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              mode === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        );
      })}
    </div>
  );
}

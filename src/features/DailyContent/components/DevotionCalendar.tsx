// Date range picker with presets for devotion filtering
import { Calendar } from "lucide-react";

const PRESETS = [
  { label: "This Week", value: "thisWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last 30 Days", value: "last30" },
  { label: "All Time", value: "all" },
];
interface DevotionCalendarProps {
  preset: string;
  onPresetChange: (p: string) => void;
  totalCount: number;
}
export function DevotionCalendar({ preset, onPresetChange, totalCount }: DevotionCalendarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="w-3.5 h-3.5" />
        <span className="font-medium">{totalCount} devotions</span>
      </div>
      <div className="flex gap-1 ml-auto">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPresetChange(p.value)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              preset === p.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

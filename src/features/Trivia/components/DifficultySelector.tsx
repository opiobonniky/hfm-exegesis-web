// Difficulty filter selector with icons and colors
import { Target, Sparkles, BookOpen, Zap } from "lucide-react";
import type { DifficultyFilter } from "@/hooks/useTrivia";
import { cn } from "@/lib/utils";

interface DifficultyOption {
  value: DifficultyFilter;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}
const OPTIONS: DifficultyOption[] = [
  { value: null, label: "All", desc: "Mixed challenges", icon: Target, color: "#6366F1" },
  { value: "easy", label: "Easy", desc: "Gentle start", icon: Sparkles, color: "#22C55E" },
  { value: "medium", label: "Medium", desc: "Balanced path", icon: BookOpen, color: "#3B82F6" },
  { value: "hard", label: "Hard", desc: "Deep waters", icon: Zap, color: "#EF4444" },
];
interface DifficultySelectorProps {
  selected: DifficultyFilter;
  onSelect: (d: DifficultyFilter) => void;
export function DifficultySelector({ selected, onSelect }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = selected === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              isActive
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/30 bg-card",
            )}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${opt.color}15` }}
            >
              <Icon className="w-5 h-5" style={{ color: opt.color }} />
            </div>
            <span className="text-xs font-bold text-foreground">{opt.label}</span>
            <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );

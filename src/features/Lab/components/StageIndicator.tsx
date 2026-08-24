import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";

interface Stage {
  type: string;
  title: string;
  completed: boolean;
}
interface StageIndicatorProps {
  stages: Stage[];
  activeStage: number;
  onStageClick: (index: number) => void;
export function StageIndicator({ stages, activeStage, onStageClick }: StageIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {stages.map((stage, i) => (
        <div key={i} className="flex items-center">
          <button
            onClick={() => onStageClick(i)}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full transition-all text-sm font-medium",
              i === activeStage
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                : stage.completed
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {stage.completed ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
          {i < stages.length - 1 && (
            <div className={cn("h-1 w-8 mx-1", stage.completed ? "bg-green-500" : "bg-muted")} />
          )}
        </div>
      ))}
    </div>
  );

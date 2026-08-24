// Quiz question navigation dots for DailyReading
import { cn } from "@/lib/utils";

interface QuizNavigationProps {
  total: number;
  currentIndex: number;
  submittedIds: Set<number>;
  correctIds: Set<number>;
  onSelect: (idx: number) => void;
}

export function QuizNavigation({ total, currentIndex, submittedIds, correctIds, onSelect }: QuizNavigationProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === currentIndex;
        const isSubmitted = submittedIds.has(i);
        const isCorrect = correctIds.has(i);
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={cn(
              "w-7 h-7 rounded-lg text-[10px] font-bold transition-all",
              isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30",
              !isCurrent && isSubmitted && isCorrect && "bg-success/20 text-success",
              !isCurrent && isSubmitted && !isCorrect && "bg-destructive/20 text-destructive",
              !isCurrent && !isSubmitted && "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

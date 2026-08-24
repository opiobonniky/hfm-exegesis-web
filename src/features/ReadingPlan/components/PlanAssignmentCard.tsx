// Individual day assignment card for PlanDetail
import { CheckCircle, Circle, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanAssignmentCardProps {
  day: number;
  title: string;
  chapters: { book: string; chapter: number }[];
  completed: boolean;
  isCurrent: boolean;
  quizQuestionCount?: number;
  onClick: () => void;
}
export function PlanAssignmentCard({ day, title, chapters, completed, isCurrent, quizQuestionCount, onClick }: PlanAssignmentCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all",
        isCurrent && !completed && "border-primary bg-primary/5 shadow-sm",
        completed && "border-success/30 bg-success/5",
        !isCurrent && !completed && "border-border hover:border-primary/30",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
          completed ? "bg-success/10" : isCurrent ? "bg-primary/10" : "bg-muted",
        )}>
          {completed ? (
            <CheckCircle className="w-4 h-4 text-success" />
          ) : isCurrent ? (
            <Play className="w-4 h-4 text-primary" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Day {day}</span>
            {completed && <span className="text-[9px] font-semibold text-success">✓ Done</span>}
          </div>
          <p className="text-sm font-medium text-foreground mt-0.5 truncate">{title}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {chapters.slice(0, 3).map((ch, i) => (
              <span key={i} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                {ch.book} {ch.chapter}
              </span>
            ))}
            {chapters.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{chapters.length - 3}</span>
            )}
          {quizQuestionCount ? (
            <p className="text-[10px] text-muted-foreground mt-1">{quizQuestionCount} quiz questions</p>
          ) : null}
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
      </div>
    </button>
  );

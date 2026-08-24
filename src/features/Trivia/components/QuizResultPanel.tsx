// Quiz result display with auto-advance progress bar
import { PartyPopper, XCircle, ArrowRight } from "lucide-react";
import type { TriviaAnswerResult } from "@/services/triviaApi";

interface QuizResultPanelProps {
  result: TriviaAnswerResult;
  autoAdvanceProgress: number | null;
  questionRef?: string;
  onDismiss: () => void;
  onNext: () => void;
}
export function QuizResultPanel({ result, autoAdvanceProgress, questionRef, onDismiss, onNext }: QuizResultPanelProps) {
  const isCorrect = result.isCorrect;
  return (
    <div className="space-y-4">
      {/* Auto-advance progress bar */}
      {autoAdvanceProgress !== null && (
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-100"
            style={{ width: `${autoAdvanceProgress}%` }}
          />
        </div>
      )}
      {/* Result card */}
      <div
        className={`rounded-2xl p-5 border-2 ${
          isCorrect
            ? "border-success/30 bg-success/5"
            : "border-destructive/30 bg-destructive/5"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          {isCorrect ? (
            <PartyPopper className="w-6 h-6 text-success" />
          ) : (
            <XCircle className="w-6 h-6 text-destructive" />
          )}
          <div>
            <p className="text-sm font-bold text-foreground">
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {!isCorrect && result.correctAnswer !== undefined && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Correct answer: {String.fromCharCode(65 + (result.correctAnswer as number))}
              </p>
            )}
          </div>
        {result.explanation && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 p-3 rounded-lg bg-background/50">
            {result.explanation}
          </p>
        )}
        {questionRef && (
          <p className="text-[10px] text-primary font-semibold mt-2">{questionRef}</p>
      </div>
      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onDismiss}
          className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold border border-border hover:bg-muted/50 transition-all"
        >
          Dismiss
        </button>
          onClick={onNext}
          className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          Next <ArrowRight className="w-3 h-3" />
    </div>
  );

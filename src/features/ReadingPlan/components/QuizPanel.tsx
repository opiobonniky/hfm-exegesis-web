import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  questionId: number;
  question: string;
  options: string[];
  correctAnswer: number | string | null;
  explanation: string | null;
  userAnswer: number | null;
  isCorrect: boolean | null;
}

interface QuizPanelProps {
  question: QuizQuestion;
  currentIndex: number;
  total: number;
  selected: number | null;
  showResult: boolean;
  revealedCorrectAnswer: number | null;
  lastAnswerCorrect: boolean | null;
  onSelect: (idx: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  optionRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}

export function QuizPanel({
  question, currentIndex, total, selected, showResult, revealedCorrectAnswer,
  lastAnswerCorrect, onSelect, onSubmit, onNext, optionRefs,
}: QuizPanelProps) {
  const correctIdx = revealedCorrectAnswer ?? (typeof question.correctAnswer === "number" ? question.correctAnswer : null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary">Question {currentIndex + 1}/{total}</span>
        {question.explanation && showResult && (
          <span className="text-[10px] text-muted-foreground">Tap to see explanation</span>
        )}
      </div>

      <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">{question.question}</p>

      <div className="space-y-2">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = showResult && correctIdx === idx;
          const isWrong = showResult && isSelected && !isCorrect;
          return (
            <button
              key={idx}
              ref={(el) => { optionRefs.current[idx] = el; }}
              onClick={() => onSelect(idx)}
              disabled={showResult}
              className={cn(
                "w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all text-sm",
                isCorrect && "border-success bg-success/5",
                isWrong && "border-destructive bg-destructive/5",
                isSelected && !showResult && "border-primary bg-primary/5",
                !isSelected && !showResult && "border-border hover:border-primary/30",
                showResult && !isCorrect && !isWrong && "border-border/50 opacity-60",
              )}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-foreground">{opt}</span>
                {isCorrect && <CheckCircle className="w-4 h-4 text-success ml-auto shrink-0" />}
                {isWrong && <XCircle className="w-4 h-4 text-destructive ml-auto shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={cn(
          "p-3 rounded-xl border text-xs",
          lastAnswerCorrect
            ? "border-success/30 bg-success/5 text-success"
            : "border-destructive/30 bg-destructive/5 text-destructive",
        )}>
          {lastAnswerCorrect ? "Correct!" : "Incorrect. Try the next question!"}
          {question.explanation && (
            <p className="mt-2 text-muted-foreground">{question.explanation}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {showResult ? (
          <button
            onClick={onNext}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            Next <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={onSubmit}
            disabled={selected === null}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
}
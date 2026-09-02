import { Brain, CheckCircle, XCircle, RotateCcw, PenLine, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizQuestion { id: number; question: string; options: string[]; correctAnswer: number; }

interface Props {
  questions: QuizQuestion[];
  currentQ: number;
  selected: number | null;
  showResult: boolean;
  isReviewing: boolean;
  quizDone: boolean;
  correctCount: number;
  lastAnswerCorrect: boolean | null;
  revealedCorrectAnswer: number | null;
  onSelectAnswer: (idx: number) => void;
  onNext: () => void;
  onRetry: () => void;
  onReview: () => void;
}

export default function DailyReadingQuiz({
  questions, currentQ, selected, showResult, isReviewing, quizDone,
  correctCount, lastAnswerCorrect, revealedCorrectAnswer,
  onSelectAnswer, onNext, onRetry, onReview,
}: Props) {
  if (!questions.length) return null;
  const q = questions[currentQ];

  if (quizDone) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <section className="space-y-4 rounded-2xl border border-primary/15 bg-gradient-to-br from-card to-primary/[0.04] p-6 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Understanding check</p>
          <h2 className="mt-1 text-xl font-bold">Quiz complete</h2>
        </div>
        <p className="text-4xl font-black tracking-tight text-primary">{correctCount}<span className="text-xl text-muted-foreground">/{questions.length}</span></p>
        <p className="text-sm text-muted-foreground">You answered {pct}% correctly.</p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onReview} className="gap-1.5"><PenLine className="w-3.5 h-3.5" /> Review</Button>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Retry</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Brain className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold">Check your understanding</h2>
          <p className="text-xs text-muted-foreground">Question {currentQ + 1} of {questions.length}</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{Math.round(((currentQ + 1) / questions.length) * 100)}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>
      <p className="text-base font-semibold leading-relaxed">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === q.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;
          return (
            <button key={i} onClick={() => onSelectAnswer(i)} disabled={showResult && !isReviewing}
              className={cn("w-full rounded-xl border p-3 text-left text-sm transition-all",
                showCorrect && "border-green-500 bg-green-500/10 text-green-700",
                showWrong && "border-red-500 bg-red-500/10 text-red-700",
                !showResult && "border-border/50 hover:border-primary/50 hover:bg-primary/5",
                showResult && !isCorrect && !isSelected && "border-border/30 opacity-60")}>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                {showCorrect && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                {showWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>
      {showResult && (
        <Button onClick={onNext} className="w-full" size="sm">
          {currentQ < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </Button>
      )}
    </section>
  );
}

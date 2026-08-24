import { CheckCircle, XCircle, RotateCcw, PenLine, Star } from "lucide-react";
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
      <div className="rounded-2xl border border-border/50 bg-card p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold">Quiz Complete!</h3>
        <p className="text-2xl font-black text-primary">{correctCount}/{questions.length}</p>
        <p className="text-sm text-muted-foreground">{pct}% correct</p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onReview} className="gap-1.5"><PenLine className="w-3.5 h-3.5" /> Review</Button>
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Retry</Button>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quiz</h3>
        <span className="text-[10px] font-bold text-muted-foreground/60">{currentQ + 1} of {questions.length}</span>
      <p className="text-sm font-semibold leading-relaxed">{q.question}</p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === q.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;
          return (
            <button key={i} onClick={() => onSelectAnswer(i)} disabled={showResult && !isReviewing} className={cn("w-full text-left p-3 rounded-xl border text-sm transition-all", showCorrect && "border-green-500 bg-green-500/10 text-green-700", showWrong && "border-red-500 bg-red-500/10 text-red-700", !showResult && "border-border/50 hover:border-primary/50 hover:bg-primary/5", showResult && !isCorrect && !isSelected && "border-border/30 opacity-60")}>
            <div className="flex items-center gap-2">
              {showCorrect && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
              {showWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <span>{opt}</span>
            </div>
          </button>
        })}
      {showResult && (
        <Button onClick={onNext} className="w-full" size="sm">
          {currentQ < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </Button>
      )}
    </div>
  );

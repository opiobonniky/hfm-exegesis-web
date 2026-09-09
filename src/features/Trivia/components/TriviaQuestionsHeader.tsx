import { ArrowLeft } from "lucide-react";
import type { TriviaQuestionsHeaderProps } from "../types";

export default function TriviaQuestionsHeader({
  questionNumber,
  difficulty,
  onExit,
}: TriviaQuestionsHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-primary/15 bg-primary/95 text-primary-foreground shadow-lg shadow-primary/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-8">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit quiz
        </button>
        <div className="text-right">
          <p className="text-sm font-black">Question {questionNumber}</p>
          <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">
            {difficulty || "All levels"}
          </p>
        </div>
      </div>
    </header>
  );
}

import { ArrowRight, BarChart3 } from "lucide-react";
import type { TriviaHomeActionsProps } from "../types";

export default function TriviaHomeActions({ onStartQuiz, onOpenPerformance }: TriviaHomeActionsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button type="button" onClick={onStartQuiz} className="group flex min-h-[132px] items-center justify-between rounded-2xl border border-primary/15 bg-primary/[0.09] p-6 text-left transition hover:-translate-y-0.5 hover:bg-primary/[0.14]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary/65">Choose your pace</p>
          <p className="mt-2 text-lg font-black">Start a quiz</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Practice across every Bible category.</p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
      </button>
      <button type="button" onClick={onOpenPerformance} className="group flex min-h-[132px] items-center justify-between rounded-2xl border border-primary/15 bg-primary/[0.06] p-6 text-left transition hover:-translate-y-0.5 hover:bg-primary/[0.11]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary/65">Your journey</p>
          <p className="mt-2 text-lg font-black">Review performance</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Explore accuracy and answer history.</p>
        </div>
        <BarChart3 className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
      </button>
    </div>
  );
}

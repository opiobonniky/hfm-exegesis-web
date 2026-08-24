import { ArrowLeft } from "lucide-react";
import AnimatedNumber from "@/components/trivia/AnimatedNumber";
import type { DifficultyFilter } from "@/hooks/useTrivia";

interface Props {
  onBack: () => void;
  difficulty: DifficultyFilter;
  score: { correct: number; total: number };
}

export default function TriviaPageHeader({ onBack, difficulty, score }: Props) {
  return (
    <header
      className="flex-shrink-0 sticky top-0 z-30"
      style={{
        background: "linear-gradient(180deg, hsl(var(--background)/0.95), hsl(var(--background)/0.8))",
        borderBottom: "1px solid hsl(var(--primary)/0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center active:scale-[0.93] transition-all"
            style={{
              backgroundColor: "hsl(var(--primary)/0.08)",
              border: "1px solid hsl(var(--primary)/0.2)",
            }}
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wide leading-none text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
              Bible Trivia
            </h1>
            <p className="text-[10px] tracking-widest uppercase leading-none mt-0.5 text-primary/50">
              {difficulty ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} questions` : "All levels"}
            </p>
          </div>
        </div>
        {score.total > 0 && (
          <span
            className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider text-primary inline-flex items-center gap-0.5"
            style={{ backgroundColor: "hsl(var(--primary)/0.1)", border: "1px solid hsl(var(--primary)/0.25)" }}
          >
            <span className="text-green-400"><AnimatedNumber value={score.correct} springConfig={{ stiffness: 70, damping: 15 }} /></span>
            <span className="mx-0.5 text-primary/30">/</span>
            <AnimatedNumber value={score.total} springConfig={{ stiffness: 70, damping: 15 }} />
          </span>
        )}
      </div>
    </header>
  );
}

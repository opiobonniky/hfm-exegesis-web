"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  Clock,
  Trophy,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRTL } from "@/providers/RTLProvider";
interface TriviaQuestionCardProps {
  question: any;
  index: number;
  showAnswer?: boolean;
  onAnswer?: (questionId: number, selectedAnswer: number) => void;
  selectedAnswer?: number | null;
}
export default function TriviaQuestionCard({
  question,
  index,
  showAnswer = false,
  onAnswer,
  selectedAnswer,
}: TriviaQuestionCardProps) {
  const { isRtl } = useRTL();
  const [expanded, setExpanded] = useState(false);
  const options = question.optionsJson
    ? JSON.parse(question.optionsJson)
    : [question.optionA, question.optionB, question.optionC, question.optionD];
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Question header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{question.question}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {question.difficulty}
            </span>
              {question.category}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
            expanded && "rotate-180",
          )}
        />
      </button>
      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((opt: string, oi: number) => {
              const isSelected = selectedAnswer === oi;
              const isCorrect = showAnswer && oi === question.correctAnswer;
              const isWrong = showAnswer && isSelected && oi !== question.correctAnswer;
              return (
                <button
                  key={oi}
                  onClick={() => onAnswer?.(question.id, oi)}
                  disabled={showAnswer}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-lg border text-sm text-left transition-colors",
                    isCorrect && "border-emerald-200 bg-emerald-50 text-emerald-700",
                    isWrong && "border-red-200 bg-red-50 text-red-700",
                    isSelected && !showAnswer && "border-primary bg-primary/5",
                    !isSelected && !isCorrect && !isWrong && "border-border hover:bg-muted",
                  )}
                >
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {isWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                </button>
              );
            })}
          {/* Explanation */}
          {showAnswer && question.explanation && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary mb-1">Explanation</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
      )}
    </div>
  );

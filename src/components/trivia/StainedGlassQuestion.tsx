import { useMemo } from "react";
import { Lightbulb, Target, BookOpen, ExternalLink, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseOptions } from "@/services/triviaApi";

export default function StainedGlassQuestion({
  question,
  selectedAnswer,
  disabled,
  isRtl,
  correctAnswerIndex,
  onSelect,
  onReferencePress,
}: {
  question: any;
  selectedAnswer: number | null;
  disabled: boolean;
  isRtl: boolean;
  correctAnswerIndex?: number | null;
  onSelect: (index: number) => void;
  onReferencePress?: (
    bookName: string,
    chapter: number,
    verseNumber?: number | null,
  ) => void;
}) {
  const options = useMemo(
    () => parseOptions(question.optionsJson),
    [question.optionsJson],
  );

  const optionLetters = useMemo(
    () => (isRtl ? "א,ב,ג,ד,ה,ו,ז,ח" : "A,B,C,D,E,F,G,H").split(","),
    [isRtl],
  );

  const diffColor =
    question.difficulty === "easy"
      ? "#22C55E"
      : question.difficulty === "hard"
        ? "#EF4444"
        : "#3B82F6";

  return (
    <div
      className="relative rounded-2xl border border-white/10 shadow-xl bg-gradient-to-b from-card/95 to-background/98"
    >
      {/* Gold trim bar */}
      <div className="h-1 w-full flex rounded-t-2xl overflow-hidden">
        <div className="flex-1 bg-primary/60" />
        <div className="flex-1 bg-primary/30" />
        <div className="flex-1 bg-primary/50" />
        <div className="flex-1 bg-primary/20" />
        <div className="flex-1 bg-primary/40" />
      </div>

      <div className={cn("flex items-center gap-2 px-5 pt-5 pb-2", isRtl && "flex-row-reverse")}>
        {question.category && (
          <span className="px-2.5 py-1 rounded-md text-[9px] font-extrabold tracking-[0.15em] uppercase text-primary bg-primary/10 border border-primary/25">
            {question.category.toUpperCase()}
          </span>
        )}
        {question.difficulty && (
          <span
            className="px-2.5 py-1 rounded-md text-[9px] font-extrabold tracking-[0.15em] uppercase"
            style={{
              color: diffColor,
              backgroundColor: `${diffColor}18`,
              border: `1px solid ${diffColor}40`,
            }}
          >
            {question.difficulty.toUpperCase()}
          </span>
        )}
      </div>

      <div className="mx-5 my-3 p-5 rounded-xl relative overflow-hidden bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] border border-primary/[0.12]">
        <div className="absolute top-0 right-0 w-12 h-12 opacity-[0.04]"
          style={{
            background: `radial-gradient(circle at 100% 0%, hsl(var(--primary)) 0%, transparent 70%)`,
          }}
        />
        <div className="absolute bottom-0 left-0 w-12 h-12 opacity-[0.04]"
          style={{
            background: `radial-gradient(circle at 0% 100%, hsl(var(--primary)) 0%, transparent 70%)`,
          }}
        />

        <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-2.5 h-2.5" />
          Question
        </p>
        <p
          className={cn(
            "text-base sm:text-lg font-bold leading-relaxed text-foreground",
            isRtl && "text-right",
          )}
        >
          {question.question}
        </p>
      </div>

      {question.bookName && (
        <button
          onClick={() =>
            onReferencePress?.(
              question.bookName,
              question.chapter ?? 1,
              question.verseNumber,
            )
          }
          className={cn(
            "flex items-center gap-3 mx-5 mb-3 px-3.5 py-2.5 rounded-xl transition-all group [touch-action:manipulation]",
            isRtl && "flex-row-reverse",
          )}
          style={{
            background: "rgba(212, 175, 55, 0.04)",
            border: "1px solid rgba(212, 175, 55, 0.15)",
          }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors bg-primary/10">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-primary/50">
              Read passage
            </p>
            <p className={cn("text-xs font-black text-primary", isRtl && "text-right")}>
              {question.bookName} {question.chapter ?? ""}
              {question.verseNumber ? `:${question.verseNumber}` : ""}
            </p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-primary/40" />
        </button>
      )}

      <div className="px-5 pb-5">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5 text-primary/50">
          <Target className="w-2.5 h-2.5" />
          Choose an answer
        </p>
        <div className={cn("grid grid-cols-2 gap-2")}>
          {options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer =
              disabled &&
              correctAnswerIndex != null &&
              correctAnswerIndex === index;
            const isWrongSelection =
              disabled &&
              isSelected &&
              correctAnswerIndex != null &&
              !isCorrectAnswer;
            const isDimmed = disabled && !isCorrectAnswer && !isWrongSelection;
            const letter = optionLetters[index] || `${index + 1}`;

            let borderColor = "rgba(255,255,255,0.06)";
            let bgColor = "rgba(255,255,255,0.03)";
            let letterStyle: React.CSSProperties = { color: "hsl(var(--primary))", borderColor: "rgba(212,175,55,0.3)" };
            let textColor = "hsl(var(--muted-foreground))";
            let glowColor = "transparent";

            if (disabled) {
              if (isCorrectAnswer) {
                borderColor = "rgba(34, 197, 94, 0.5)";
                bgColor = "rgba(34, 197, 94, 0.08)";
                letterStyle = { backgroundColor: "#22C55E", color: "#FFF", borderColor: "#22C55E" };
                textColor = "#4ADE80";
                glowColor = "rgba(34, 197, 94, 0.15)";
              } else if (isWrongSelection) {
                borderColor = "rgba(239, 68, 68, 0.5)";
                bgColor = "rgba(239, 68, 68, 0.08)";
                letterStyle = { backgroundColor: "#EF4444", color: "#FFF", borderColor: "#EF4444" };
                textColor = "#F87171";
                glowColor = "rgba(239, 68, 68, 0.15)";
              } else if (isSelected) {
                borderColor = "rgba(212,175,55,0.4)";
                bgColor = "rgba(212,175,55,0.08)";
                letterStyle = { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderColor: "hsl(var(--primary))" };
                textColor = "hsl(var(--foreground))";
                glowColor = "rgba(212,175,55,0.15)";
              } else {
                borderColor = "rgba(255,255,255,0.04)";
                bgColor = "transparent";
                letterStyle = { color: "hsl(var(--primary)/0.3)", borderColor: "rgba(212,175,55,0.15)" };
                textColor = "#6B7280";
              }
            } else if (isSelected) {
              borderColor = "rgba(212,175,55,0.4)";
              bgColor = "rgba(212,175,55,0.08)";
              letterStyle = { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", borderColor: "hsl(var(--primary))" };
              textColor = "hsl(var(--foreground))";
              glowColor = "rgba(212,175,55,0.15)";
            }

            return (
              <button
                key={index}
                onClick={() => onSelect(index)}
                disabled={disabled}
                className={cn(
                  "relative flex items-start gap-3 p-3.5 rounded-xl border transition-all group [touch-action:manipulation]",
                  isDimmed && "opacity-35",
                  !disabled && "hover:brightness-110 active:scale-[0.98]",
                )}
                style={{
                  borderColor,
                  backgroundColor: bgColor,
                  boxShadow: glowColor !== "transparent" ? `0 0 20px ${glowColor}` : "none",
                }}
              >
                {disabled && isCorrectAnswer && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                    style={{ boxShadow: "0 0 10px rgba(34,197,94,0.5)" }}
                  >
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}
                {disabled && isWrongSelection && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                    style={{ boxShadow: "0 0 10px rgba(239,68,68,0.5)" }}
                  >
                    <X className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}

                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border transition-all"
                  style={letterStyle}
                >
                  {letter}
                </div>

                <p
                  className={cn(
                    "text-sm font-semibold leading-relaxed text-left flex-1 transition-colors",
                    isRtl && "text-right",
                  )}
                  style={{ color: textColor }}
                >
                  {option}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

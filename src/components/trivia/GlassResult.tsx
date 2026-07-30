import { useState, useCallback, useEffect } from "react";
import { X, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TriviaAnswerResult } from "@/services/triviaApi";

export default function GlassResult({
  result,
  isRtl,
  onDismiss,
  autoAdvanceProgress,
}: {
  result: TriviaAnswerResult;
  isRtl: boolean;
  autoAdvanceProgress?: number | null;
  onDismiss: () => void;
}) {
  const [animState, setAnimState] = useState<"entering" | "visible" | "exiting">("entering");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimState("visible"), 20);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    setAnimState("exiting");
    setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 200);
  }, [onDismiss]);

  const isCorrect = result.isCorrect;
  const accentColor = isCorrect ? "#22C55E" : "#EF4444";
  const accentGlow = isCorrect ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)";

  if (!visible) return null;

  return (
    <div
      className={cn(
        "relative rounded-2xl border overflow-hidden transition-all duration-200",
        animState === "entering" && "opacity-0 scale-95 translate-y-2",
        animState === "visible" && "opacity-100 scale-100 translate-y-0",
        animState === "exiting" && "opacity-0 scale-95 translate-y-2",
      )}
      style={{
        background: `linear-gradient(180deg, ${accentColor}12, ${accentColor}06)`,
        borderColor: `${accentColor}40`,
        boxShadow: `0 0 30px ${accentGlow}`,
      }}
    >
      {/* Auto-advance progress bar */}
      {autoAdvanceProgress != null && autoAdvanceProgress < 100 && (
        <div className="h-1 w-full relative bg-transparent">
          <div
            className="h-full transition-all duration-150 ease-linear"
            style={{
              width: `${autoAdvanceProgress}%`,
              background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}40, ${accentColor}60, ${accentColor}20, ${accentColor}80)`,
              boxShadow: `0 0 6px ${accentColor}60`,
            }}
          />
        </div>
      )}
      {autoAdvanceProgress == null && (
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}40, ${accentColor}60, ${accentColor}20, ${accentColor}50)`,
          }}
        />
      )}

      <button
        onClick={handleDismiss}
        className={cn(
          "absolute top-3 w-7 h-7 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full flex items-center justify-center hover:brightness-125 active:scale-[0.92] transition-all z-10 [touch-action:manipulation]",
          isRtl ? "left-3" : "right-3",
        )}
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <X className="w-3.5 h-3.5" style={{ color: accentColor }} />
      </button>

      <div className="p-5">
        <div className={cn("flex items-center gap-3 mb-2", isRtl && "flex-row-reverse")}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}18` }}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6" style={{ color: accentColor }} />
            ) : (
              <XCircle className="w-6 h-6" style={{ color: accentColor }} />
            )}
          </div>
          <div className={cn("flex-1", isRtl && "text-right")}>
            <p className="text-base font-black" style={{ color: accentColor }}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
            {!isCorrect && (
              <p className="text-xs font-semibold mt-0.5 text-muted-foreground/80">
                {result.correctAnswerText}
              </p>
            )}
          </div>
        </div>

        {result.explanation && (
          <div
            className={cn(
              "flex items-start gap-2.5 p-3 rounded-xl mb-3",
              isRtl && "flex-row-reverse",
            )}
            style={{
              background: "rgba(59, 130, 246, 0.06)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
            }}
          >
            <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <p className="text-xs sm:text-sm leading-6 flex-1 text-muted-foreground/85">
              {result.explanation}
            </p>
          </div>
        )}

        <button
          onClick={handleDismiss}
          className="relative w-full py-3 rounded-xl text-xs font-extrabold text-center tracking-wider uppercase transition-all hover:brightness-110 active:scale-[0.98] shadow-lg text-white [touch-action:manipulation] overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            boxShadow: `0 4px 12px ${accentColor}40`,
          }}
        >
          {autoAdvanceProgress != null && autoAdvanceProgress < 100 ? (
            <span className="relative z-10">Continue — {Math.ceil((100 - autoAdvanceProgress) / 33)}s</span>
          ) : (
            <span className="relative z-10">Continue</span>
          )}
        </button>
      </div>
    </div>
  );
}

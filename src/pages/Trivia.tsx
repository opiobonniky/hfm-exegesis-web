import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  RotateCcw,
  PartyPopper,
  BookOpen,
  Zap,
  Award,
  Target,
  Sparkles,
  Trophy,
  Check,
  X,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ExternalLink,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { useTrivia, DifficultyFilter } from "@/hooks/useTrivia";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { parseOptions } from "@/services/triviaApi";
import type { TriviaAnswerResult } from "@/services/triviaApi";

// ── Constants ──

const MILESTONE_THRESHOLDS = [3, 5, 10, 25];

const MILESTONE_CONFIGS: Record<number, { icon: any; color: string }> = {
  3: { icon: Sparkles, color: "#60A5FA" },
  5: { icon: Zap, color: "#F59E0B" },
  10: { icon: Award, color: "#8B5CF6" },
  25: { icon: PartyPopper, color: "#EC4899" },
};

const MILESTONE_MESSAGES: Record<
  number,
  Record<string, { title: string; subtitle: string }>
> = {
  3: {
    elite: { title: "Bright Start!", subtitle: "You're a natural!" },
    strong: { title: "Great Start!", subtitle: "Off to a solid beginning!" },
    solid: { title: "Good Start!", subtitle: "Keep learning and growing!" },
    growing: {
      title: "First Steps!",
      subtitle: "Every expert was once a beginner!",
    },
  },
  5: {
    elite: { title: "On Fire!", subtitle: "Unstoppable!" },
    strong: { title: "Solid Work!", subtitle: "You're getting the hang of it!" },
    solid: { title: "Half Dozen!", subtitle: "Keep pushing forward!" },
    growing: { title: "Nice Effort!", subtitle: "Practice makes progress!" },
  },
  10: {
    elite: { title: "Bible Scholar!", subtitle: "Double digits with style!" },
    strong: { title: "Impressive!", subtitle: "Double digits and going strong!" },
    solid: { title: "Dedicated!", subtitle: "10 questions in — keep going!" },
    growing: { title: "Persistent!", subtitle: "Learning takes time and you are!" },
  },
  25: {
    elite: {
      title: "Scripture Master!",
      subtitle: "A true Bible expert in the making!",
    },
    strong: {
      title: "Well Versed!",
      subtitle: "Quarter century of questions — wow!",
    },
    solid: {
      title: "Committed!",
      subtitle: "25 questions deep — dedication!",
    },
    growing: {
      title: "Determined!",
      subtitle: "Steady persistence wins the race!",
    },
  },
};

function getMessageTier(percentage: number): string {
  if (percentage >= 80) return "elite";
  if (percentage >= 60) return "strong";
  if (percentage >= 40) return "solid";
  return "growing";
}

// ── ConfettiOverlay ──

const PARTICLE_COUNT = 48;
const CONFETTI_COLORS = [
  "#FF6B6B", "#FECA57", "#48DBFB", "#FF9FF3",
  "#54A0FF", "#5F27CD", "#1DD1A1", "#EE5A24",
  "#FFD93D", "#6BCB77", "#4D96FF", "#FF6B6B",
];

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  drift: number;
}

function ConfettiOverlay({
  visible,
  onFinish,
}: {
  visible: boolean;
  onFinish: () => void;
}) {
  const [particles] = useState<ConfettiParticle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 5 + Math.random() * 10,
      delay: Math.random() * 400,
      duration: 2500 + Math.random() * 1500,
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 40,
    })),
  );
  const finishedRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!visible) {
      finishedRef.current = 0;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      return;
    }

    finishedRef.current = 0;

    particles.forEach((p) => {
      const timer = setTimeout(() => {
        finishedRef.current += 1;
        if (finishedRef.current >= PARTICLE_COUNT) {
          onFinish();
        }
      }, p.delay + p.duration);
      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [visible, particles, onFinish]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotate(0deg) translateX(0); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg) translateX(var(--drift)); opacity: 0; }
        }
        @keyframes confettiShimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3); }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size * 1.3,
            backgroundColor: p.color,
            borderRadius: p.size * 0.12,
            animation: `confettiFall ${p.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}ms forwards`,
            "--drift": `${p.drift}px`,
            boxShadow: `0 0 2px ${p.color}40`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── MilestoneOverlay ──

function MilestoneOverlay({
  visible,
  total,
  correct,
  percentage,
  onFinish,
}: {
  visible: boolean;
  total: number;
  correct: number;
  percentage: number;
  onFinish: () => void;
}) {
  const [closing, setClosing] = useState(false);

  const milestone = useMemo(() => {
    for (const m of MILESTONE_THRESHOLDS) {
      if (total === m) return m;
    }
    return null;
  }, [total]);

  const config = milestone ? MILESTONE_CONFIGS[milestone] : null;
  const tier = getMessageTier(percentage);
  const msg = milestone
    ? MILESTONE_MESSAGES[milestone]?.[tier] ?? {
        title: "Great Job!",
        subtitle: "Keep it up!",
      }
    : { title: "", subtitle: "" };
  const IconComp = config?.icon || Sparkles;
  const accentColor = config?.color || "#60A5FA";

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onFinish();
    }, 200);
  }, [onFinish]);

  if (!visible || !milestone) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={cn(
          "relative w-[82%] max-w-[360px] rounded-2xl p-7 flex flex-col items-center shadow-2xl transition-all duration-200",
          "bg-white dark:bg-gray-900 border border-white/10",
          "dark:shadow-gray-950/50",
          closing ? "opacity-0 scale-[0.96] translate-y-3" : "opacity-100 scale-100 translate-y-0",
        )}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-7 h-7 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.92] transition-all z-10 [touch-action:manipulation]"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Badge with glow */}
        <div className="relative -mt-12 mb-3">
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-40"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 20px ${accentColor}60`,
            }}
          >
            <IconComp className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Milestone number */}
        <p className="text-4xl font-black text-gray-900 dark:text-white leading-none mt-1">
          {milestone}
        </p>
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mb-5 mt-1.5">
          Questions Answered
        </p>

        {/* Message */}
        <p
          className="text-xl font-black text-center mb-1"
          style={{ color: accentColor }}
        >
          {msg.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold text-center leading-5 mb-6">
          {msg.subtitle}
        </p>

        {/* Accuracy ring */}
        <div className="relative mb-2">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 188.5} 188.5`}
              stroke={accentColor}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-black" style={{ color: accentColor }}>
              {percentage}%
            </p>
            <p className="text-[8px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              accuracy
            </p>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold mb-4">
          {correct}/{total} correct
        </p>

        <button
          onClick={handleClose}
          className="px-10 py-2.5 rounded-full text-white text-sm font-extrabold transition-all hover:opacity-90 active:scale-[0.97] shadow-lg [touch-action:manipulation]"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 4px 14px ${accentColor}50`,
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── AnimatedScoreRing ──

function AnimatedScoreRing({
  correct,
  total,
  size = 100,
}: {
  correct: number;
  total: number;
  size?: number;
}) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 88 88"
        className="-rotate-90"
      >
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/20"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-lg font-black text-foreground">{percentage}%</p>
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider -mt-0.5">
          accuracy
        </p>
      </div>
    </div>
  );
}

// ── Trivia Question Card ──

function TriviaQuestionCard({
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

  return (
    <div className="w-full rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow">
      {/* Category + Difficulty badges */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-2">
        {question.category && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-primary/12 text-primary border border-primary/20">
            {question.category.toUpperCase()}
          </span>
        )}
        {question.difficulty && (
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider border",
              question.difficulty === "easy" &&
                "bg-green-500/12 text-green-600 dark:text-green-400 border-green-500/25",
              question.difficulty === "hard" &&
                "bg-red-500/12 text-red-600 dark:text-red-400 border-red-500/25",
              question.difficulty === "medium" &&
                "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25",
            )}
          >
            {question.difficulty.toUpperCase()}
          </span>
        )}
      </div>

      {/* Question text */}
      <div className="mx-5 mb-3 p-4 rounded-xl bg-gradient-to-br from-primary/[0.07] to-primary/[0.03] border border-primary/15">
        <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Lightbulb className="w-3 h-3" />
          Question
        </p>
        <p
          className={cn(
            "text-base sm:text-lg font-bold text-foreground leading-relaxed",
            isRtl && "text-right",
          )}
        >
          {question.question}
        </p>
      </div>

      {/* Scripture reference */}
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
            "flex items-center gap-3 mx-5 mb-3 px-3.5 py-2.5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.06] to-primary/[0.02] hover:from-primary/[0.12] hover:to-primary/[0.06] active:scale-[0.99] transition-all [touch-action:manipulation] group",
            isRtl && "flex-row-reverse",
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary/12 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
              Read passage
            </p>
            <p className={cn("text-xs font-black text-primary", isRtl && "text-right")}>
              {question.bookName} {question.chapter ?? ""}
              {question.verseNumber ? `:${question.verseNumber}` : ""}
            </p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-primary/60 shrink-0 group-hover:text-primary transition-colors" />
        </button>
      )}

      {/* Options */}
      <div className="px-5 pb-5">
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Target className="w-3 h-3" />
          Choose an answer
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
            let isDimmed = disabled && !isCorrectAnswer && !isWrongSelection;
            const letter = optionLetters[index] || `${index + 1}`;

            let borderClass = "border-border/60 hover:border-primary/40 hover:bg-primary/[0.03]";
            let bgClass = "bg-card";
            let letterBgClass = "bg-muted/40";
            let letterTextClass = "text-muted-foreground";
            let textClass = "text-foreground";

            if (disabled) {
              if (isCorrectAnswer) {
                borderClass = "border-green-500/70";
                bgClass = "bg-gradient-to-br from-green-500/12 to-green-500/05";
                letterBgClass = "bg-green-500";
                letterTextClass = "text-white";
                textClass = "text-green-600 dark:text-green-400";
              } else if (isWrongSelection) {
                borderClass = "border-red-500/70";
                bgClass = "bg-gradient-to-br from-red-500/12 to-red-500/05";
                letterBgClass = "bg-red-500";
                letterTextClass = "text-white";
                textClass = "text-red-600 dark:text-red-400";
              } else if (isSelected) {
                borderClass = "border-primary/60";
                bgClass = "bg-primary/[0.06]";
                letterBgClass = "bg-primary";
                letterTextClass = "text-white";
              } else {
                isDimmed = true;
                borderClass = "border-border/40";
                bgClass = "bg-card";
              }
            } else if (isSelected) {
              borderClass = "border-primary/60 bg-primary/[0.06]";
              bgClass = "bg-primary/[0.06]";
              letterBgClass = "bg-primary";
              letterTextClass = "text-white";
            }

            return (
              <button
                key={index}
                onClick={() => onSelect(index)}
                disabled={disabled}
                className={cn(
                  "relative flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all group",
                  borderClass,
                  bgClass,
                  isDimmed && "opacity-35",
                  !disabled &&
                    "cursor-pointer hover:shadow-sm active:scale-[0.98]",
                  "[touch-action:manipulation]",
                )}
              >
                {/* Status icon */}
                {disabled && isCorrectAnswer && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
                {disabled && isWrongSelection && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <X className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}

                {/* Letter badge */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center border text-sm font-black shrink-0 mt-0.5 transition-all",
                    letterBgClass,
                    letterTextClass,
                    borderClass,
                    !disabled && !isSelected && "group-hover:bg-primary group-hover:text-white group-hover:border-primary",
                  )}
                >
                  {letter}
                </div>

                {/* Option text */}
                <p
                  className={cn(
                    "text-sm font-semibold leading-relaxed text-left flex-1",
                    textClass,
                    isRtl && "text-right",
                  )}
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

// ── Result Card ──

function TriviaResultCard({
  result,
  isRtl,
  onDismiss,
}: {
  result: TriviaAnswerResult;
  isRtl: boolean;
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

  const accentColor = result.isCorrect
    ? "rgb(34, 197, 94)"
    : "rgb(239, 68, 68)";
  const accentBg = result.isCorrect
    ? "from-green-500/12 to-green-500/05"
    : "from-red-500/12 to-red-500/05";
  const accentBorder = result.isCorrect
    ? "border-green-500/50"
    : "border-red-500/50";

  if (!visible) return null;

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 p-4 sm:p-5 mb-3 transition-all duration-200 bg-gradient-to-br shadow-sm",
        accentBg,
        accentBorder,
        animState === "entering" && "opacity-0 scale-95 translate-y-2",
        animState === "visible" && "opacity-100 scale-100 translate-y-0",
        animState === "exiting" && "opacity-0 scale-95 translate-y-2",
      )}
    >
      {/* Close */}
      <button
        onClick={handleDismiss}
        className={cn(
          "absolute top-3 w-7 h-7 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full bg-black/[0.06] dark:bg-white/[0.08] flex items-center justify-center hover:bg-black/[0.1] dark:hover:bg-white/[0.12] active:scale-[0.92] transition-all z-10 [touch-action:manipulation]",
          isRtl ? "left-3" : "right-3",
        )}
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {/* Header */}
      <div className={cn("flex items-center gap-3 mb-2", isRtl && "flex-row-reverse")}>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            result.isCorrect ? "bg-green-500/15" : "bg-red-500/15",
          )}
        >
          {result.isCorrect ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500" />
          )}
        </div>
        <div className={cn("flex-1", isRtl && "text-right")}>
          <p className="text-base font-black" style={{ color: accentColor }}>
            {result.isCorrect ? "Correct!" : "Incorrect"}
          </p>
          {!result.isCorrect && (
            <p className={cn("text-xs font-semibold text-muted-foreground mt-0.5", isRtl && "text-right")}>
              {result.correctAnswerText}
            </p>
          )}
        </div>
      </div>

      {/* Explanation */}
      {result.explanation && (
        <div className={cn(
          "flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/05 border border-blue-500/15 mb-3",
          isRtl && "flex-row-reverse"
        )}>
          <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className={cn("text-xs sm:text-sm text-muted-foreground leading-6 flex-1", isRtl && "text-right")}>
            {result.explanation}
          </p>
        </div>
      )}

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="w-full py-3 rounded-xl text-white text-xs font-extrabold text-center transition-all hover:opacity-90 active:scale-[0.98] shadow-lg [touch-action:manipulation]"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 4px 12px ${accentColor}40`,
        }}
      >
        Continue
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DIFFICULTY OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const DIFFICULTY_OPTIONS: {
  value: DifficultyFilter;
  label: string;
  desc: string;
  icon: any;
  color: string;
  gradient: string;
}[] = [
  {
    value: null,
    label: "All",
    desc: "Mixed difficulty levels",
    icon: Target,
    color: "#6366F1",
    gradient: "from-indigo-500/20 to-indigo-600/10",
  },
  {
    value: "easy",
    label: "Easy",
    desc: "Beginner friendly",
    icon: Sparkles,
    color: "#22C55E",
    gradient: "from-green-500/20 to-emerald-600/10",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Balanced challenge",
    icon: BookOpen,
    color: "#3B82F6",
    gradient: "from-blue-500/20 to-sky-600/10",
  },
  {
    value: "hard",
    label: "Hard",
    desc: "Expert level",
    icon: Zap,
    color: "#EF4444",
    gradient: "from-red-500/20 to-rose-600/10",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function TriviaPage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const {
    phase,
    question,
    selectedAnswer,
    result,
    score,
    stats,
    loading,
    error,
    difficulty,
    totalCount,
    streak,
    fetchQuestion,
    answer,
    nextQuestion,
    fetchStats,
    reset,
    setDifficulty,
    startQuiz,
  } = useTrivia();

  const prevDifficultyRef = useRef(difficulty);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Re-fetch when difficulty changes during game
  useEffect(() => {
    if (prevDifficultyRef.current !== difficulty && phase !== "plan") {
      prevDifficultyRef.current = difficulty;
      fetchQuestion();
    }
    if (phase === "plan") {
      prevDifficultyRef.current = difficulty;
    }
  }, [difficulty, fetchQuestion, phase]);

  const handleSelect = useCallback(
    (index: number) => {
      if (selectedAnswer !== null) return;
      answer(index);
    },
    [answer, selectedAnswer],
  );

  const handleReferencePress = useCallback(
    (bookName: string, chapter: number, verseNumber?: number | null) => {
      navigate(
        `${routes.bibleReader.path}?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseNumber ?? 1}`,
      );
    },
    [navigate],
  );

  // ── Result dismissed state ──
  const [resultDismissed, setResultDismissed] = useState(false);

  const handleDismissResult = useCallback(() => {
    setResultDismissed(true);
  }, []);

  useEffect(() => {
    if (phase === "playing") {
      setResultDismissed(false);
    }
  }, [phase]);

  // ── Confetti state ──
  const [showConfetti, setShowConfetti] = useState(false);
  const prevStreakRef = useRef(0);

  useEffect(() => {
    if (
      streak >= 3 &&
      prevStreakRef.current < 3 &&
      phase === "answered" &&
      result?.isCorrect
    ) {
      setShowConfetti(true);
    }
    prevStreakRef.current = streak;
  }, [streak, phase, result]);

  const handleConfettiFinish = useCallback(() => setShowConfetti(false), []);

  // ── Milestone state ──
  const [showMilestone, setShowMilestone] = useState(false);
  const prevTotalRef = useRef(0);

  useEffect(() => {
    const current = score.total;
    const prev = prevTotalRef.current;
    if (
      current > 0 &&
      current !== prev &&
      MILESTONE_THRESHOLDS.includes(current) &&
      phase === "answered"
    ) {
      setShowMilestone(true);
    }
    prevTotalRef.current = current;
  }, [score.total, phase]);

  const handleMilestoneFinish = useCallback(() => setShowMilestone(false), []);

  // ── Score badge (used in header) ──
  const scoreBadge =
    score.total > 0 ? (
      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-primary/12 text-primary border border-primary/20">
        <span className="text-green-500">{score.correct}</span>
        <span className="mx-0.5 opacity-40">/</span>
        {score.total}
      </span>
    ) : undefined;

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="relative w-9 h-9 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-xl bg-muted/40 flex items-center justify-center hover:bg-muted/60 active:scale-[0.93] transition-all border border-border/40 [touch-action:manipulation] group"
            >
              <ArrowLeft className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
            </button>
            <div>
              <h1
                className="text-base sm:text-lg font-bold tracking-wide text-foreground leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Bible Trivia
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                {difficulty
                  ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} questions`
                  : "All levels"}
              </p>
            </div>
          </div>
          {scoreBadge}
        </div>
      </header>

      {/* Confetti + Milestone overlays */}
      <ConfettiOverlay visible={showConfetti} onFinish={handleConfettiFinish} />
      <MilestoneOverlay
        visible={showMilestone}
        total={score.total}
        correct={score.correct}
        percentage={
          score.total > 0
            ? Math.round((score.correct / score.total) * 100)
            : 0
        }
        onFinish={handleMilestoneFinish}
      />

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 pb-20">
          {phase === "plan" ? (
            /* ══════════════════════════════════════════════
                PLAN SCREEN
               ══════════════════════════════════════════════ */
            <div className="flex flex-col gap-6 sm:gap-8">
              {/* Hero section */}
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/[0.12] via-primary/[0.06] to-primary/[0.02] border border-primary/15 p-6 sm:p-10">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-primary/8 blur-2xl" />
                <div className="absolute top-1/2 right-1/4 w-px h-32 bg-gradient-to-b from-primary/20 to-transparent" />

                <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                  <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30 shrink-0">
                    <BookOpen className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-black text-foreground mb-1.5">
                      Bible Knowledge Quiz
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
                      Test your knowledge of the Scriptures with fun trivia
                      questions drawn from across the Bible.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats card */}
              {stats && stats.totalAnswered > 0 ? (
                <div className="rounded-2xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6">
                  <div
                    className={cn(
                      "flex items-center gap-2 mb-4",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Your Performance
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-6 sm:gap-10">
                    <div className="flex flex-col items-center">
                      <AnimatedScoreRing
                        correct={stats.correct}
                        total={stats.totalAnswered}
                        size={100}
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="text-center sm:text-left">
                        <p className="text-2xl font-black text-green-500">
                          {stats.correct}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                          Correct
                        </p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-2xl font-black text-foreground">
                          {stats.totalAnswered}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                          Total
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6 sm:p-8 flex flex-col items-center gap-2.5">
                  <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    No stats yet
                  </p>
                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    Complete your first quiz to see your performance here!
                  </p>
                </div>
              )}

              {/* Difficulty selection */}
              <div>
                <div className="flex items-end justify-between mb-3 sm:mb-4">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                      <Target className="w-3 h-3" />
                      Question Level
                    </p>
                    <p className="text-base sm:text-lg font-black text-foreground">
                      Choose your challenge
                    </p>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground pb-0.5 hidden sm:block">
                    Select one
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {DIFFICULTY_OPTIONS.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = difficulty === opt.value;

                    return (
                      <button
                        key={opt.value ?? "all"}
                        onClick={() => setDifficulty(opt.value)}
                        className={cn(
                          "relative group min-h-[120px] sm:min-h-[140px] flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all text-left overflow-hidden [touch-action:manipulation]",
                          isSelected
                            ? "border-[var(--opt-color)] shadow-lg"
                            : "border-border/60 bg-card hover:border-[var(--opt-color)]/40 hover:shadow-md",
                        )}
                        style={
                          {
                            "--opt-color": opt.color,
                            "--opt-glow": `${opt.color}30`,
                          } as React.CSSProperties
                        }
                      >
                        {/* Background gradient */}
                        <div
                          className={cn(
                            "absolute inset-0 transition-opacity duration-300",
                            isSelected
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-60",
                          )}
                          style={{
                            background: `linear-gradient(135deg, ${opt.color}15, ${opt.color}08)`,
                          }}
                        />

                        {/* Decorative dot pattern */}
                        <div className="absolute top-3 right-3 flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-1 h-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: isSelected
                                  ? `${opt.color}60`
                                  : `${opt.color}20`,
                                opacity: isSelected ? 0.8 : 0.3,
                              }}
                            />
                          ))}
                        </div>

                        <div className="relative z-10">
                          <div
                            className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
                              isSelected
                                ? "shadow-lg"
                                : "group-hover:scale-110",
                            )}
                            style={{
                              backgroundColor: isSelected
                                ? opt.color
                                : `${opt.color}12`,
                              borderColor: isSelected
                                ? opt.color
                                : `${opt.color}30`,
                              boxShadow: isSelected
                                ? `0 4px 20px ${opt.color}40`
                                : "none",
                            }}
                          >
                            <IconComp
                              className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-transform duration-300"
                              color={isSelected ? "#FFFFFF" : opt.color}
                              style={!isSelected ? {} : { transform: "scale(1.1)" }}
                            />
                          </div>
                        </div>

                        <div className="relative z-10 flex flex-col gap-0.5 mt-2">
                          <p
                            className={cn(
                              "text-sm sm:text-base font-black transition-colors",
                              isSelected
                                ? "text-[var(--opt-color)]"
                                : "text-foreground",
                            )}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Quiz */}
              <button
                onClick={startQuiz}
                className="relative group w-full flex items-center justify-center gap-2.5 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-extrabold text-sm sm:text-base transition-all hover:opacity-90 active:scale-[0.98] shadow-xl shadow-primary/30 overflow-hidden [touch-action:manipulation]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Play className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] fill-current" />
                Start Quiz
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <p className="text-[11px] sm:text-xs text-muted-foreground text-center leading-6 px-4 sm:px-8 pb-2">
                Questions are drawn from across the Bible. You can tap a
                scripture reference to read the passage before answering.
              </p>
            </div>
          ) : (
            /* ══════════════════════════════════════════════
                GAME SCREEN
               ══════════════════════════════════════════════ */
            <div className="max-w-2xl mx-auto">
              {/* Difficulty filter chips */}
              <div className="p-2 rounded-2xl bg-card border border-border/60 shadow-sm mb-4">
                <p className="px-3 pt-1 pb-2 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  Difficulty
                </p>
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    isRtl && "flex-row-reverse",
                  )}
                >
                  {(["all", "easy", "medium", "hard"] as const).map((d) => {
                    const isActive =
                      d === "all" ? difficulty === null : difficulty === d;
                    const chipColors =
                      d === "easy"
                        ? {
                            bg: "bg-green-500/15 border-green-500/30",
                            text: "text-green-600 dark:text-green-400",
                          }
                        : d === "hard"
                          ? {
                              bg: "bg-red-500/15 border-red-500/30",
                              text: "text-red-600 dark:text-red-400",
                            }
                          : d === "medium"
                            ? {
                                bg: "bg-blue-500/15 border-blue-500/30",
                                text: "text-blue-600 dark:text-blue-400",
                              }
                            : {
                                bg: "bg-primary/12 border-primary/25",
                                text: "text-primary",
                              };

                    return (
                      <button
                        key={d}
                        onClick={() =>
                          setDifficulty(d === "all" ? null : d)
                        }
                        className={cn(
                          "flex-1 min-h-[40px] py-2 rounded-xl text-[11px] font-extrabold text-center transition-all border active:scale-[0.97] [touch-action:manipulation]",
                          isActive
                            ? `${chipColors.bg} ${chipColors.text} border`
                            : "bg-muted/20 text-muted-foreground hover:bg-muted/40 border-transparent",
                        )}
                      >
                        {d === "all"
                          ? "All"
                          : d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="mb-4">
                  <div
                    className={cn(
                      "flex items-center justify-between mb-1.5",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-bold text-foreground">
                        Question {score.total + 1} of {totalCount}
                      </p>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <p className="text-[11px] font-medium text-muted-foreground">
                        {difficulty
                          ? difficulty.charAt(0).toUpperCase() +
                            difficulty.slice(1)
                          : "All"}
                      </p>
                    </div>
                    <p className="text-[11px] font-extrabold text-primary">
                      {Math.round((score.total / totalCount) * 100)}%
                    </p>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted/30 border border-border/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                      style={{
                        width: `${(score.total / totalCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && !question && (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Loading question...
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-sm font-semibold text-destructive text-center max-w-sm">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQuestion}
                    className="gap-1.5 rounded-xl"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Playing */}
              {phase === "playing" && question && (
                <div>
                  <TriviaQuestionCard
                    question={question}
                    selectedAnswer={selectedAnswer}
                    disabled={false}
                    isRtl={isRtl}
                    onSelect={handleSelect}
                    onReferencePress={handleReferencePress}
                  />
                  <div className="flex items-center justify-center mt-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 border border-border/40">
                      <Target className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-[10px] font-semibold text-muted-foreground">
                        Tap an option to answer
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Answered */}
              {phase === "answered" && question && result && (
                <div>
                  <div className="mb-2">
                    <TriviaQuestionCard
                      question={question}
                      selectedAnswer={selectedAnswer}
                      disabled={true}
                      isRtl={isRtl}
                      correctAnswerIndex={result?.correctAnswer}
                      onSelect={() => {}}
                      onReferencePress={handleReferencePress}
                    />
                  </div>

                  {/* Streak */}
                  {streak >= 2 && (
                    <div
                      className={cn(
                        "flex items-center justify-center gap-1.5 mb-3 py-2 px-4 rounded-xl self-center mx-auto w-fit border shadow-sm",
                        streak >= 3
                          ? "bg-gradient-to-r from-amber-500/12 to-amber-500/05 border-amber-500/30"
                          : "bg-primary/[0.06] border-primary/20",
                        isRtl && "flex-row-reverse",
                      )}
                    >
                      <Zap
                        className={cn(
                          "w-4 h-4",
                          streak >= 3 ? "text-amber-500" : "text-primary",
                        )}
                        fill={streak >= 3 ? "#F59E0B" : "transparent"}
                      />
                      <p
                        className={cn(
                          "text-xs font-extrabold",
                          streak >= 3 ? "text-amber-500" : "text-primary",
                        )}
                      >
                        {streak} in a row{streak >= 3 ? " 🔥" : ""}
                      </p>
                    </div>
                  )}

                  {/* Result area */}
                  <div className="min-h-[160px]">
                    {!resultDismissed && (
                      <TriviaResultCard
                        result={result}
                        isRtl={isRtl}
                        onDismiss={handleDismissResult}
                      />
                    )}

                    {/* Next button */}
                    {resultDismissed && (
                      <button
                        onClick={nextQuestion}
                        className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-extrabold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/30 mb-3 [touch-action:manipulation] overflow-hidden relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <Play className="w-4 h-4 fill-current" />
                        Next Question
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Finished */}
              {phase === "finished" && (
                <div className="flex flex-col items-center pt-6 sm:pt-10 gap-4 sm:gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-primary/50" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30">
                      <PartyPopper className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground text-center">
                    All Questions Completed!
                  </h2>
                  <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
                    You've answered every available question. Come back later for
                    more!
                  </p>

                  {/* Final score */}
                  <div className="w-full max-w-xs p-5 sm:p-6 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col items-center gap-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Final Score
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-primary">
                      {score.correct}/{score.total}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {score.total > 0
                        ? Math.round((score.correct / score.total) * 100)
                        : 0}
                      %
                    </p>
                  </div>

                  {/* Lifetime stats */}
                  {stats && stats.totalAnswered > score.total && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/40">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Lifetime: {stats.correct}/{stats.totalAnswered} (
                        {stats.percentage}%)
                      </p>
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className="group inline-flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/30 mt-2 [touch-action:manipulation] overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <RotateCcw className="w-4 h-4" />
                    Play Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

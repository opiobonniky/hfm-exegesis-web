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

const PARTICLE_COUNT = 40;
const CONFETTI_COLORS = [
  "#FF6B6B", "#FECA57", "#48DBFB", "#FF9FF3",
  "#54A0FF", "#5F27CD", "#1DD1A1", "#EE5A24",
];

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
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
      size: 6 + Math.random() * 8,
      delay: Math.random() * 300,
      duration: 2200 + Math.random() * 1200,
      rotation: Math.random() * 360,
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
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
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
            height: p.size * 1.4,
            backgroundColor: p.color,
            borderRadius: p.size * 0.15,
            animation: `confettiFall ${p.duration}ms ease-in ${p.delay}ms forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
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
    }, 170);
  }, [onFinish]);

  if (!visible || !milestone) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/55" />
      <div
        className={cn(
          "relative w-[82%] max-w-[330px] bg-white dark:bg-gray-900 rounded-2xl p-6 flex flex-col items-center shadow-2xl transition-all duration-200",
          closing ? "opacity-0 scale-[0.96] translate-y-3" : "opacity-100 scale-100 translate-y-0",
        )}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-7 h-7 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.92] transition-all z-10 [touch-action:manipulation]"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {/* Badge */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center -mt-10 mb-2 shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          <IconComp className="w-7 h-7 text-white" />
        </div>

        {/* Milestone number */}
        <p className="text-3xl font-black text-gray-900 dark:text-white leading-10">
          {milestone}
        </p>
        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
          Questions Answered
        </p>

        {/* Message */}
        <p className="text-lg font-black text-center mb-1" style={{ color: accentColor }}>
          {msg.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center leading-5 mb-5">
          {msg.subtitle}
        </p>

        {/* Accuracy */}
        <div
          className="w-[72px] h-[72px] rounded-full border-[3px] flex flex-col items-center justify-center mb-2"
          style={{ borderColor: accentColor }}
        >
          <p className="text-xl font-black" style={{ color: accentColor }}>
            {percentage}%
          </p>
          <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
            accuracy
          </p>
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold">
          {correct}/{total} correct
        </p>

        <button
          onClick={handleClose}
          className="mt-4 px-8 py-2.5 rounded-full text-white text-sm font-extrabold transition-all hover:opacity-90 active:scale-[0.97] [touch-action:manipulation]"
          style={{ backgroundColor: accentColor }}
        >
          Continue
        </button>
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
    <div className="w-full p-4 rounded-xl bg-card border border-border shadow-sm">
      {/* Category + Difficulty badges */}
      <div
        className={cn(
          "flex items-center gap-1.5 mb-2",
          isRtl && "flex-row-reverse",
        )}
      >
        {question.category && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider bg-primary/15 text-primary">
            {question.category.toUpperCase()}
          </span>
        )}
        {question.difficulty && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider",
              question.difficulty === "easy" && "bg-green-500/15 text-green-600 dark:text-green-400",
              question.difficulty === "hard" && "bg-red-500/15 text-red-600 dark:text-red-400",
              question.difficulty === "medium" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
            )}
          >
            {question.difficulty.toUpperCase()}
          </span>
        )}
      </div>

      {/* Question text */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
        <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">
          Question
        </p>
        <p
          className={cn(
            "text-base font-extrabold text-foreground leading-7",
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
            "w-full flex items-center gap-2 mb-3 px-2.5 py-2 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 active:scale-[0.98] transition-all [touch-action:manipulation]",
            isRtl && "flex-row-reverse",
          )}
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
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
          <ExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
        </button>
      )}

      {/* Options */}
      <div className="flex flex-wrap gap-2">
        <p className="w-full text-[11px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">
          Choose an answer
        </p>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer =
            disabled &&
            correctAnswerIndex != null &&
            correctAnswerIndex === index;
          const isWrongSelection =
            disabled && isSelected && correctAnswerIndex != null && !isCorrectAnswer;
          let isDimmed = disabled && !isCorrectAnswer && !isWrongSelection;
          const letter = optionLetters[index] || `${index + 1}`;

          let borderClass = "border-border";
          let bgClass = "bg-muted/30";
          let letterBgClass = "bg-card";
          let letterTextClass = "text-muted-foreground";
          let textClass = "text-foreground";

          if (disabled) {
            if (isCorrectAnswer) {
              borderClass = "border-green-500";
              bgClass = "bg-green-500/10";
              letterBgClass = "bg-green-500";
              letterTextClass = "text-white";
              textClass = "text-green-600 dark:text-green-400";
            } else if (isWrongSelection) {
              borderClass = "border-red-500";
              bgClass = "bg-red-500/10";
              letterBgClass = "bg-red-500";
              letterTextClass = "text-white";
              textClass = "text-red-600 dark:text-red-400";
            } else if (isSelected) {
              borderClass = "border-primary";
              bgClass = "bg-primary/10";
              letterBgClass = "bg-primary";
              letterTextClass = "text-white";
            } else {
              isDimmed = true;
            }
          } else if (isSelected) {
            borderClass = "border-primary";
            bgClass = "bg-primary/10";
            letterBgClass = "bg-primary";
            letterTextClass = "text-white";
          }

          return (
            <button
              key={index}
              onClick={() => onSelect(index)}
              disabled={disabled}
              className={cn(
                "relative w-[calc(50%-4px)] min-h-[96px] flex flex-col justify-between p-2.5 rounded-lg border-2 transition-all gap-2",
                borderClass,
                bgClass,
                isDimmed && "opacity-40",
                !disabled && "hover:border-primary/50 hover:bg-primary/5 cursor-pointer active:scale-[0.98]",
              )}
            >
              {/* Status icon */}
              {disabled && isCorrectAnswer && (
                <Check className="absolute top-2 right-2 w-5 h-5 text-green-500 stroke-[3]" />
              )}
              {disabled && isWrongSelection && (
                <X className="absolute top-2 right-2 w-5 h-5 text-red-500 stroke-[3]" />
              )}

              {/* Letter */}
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border text-xs font-black shrink-0",
                  letterBgClass,
                  letterTextClass,
                  borderClass,
                )}
              >
                {letter}
              </div>

              {/* Option text */}
              <p
                className={cn(
                  "text-xs font-bold leading-5 line-clamp-3 text-left",
                  textClass,
                  isRtl && "text-right flex-1",
                )}
              >
                {option}
              </p>
            </button>
          );
        })}
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

  if (!visible) return null;

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 p-3 mb-2 transition-all duration-200",
        result.isCorrect
          ? "border-green-500 bg-green-500/5"
          : "border-red-500 bg-red-500/5",
        animState === "entering" && "opacity-0 scale-90",
        animState === "visible" && "opacity-100 scale-100",
        animState === "exiting" && "opacity-0 scale-90",
      )}
    >
      {/* Close */}
      <button
        onClick={handleDismiss}
        className={cn(
          "absolute top-2 w-7 h-7 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full bg-muted/40 flex items-center justify-center hover:bg-muted/60 active:scale-[0.92] transition-all z-10 [touch-action:manipulation]",
          isRtl ? "left-2" : "right-2",
        )}
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {/* Header */}
      <div className={cn("flex items-center gap-2 mb-1.5", isRtl && "flex-row-reverse")}>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            result.isCorrect ? "bg-green-500/15" : "bg-red-500/15",
          )}
        >
          {result.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
        <div className={cn("flex-1", isRtl && "text-right")}>
          <p className="text-sm font-black" style={{ color: accentColor }}>
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
        <div className={cn("flex items-start gap-2 p-2 rounded bg-blue-500/10 mb-2", isRtl && "flex-row-reverse")}>
          <Lightbulb className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p className={cn("text-xs text-muted-foreground leading-5 flex-1", isRtl && "text-right")}>
            {result.explanation}
          </p>
        </div>
      )}

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="w-full py-3 rounded-full text-white text-xs font-extrabold text-center transition-all hover:opacity-90 active:scale-[0.98] [touch-action:manipulation]"
        style={{ backgroundColor: accentColor }}
      >
        Continue
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const DIFFICULTY_OPTIONS: {
  value: DifficultyFilter;
  label: string;
  desc: string;
  icon: any;
  color: string;
}[] = [
  { value: null, label: "All", desc: "Mixed levels", icon: Target, color: "#6366F1" },
  { value: "easy", label: "Easy", desc: "Beginner", icon: Sparkles, color: "#22C55E" },
  { value: "medium", label: "Medium", desc: "Balanced", icon: BookOpen, color: "#3B82F6" },
  { value: "hard", label: "Hard", desc: "Expert", icon: Zap, color: "#EF4444" },
];

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
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-primary/15 text-primary">
        {score.correct}/{score.total}
      </span>
    ) : undefined;

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 active:scale-[0.93] transition-all [touch-action:manipulation]"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1
                className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none"
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
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-16">
          {phase === "plan" ? (
            /* ══════════════════════════════════════════════
                PLAN SCREEN
               ══════════════════════════════════════════════ */
            <div className="flex flex-col gap-5">
              {/* Header section */}
              <div className="flex flex-col items-center pt-2 pb-2">
                <div className="w-[68px] h-[68px] rounded-full bg-primary/15 flex items-center justify-center mb-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-black text-foreground text-center mb-1">
                  Bible Knowledge Quiz
                </h2>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Test your knowledge of the Scriptures with fun trivia
                  questions!
                </p>
              </div>

              {/* Stats card */}
              {stats && stats.totalAnswered > 0 ? (
                <div className="rounded-xl border bg-card p-4">
                  <div
                    className={cn(
                      "flex items-center gap-2 mb-3",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <Trophy className="w-4 h-4 text-primary" />
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Your Performance
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex-1 text-center">
                      <p className="text-xl font-black text-green-500">
                        {stats.correct}
                      </p>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                        Correct
                      </p>
                    </div>
                    <div className="w-px h-9 bg-border" />
                    <div className="flex-1 text-center">
                      <p className="text-xl font-black text-foreground">
                        {stats.totalAnswered}
                      </p>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                        Total
                      </p>
                    </div>
                    <div className="w-px h-9 bg-border" />
                    <div className="flex-1 text-center">
                      <p className="text-xl font-black text-primary">
                        {stats.percentage}%
                      </p>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                        Accuracy
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border bg-card p-5 flex flex-col items-center gap-1.5">
                  <Trophy className="w-7 h-7 text-muted-foreground/50" />
                  <p className="text-sm font-bold text-foreground">
                    No stats yet
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Complete your first quiz to see your performance here!
                  </p>
                </div>
              )}

              {/* Difficulty selection */}
              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-0.5">
                    Question Level
                  </p>
                  <p className="text-base font-black text-foreground">
                    Choose your challenge
                  </p>
                </div>
                <p className="text-xs font-bold text-muted-foreground pb-0.5">
                  Tap one
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTY_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = difficulty === opt.value;

                  return (
                    <button
                      key={opt.value ?? "all"}
                      onClick={() => setDifficulty(opt.value)}
                      className={cn(
                        "min-h-[116px] flex flex-col justify-between p-3 rounded-xl border-2 transition-all text-left active:scale-[0.98] [touch-action:manipulation]",
                        isSelected
                          ? "border-[var(--opt-color)] bg-[var(--opt-color)]/10"
                          : "border-border bg-card hover:border-muted-foreground/30",
                      )}
                      style={{
                        ["--opt-color" as string]: opt.color,
                      } as React.CSSProperties}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="w-[38px] h-[38px] rounded-full flex items-center justify-center border"
                          style={{
                            backgroundColor: isSelected
                              ? opt.color
                              : `${opt.color}14`,
                            borderColor: isSelected
                              ? opt.color
                              : `${opt.color}35`,
                          }}
                        >
                          <IconComp
                            className="w-[17px] h-[17px]"
                            color={isSelected ? "#FFFFFF" : opt.color}
                          />
                        </div>
                        {isSelected && (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: opt.color }}
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p
                          className={cn(
                            "text-sm font-black",
                            isSelected
                              ? "text-[var(--opt-color)]"
                              : "text-foreground",
                          )}
                        >
                          {opt.label}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Start Quiz */}
              <button
                onClick={startQuiz}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/30"
              >
                <Play className="w-[18px] h-[18px] fill-current" />
                Start Quiz
              </button>

              <p className="text-[11px] text-muted-foreground text-center leading-5 px-3 pb-4">
                Questions are drawn from across the Bible. You can also tap a
                scripture reference to read the passage before answering.
              </p>
            </div>
          ) : (
            /* ══════════════════════════════════════════════
                GAME SCREEN
               ══════════════════════════════════════════════ */
            <>
              {/* Difficulty filter chips */}
              <div className="p-1.5 rounded-xl bg-card border border-border mb-3">
                <p className="px-2 pt-0.5 pb-1.5 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
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
                        ? { bg: "bg-green-500/15", text: "text-green-600 dark:text-green-400" }
                        : d === "hard"
                          ? { bg: "bg-red-500/15", text: "text-red-600 dark:text-red-400" }
                          : d === "medium"
                            ? { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400" }
                            : { bg: "bg-primary/10", text: "text-primary" };

                    return (
                      <button
                        key={d}
                        onClick={() =>
                          setDifficulty(d === "all" ? null : d)
                        }
                        className={cn(
                          "flex-1 min-h-[44px] py-2 rounded-lg text-[11px] font-extrabold text-center transition-all active:scale-[0.97] [touch-action:manipulation]",
                          isActive
                            ? `${chipColors.bg} ${chipColors.text}`
                            : "bg-muted/30 text-muted-foreground hover:bg-muted/50",
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
                <>
                  <div
                    className={cn(
                      "flex items-center gap-1 pt-2 pb-1.5",
                      isRtl && "flex-row-reverse",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1 flex-1",
                        isRtl && "flex-row-reverse",
                      )}
                    >
                      <p className="text-[10px] font-bold text-foreground">
                        Question {score.total + 1} of {totalCount}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {difficulty
                          ? difficulty.charAt(0).toUpperCase() +
                            difficulty.slice(1)
                          : "All"}
                      </p>
                    </div>
                    <p className="text-[10px] font-extrabold text-primary">
                      {Math.round((score.total / totalCount) * 100)}%
                    </p>
                  </div>
                  <div className="w-full h-[7px] rounded-full bg-border overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(score.total / totalCount) * 100}%`,
                      }}
                    />
                  </div>
                </>
              )}

              {/* Loading */}
              {loading && !question && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    Loading question...
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <p className="text-sm font-semibold text-destructive text-center">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQuestion}
                    className="gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Playing */}
              {phase === "playing" && question && (
                <div className="mb-1">
                  <TriviaQuestionCard
                    question={question}
                    selectedAnswer={selectedAnswer}
                    disabled={false}
                    isRtl={isRtl}
                    onSelect={handleSelect}
                    onReferencePress={handleReferencePress}
                  />
                  <div className="flex items-center justify-center mt-1.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30">
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
                <>
                  <div className="mb-1">
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
                        "flex items-center justify-center gap-1.5 mb-2 py-1.5 px-3 rounded-full self-center mx-auto w-fit bg-primary/10",
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
                          streak >= 3
                            ? "text-amber-500"
                            : "text-primary",
                        )}
                      >
                        {streak} in a row{streak >= 3 ? " 🔥" : ""}
                      </p>
                    </div>
                  )}

                  {/* Result area — min-h prevents layout shift when result card dismisses */}
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
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-extrabold text-sm transition-all hover:opacity-90 active:scale-[0.98] mb-3 [touch-action:manipulation]"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Next Question
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Finished */}
              {phase === "finished" && (
                <div className="flex flex-col items-center pt-4 gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                    <PartyPopper className="w-9 h-9 text-primary" />
                  </div>
                  <h2 className="text-lg font-black text-foreground text-center">
                    All Questions Completed!
                  </h2>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    You've answered every available question. Come back later for
                    more!
                  </p>

                  {/* Final score */}
                  <div className="w-full p-4 rounded-xl bg-card border flex flex-col items-center gap-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Final Score
                    </p>
                    <p className="text-xl font-black text-primary">
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
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        Lifetime: {stats.correct}/{stats.totalAnswered} (
                        {stats.percentage}%)
                      </p>
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] mt-1 [touch-action:manipulation]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Play Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

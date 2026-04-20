"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lightbulb,
  Loader2,
  RotateCcw,
  SkipForward,
  Star,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { sendPostRequest } from "@/services/api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Chapter {
  book: string;
  chapter: number;
}

interface QuizQuestion {
  questionId: number;
  question: string;
  options: string[];
  correctAnswer: number | string | null;
  explanation: string | null;
  userAnswer: number | null;
  isCorrect: boolean | null;
  numberAttempt?: number;
}

interface DailyAssignment {
  day: number;
  title: string;
  chapters: Chapter[];
  reflectionQuestions?: string[];
  quizQuestions?: QuizQuestion[];
  completed?: boolean;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const normalizeCorrectAnswer = (
  val: number | string | null | undefined,
): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  const upper = val.toString().trim().toUpperCase();
  if (upper.length === 1 && upper >= "A" && upper <= "D")
    return upper.charCodeAt(0) - 65;
  const n = parseInt(val.toString(), 10);
  return isNaN(n) ? null : n;
};

const getQuizPerformance = (correct: number, total: number) => {
  if (total === 0)
    return { label: "Complete!", emoji: "📖", color: "#6366F1", passed: false };
  const pct = (correct / total) * 100;
  if (correct === 0)
    return {
      label: "Keep Going!",
      emoji: "💪",
      color: "#F59E0B",
      passed: false,
    };
  if (pct < 50)
    return {
      label: "Good Effort!",
      emoji: "🌱",
      color: "#F97316",
      passed: false,
    };
  if (pct < 70)
    return {
      label: "Almost There!",
      emoji: "🔥",
      color: "#EAB308",
      passed: false,
    };
  if (pct < 100)
    return { label: "Well Done!", emoji: "⭐", color: "#10B981", passed: true };
  return {
    label: "Perfect Score!",
    emoji: "🏆",
    color: "#6366F1",
    passed: true,
  };
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const DailyReading = () => {
  const { planId, day } = useParams<{ planId: string; day: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const dayNum = parseInt(day || "1", 10);

  // Inject fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<DailyAssignment | null>(null);
  const [notYetAdded, setNotYetAdded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [planTitle, setPlanTitle] = useState("Reading Plan");
  const [totalDays, setTotalDays] = useState(0);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());
  const [autoNavigateTimer, setAutoNavigateTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(
    null,
  );
  const [revealedCorrectAnswer, setRevealedCorrectAnswer] = useState<
    number | null
  >(null);

  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ── Derived ──
  const hasQuiz =
    Array.isArray(assignment?.quizQuestions) &&
    assignment!.quizQuestions!.length > 0;
  const quizTotal = hasQuiz ? assignment!.quizQuestions!.length : 0;
  const activeQ =
    hasQuiz && !quizDone ? assignment!.quizQuestions![currentQ] : null;
  const canMarkComplete = !isCompleted && (!hasQuiz || quizDone);
  const accuracyPct =
    quizTotal > 0 ? Math.round((correctCount / quizTotal) * 100) : 0;
  const perf = getQuizPerformance(correctCount, quizTotal);
  const canGoPrev = dayNum > 1;
  const canGoNext = totalDays > 0 && dayNum < totalDays;
  const progressPct =
    totalDays > 0 ? Math.round(((dayNum - 1) / totalDays) * 100) : 0;

  // ── Data loading ──
  const loadPlanInfo = useCallback(async () => {
    try {
      const r = await sendPostRequest("reading-plans", "get-all", {});
      if (r?.returnCode === 200 && r.returnData) {
        const plans = r.returnData.plans ?? r.returnData;
        const meta = Array.isArray(plans)
          ? plans.find((p: any) => p.planId === planId)
          : null;
        if (meta) {
          setPlanTitle(meta.title || "Reading Plan");
          setTotalDays(meta.totalDays || meta.total_days || 0);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [planId]);

  const loadAssignment = useCallback(async () => {
    try {
      const r = await sendPostRequest("reading-plans", "daily-assignment", {
        planId,
        dayNumber: dayNum,
      });
      const { returnCode, returnData, returnMessage } = r;
      if (returnCode === 200 && returnData) {
        setNotYetAdded(false);
        setAssignment(returnData);
        setIsCompleted(returnData.completed ?? false);
        if (Array.isArray(returnData.quizQuestions)) {
          const newSubmitted = new Set<number>();
          let firstUnansweredIdx = 0;
          let hasUnanswered = false;
          returnData.quizQuestions.forEach((q: QuizQuestion, idx: number) => {
            if (q.userAnswer !== null) {
              newSubmitted.add(q.questionId);
            } else if (!hasUnanswered) {
              firstUnansweredIdx = idx;
              hasUnanswered = true;
            }
          });
          setSubmittedIds(newSubmitted);
          const total = returnData.quizQuestions.length;
          const answered = returnData.quizQuestions.filter(
            (q: QuizQuestion) => q.isCorrect !== null,
          );
          if (total > 0 && answered.length === total) {
            setCorrectCount(
              answered.filter((q: QuizQuestion) => q.isCorrect === true).length,
            );
            setQuizDone(true);
          } else if (hasUnanswered) {
            setCurrentQ(firstUnansweredIdx);
          }
        }
      } else if (returnCode === 404) {
        setNotYetAdded(true);
        setAssignment(null);
      } else {
        toast({
          title: "Failed to load",
          description: returnMessage,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, [planId, dayNum, toast]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await loadAssignment();
      await loadPlanInfo();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loadAssignment, loadPlanInfo]);

  // ── Quiz actions ──
  const jumpToQuestion = useCallback(
    (idx: number) => {
      if (!assignment?.quizQuestions) return;
      const target = assignment.quizQuestions[idx];
      setCurrentQ(idx);
      setRevealedCorrectAnswer(normalizeCorrectAnswer(target.correctAnswer));
      if (target.userAnswer !== null && target.userAnswer !== undefined) {
        setSelected(target.userAnswer);
        setShowResult(true);
        setIsReviewing(true);
      } else {
        setSelected(null);
        setShowResult(false);
        setIsReviewing(false);
      }
    },
    [assignment],
  );

  const handleNext = useCallback(() => {
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
      setAutoNavigateTimer(null);
    }
    if (!assignment?.quizQuestions) return;
    setShowResult(false);
    setSelected(null);
    setLastAnswerCorrect(null);
    setRevealedCorrectAnswer(null);
    if (currentQ < assignment.quizQuestions.length - 1) {
      jumpToQuestion(currentQ + 1);
    } else {
      setQuizDone(true);
      setIsReviewing(false);
    }
  }, [autoNavigateTimer, assignment, currentQ, jumpToQuestion]);

  const handleSubmit = useCallback(async () => {
    if (selected === null || !assignment?.quizQuestions || isSubmitting) return;
    const q = assignment.quizQuestions[currentQ];
    if (q.userAnswer !== null && q.userAnswer === selected) {
      setShowResult(true);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await sendPostRequest("reading-plans", "submit-answer", {
        planId,
        dayNumber: dayNum,
        questionId: q.questionId,
        userAnswer: selected,
      });
      if (res?.returnCode === 200 && res.returnData) {
        const { isCorrect, correctAnswer, explanation, numberAttempt } =
          res.returnData;
        setLastAnswerCorrect(isCorrect);
        if (isCorrect) setCorrectCount((p) => p + 1);
        const normalizedCorrect = normalizeCorrectAnswer(correctAnswer);
        if (normalizedCorrect !== null)
          setRevealedCorrectAnswer(normalizedCorrect);
        setSubmittedIds((prev) => new Set(prev).add(q.questionId));
        setAssignment((prev) => {
          if (!prev?.quizQuestions) return prev;
          const qs = [...prev.quizQuestions];
          qs[currentQ] = {
            ...qs[currentQ],
            correctAnswer: normalizedCorrect ?? qs[currentQ].correctAnswer,
            explanation: explanation ?? qs[currentQ].explanation,
            userAnswer: selected,
            isCorrect,
            numberAttempt: numberAttempt ?? qs[currentQ].numberAttempt ?? 0,
          };
          return { ...prev, quizQuestions: qs };
        });
        if (isCorrect && currentQ < assignment.quizQuestions.length - 1) {
          const timer = setTimeout(() => {
            setShowResult(false);
            setSelected(null);
            setCurrentQ((q) => q + 1);
            setLastAnswerCorrect(null);
          }, 3500);
          setAutoNavigateTimer(timer);
        }
      } else if (res?.returnMessage) {
        toast({
          title: "Error",
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setShowResult(true);
    }
  }, [selected, assignment, isSubmitting, currentQ, planId, dayNum, toast]);

  // ── Effects ──
  useEffect(() => {
    loadData();
  }, [dayNum]); // eslint-disable-line

  useEffect(() => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setIsReviewing(false);
    setQuizDone(false);
    setCorrectCount(0);
    setSubmittedIds(new Set());
    setNotYetAdded(false);
    setShowConfetti(false);
    setLastAnswerCorrect(null);
    setRevealedCorrectAnswer(null);
    setAutoNavigateTimer((prev) => {
      if (prev) clearTimeout(prev);
      return null;
    });
  }, [dayNum]);

  useEffect(() => {
    if (!hasQuiz || quizDone || loading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const total = activeQ?.options.length ?? 0;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        if (!showResult && selected !== null && selected < total - 1)
          setSelected((s) => (s !== null ? s + 1 : 0));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!showResult && selected !== null && selected > 0)
          setSelected((s) => (s !== null ? s - 1 : 0));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!showResult && selected !== null) handleSubmit();
        else if (showResult) handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    hasQuiz,
    quizDone,
    loading,
    selected,
    showResult,
    activeQ,
    handleSubmit,
    handleNext,
  ]);

  useEffect(() => {
    return () => {
      if (autoNavigateTimer) clearTimeout(autoNavigateTimer);
    };
  }, [autoNavigateTimer]);

  useEffect(() => {
    if (quizDone && hasQuiz && !showConfetti) {
      const t = setTimeout(() => setShowConfetti(true), 300);
      return () => clearTimeout(t);
    }
  }, [quizDone, hasQuiz, showConfetti]);

  // ── Handlers ──
  const markComplete = async () => {
    if (isCompleted) {
      toast({
        title: "Already Completed",
        description: `Day ${dayNum} was marked as complete earlier.`,
      });
      return;
    }
    try {
      const r = await sendPostRequest("reading-plans", "complete-day", {
        planId,
        dayNumber: dayNum,
      });
      if (r.returnCode === 200) {
        setIsCompleted(true);
        toast({
          title: "Day Complete!",
          description: `Day ${dayNum} marked as done!`,
        });
        loadData();
      } else if (r.returnMessage?.includes("already completed")) {
        setIsCompleted(true);
        toast({
          title: "Already Completed",
          description: `Day ${dayNum} was marked as complete.`,
        });
      } else {
        toast({
          title: "Error",
          description: r.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const navigateDay = (dir: "prev" | "next") => {
    if (dir === "next" && !isCompleted) {
      toast({
        title: "Complete Today's Reading First",
        description:
          "Finish the quiz or mark as done before moving to the next day.",
        variant: "destructive",
      });
      return;
    }
    const nd = dir === "prev" ? dayNum - 1 : dayNum + 1;
    if (nd >= 1 && nd <= totalDays) navigate(`/daily-reading/${planId}/${nd}`);
  };

  const handleSelect = (idx: number) => {
    if (isReviewing) {
      setIsReviewing(false);
      setShowResult(false);
      setSelected(idx);
      return;
    }
    if (!showResult) setSelected(idx);
  };

  const cancelAutoNavigate = () => {
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
      setAutoNavigateTimer(null);
    }
  };

  const retryQuiz = () => {
    const already =
      assignment?.quizQuestions?.filter((q) => q.isCorrect === true).length ??
      0;
    setCorrectCount(already);
    setQuizDone(false);
    jumpToQuestion(0);
  };

  // ── Confetti ──
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10px",
            backgroundColor: [
              "#10B981",
              "#8B5CF6",
              "#F59E0B",
              "#EF4444",
              "#3B82F6",
              "#EC4899",
            ][Math.floor(Math.random() * 6)],
            animation: `confetti-fall ${1.5 + Math.random()}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );

  // ─────────────────────────────────────────────
  // Loading / Not yet added
  // ─────────────────────────────────────────────
  if (loading || notYetAdded || !assignment) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-background border-b border-border/40 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1
                className="text-base font-semibold text-foreground"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {loading ? "Loading…" : `Day ${dayNum}`}
              </h1>
              <p className="text-xs text-muted-foreground">{planTitle}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/40 p-5 animate-pulse"
                >
                  <div className="h-3 bg-muted rounded w-1/4 mb-4" />
                  <div className="h-16 bg-muted/50 rounded-xl" />
                </div>
              ))}
            </div>
          ) : notYetAdded ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3
                className="text-base font-semibold text-foreground mb-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Coming Soon
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Day {dayNum}'s reading assignment hasn't been added yet.
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border/40 bg-background px-5 py-3 flex gap-3">
          <NavButton
            dir="prev"
            disabled={!canGoPrev}
            onClick={() => navigateDay("prev")}
          />
          <NavButton
            dir="next"
            disabled={!canGoNext}
            onClick={() => navigateDay("next")}
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <div className="bg-background border-b border-border/40 sticky top-0 z-30">
        <div className="px-5 pt-4 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1
                  className="text-base font-semibold text-foreground leading-snug"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {assignment.title || `Day ${dayNum}`}
                </h1>
                <p className="text-xs text-muted-foreground">{planTitle}</p>
              </div>
            </div>

            <button
              onClick={canMarkComplete ? markComplete : undefined}
              disabled={!canMarkComplete}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0",
                isCompleted
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                  : canMarkComplete
                    ? "bg-muted hover:bg-muted/80 text-foreground border border-border/50"
                    : "bg-muted/40 text-muted-foreground cursor-not-allowed border border-border/30",
              )}
            >
              {isCompleted ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              {isCompleted ? "Done" : "Mark Done"}
            </button>
          </div>
        </div>

        {totalDays > 0 && (
          <div className="px-5 pb-3 flex items-center gap-3">
            <span
              className="text-[11px] font-medium text-muted-foreground whitespace-nowrap"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Day {dayNum} / {totalDays}
            </span>
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {progressPct}%
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-5 py-6 pb-24 space-y-5 max-w-2xl mx-auto w-full">
        {/* Chapters */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span
              className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Today's Reading
            </span>
          </div>
          <div className="p-4 space-y-2.5">
            {assignment.chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() =>
                  navigate(
                    `/bible-reader?book=${encodeURIComponent(ch.book)}&chapter=${ch.chapter}`,
                  )
                }
                className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <BookOpen className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-foreground text-sm"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {ch.book} {ch.chapter}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tap to read
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Reflection (no quiz) */}
        {!hasQuiz &&
          Array.isArray(assignment.reflectionQuestions) &&
          assignment.reflectionQuestions.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border/40">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span
                  className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Reflection
                </span>
              </div>
              <div className="p-4 space-y-3">
                {assignment.reflectionQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p
                      className="text-sm text-foreground/80 leading-relaxed"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* ── Quiz ── */}
        {hasQuiz && !quizDone && activeQ && (
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {showConfetti && <Confetti />}

            {/* Quiz header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-violet-500" />
                <span
                  className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Knowledge Check
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {currentQ + 1}/{quizTotal}
              </span>
            </div>

            <div className="p-5">
              {/* Review banner */}
              {isReviewing && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs text-blue-700 dark:text-blue-400">
                    Review mode — tap an option to retry this question
                  </span>
                </div>
              )}

              {/* Auto-advance banner */}
              {autoNavigateTimer && lastAnswerCorrect && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ Moving to next question…
                  </span>
                  <button
                    onClick={cancelAutoNavigate}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Question */}
              <div className="mb-5 p-4 rounded-xl bg-muted/30 border border-border/30">
                <p
                  className="text-base font-medium text-foreground leading-relaxed"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {activeQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {activeQ.options.map((opt, idx) => {
                  const isSel = selected === idx;
                  const correctIdx =
                    revealedCorrectAnswer ??
                    normalizeCorrectAnswer(activeQ.correctAnswer);
                  const isCorrectOpt = showResult && correctIdx === idx;
                  const isWrongSel = showResult && isSel && !isCorrectOpt;

                  return (
                    <button
                      key={idx}
                      ref={(el) => {
                        optionRefs.current[idx] = el;
                      }}
                      onClick={() => handleSelect(idx)}
                      disabled={showResult && !isReviewing}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                        isCorrectOpt
                          ? "border-emerald-500 bg-emerald-500/20 dark:bg-emerald-500/25 shadow-md shadow-emerald-500/10"
                          : isWrongSel
                            ? "border-red-500 bg-red-500/15 dark:bg-red-500/20 shadow-md shadow-red-500/10"
                            : isSel && !showResult
                              ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                              : "border-border/40 bg-muted/20 hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-950/20",
                        showResult && !isReviewing && "cursor-default",
                      )}
                    >
                      <span
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200",
                          isCorrectOpt
                            ? "bg-emerald-500 text-white"
                            : isWrongSel
                              ? "bg-red-500 text-white"
                              : isSel && !showResult
                                ? "bg-violet-500 text-white"
                                : "bg-muted text-muted-foreground",
                        )}
                      >
                        {showResult && isCorrectOpt ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : showResult && isWrongSel ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </span>

                      <span
                        className={cn(
                          "flex-1 text-sm leading-snug font-medium",
                          isCorrectOpt
                            ? "text-emerald-900 dark:text-emerald-200"
                            : isWrongSel
                              ? "text-red-900 dark:text-red-200"
                              : "text-foreground",
                        )}
                      >
                        {opt}
                      </span>

                      {showResult && isCorrectOpt && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                          ✓ Correct
                        </span>
                      )}
                      {showResult && isWrongSel && (
                        <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                          ✗ Wrong
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showResult && activeQ.explanation && (
                <div
                  className={cn(
                    "mb-5 p-4 rounded-xl border-l-4",
                    selected === normalizeCorrectAnswer(activeQ.correctAnswer)
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500"
                      : "bg-red-50 dark:bg-red-950/30 border-red-500",
                  )}
                >
                  <p
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wider mb-1.5",
                      selected === normalizeCorrectAnswer(activeQ.correctAnswer)
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {selected === normalizeCorrectAnswer(activeQ.correctAnswer)
                      ? "✓ Correct!"
                      : "✗ Incorrect"}
                  </p>
                  <p
                    className="text-sm text-foreground/80 leading-relaxed"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {activeQ.explanation}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              {isReviewing ? (
                <button
                  onClick={() => {
                    if (currentQ < quizTotal - 1) jumpToQuestion(currentQ + 1);
                    else {
                      setQuizDone(true);
                      setIsReviewing(false);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition-all shadow-md shadow-violet-500/20"
                >
                  {currentQ < quizTotal - 1 ? "Next Question" : "See Results"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : showResult ? (
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 active:scale-[0.98] transition-all shadow-md shadow-violet-500/20"
                >
                  {currentQ < quizTotal - 1 ? "Next Question" : "See Results"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2.5">
                  {assignment.quizQuestions![currentQ].userAnswer !== null && (
                    <button
                      onClick={() => {
                        if (currentQ < quizTotal - 1)
                          jumpToQuestion(currentQ + 1);
                        else {
                          setQuizDone(true);
                          setIsReviewing(false);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 border-border/50 text-muted-foreground text-sm font-medium hover:bg-muted/40 hover:text-foreground active:scale-[0.98] transition-all"
                    >
                      <SkipForward className="w-4 h-4" /> Skip this question
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={selected === null || isSubmitting}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]",
                      selected !== null && !isSubmitting
                        ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20"
                        : "bg-muted/60 text-muted-foreground cursor-not-allowed",
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Checking…
                      </>
                    ) : assignment.quizQuestions![currentQ].userAnswer !==
                      null ? (
                      "Update Answer"
                    ) : (
                      "Submit Answer"
                    )}
                  </button>
                  <p className="text-xs text-center text-muted-foreground/50">
                    ← → to select · Enter to submit
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Quiz results ── */}
        {hasQuiz && quizDone && (
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {showConfetti && <Confetti />}

            {/* Results header */}
            <div className="flex items-center justify-center gap-2 px-5 py-4 border-b border-border/40">
              <Star className="w-3.5 h-3.5" style={{ color: perf.color }} />
              <span
                className="text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: perf.color, fontFamily: "'Cinzel', serif" }}
              >
                Quiz Complete
              </span>
              <Star className="w-3.5 h-3.5" style={{ color: perf.color }} />
            </div>

            <div className="p-5">
              {/* Score ring */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-28 h-28 mb-4">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-muted/40"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      stroke={perf.color}
                      strokeDasharray={`${(correctCount / quizTotal) * 263.9} 263.9`}
                      style={{ transition: "stroke-dasharray 1s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl leading-none">{perf.emoji}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: perf.color }}
                    >
                      {correctCount}/{quizTotal}
                    </span>
                  </div>
                </div>

                <h2
                  className="text-lg font-semibold text-foreground mb-1"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {perf.label}
                </h2>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {accuracyPct}% accuracy
                  </span>
                </div>
                <p
                  className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {correctCount === 0
                    ? "Don't worry — re-read the passages and try again."
                    : accuracyPct < 50
                      ? "A solid start! Review the chapters to deepen your understanding."
                      : accuracyPct < 70
                        ? "You're close! A quick re-read will push you over the line."
                        : accuracyPct < 100
                          ? "Great understanding of the reading. Keep the momentum going!"
                          : "Flawless! Outstanding grasp of this passage."}
                </p>
              </div>

              {/* Score badges */}
              <div className="flex justify-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {correctCount} Correct
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    {quizTotal - correctCount} Wrong
                  </span>
                </div>
              </div>

              {/* Question summary — single, correct block */}
              <div className="rounded-xl border border-border/40 overflow-hidden mb-5">
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border/40 sticky top-0 z-10">
                  <span
                    className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Question Summary
                  </span>
                </div>
                <div className="divide-y divide-border/30 max-h-[40vh] overflow-y-auto">
                  {assignment.quizQuestions!.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCorrectCount(
                          assignment.quizQuestions!.filter(
                            (qq) => qq.isCorrect === true,
                          ).length,
                        );
                        setShowConfetti(false);
                        setQuizDone(false);
                        setIsReviewing(true);
                        jumpToQuestion(idx);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          q.isCorrect === true
                            ? "bg-emerald-500 text-white"
                            : q.isCorrect === false
                              ? "bg-red-500 text-white"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {q.isCorrect === true
                          ? "✓"
                          : q.isCorrect === false
                            ? "✗"
                            : "?"}
                      </span>
                      <span className="flex-1 text-sm text-foreground truncate">
                        Q{idx + 1}: {q.question}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {q.numberAttempt && q.numberAttempt > 1 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium">
                            {q.numberAttempt} tries
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setShowConfetti(false);
                    retryQuiz();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 text-foreground text-sm font-medium hover:bg-muted/40 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Review & Retry
                </button>

                {canMarkComplete && (
                  <button
                    onClick={markComplete}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Day {dayNum} Complete
                  </button>
                )}

                {isCompleted && (
                  <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-medium p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
                    <CheckCircle className="w-4 h-4" /> Day {dayNum} completed
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


       

        {/* Mark complete (no quiz) */}
        {canMarkComplete && !hasQuiz && (
          <button
            onClick={markComplete}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
          >
            <CheckCircle className="w-4 h-4" /> Mark Day {dayNum} Complete
          </button>
        )}
        {isCompleted && !hasQuiz && (
          <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-medium p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/40">
            <CheckCircle className="w-4 h-4" /> Day {dayNum} completed
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border/30 px-4 py-3 flex items-center justify-between gap-3 z-20">
        <NavButton
          dir="prev"
          disabled={!canGoPrev}
          onClick={() => navigateDay("prev")}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{dayNum}</span>
          <span className="text-border">/</span>
          <span>{totalDays}</span>
        </div>
        <NavButton
          dir="next"
          disabled={!canGoNext}
          onClick={() => navigateDay("next")}
        />
      </div>
    </div>
  );
};

// ── Nav button ──
function NavButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = dir === "prev";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-[0.95]",
        !disabled
          ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          : "bg-muted/50 text-muted-foreground/40 cursor-not-allowed border border-muted/20",
      )}
    >
      {isPrev && <ChevronLeft className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{isPrev ? "Previous" : "Next"}</span>
      <span className="sm:hidden">{isPrev ? "Prev" : "Next"}</span>
      {!isPrev && <ChevronRight className="w-3.5 h-3.5" />}
    </button>
  );
}

export default DailyReading;

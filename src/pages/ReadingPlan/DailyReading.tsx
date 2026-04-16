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
  correctAnswer: number | null;
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
// Helper
// ─────────────────────────────────────────────
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

  // ── State ──────────────────────────────────────
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

  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ── Derived values (declared before effects that reference them) ──
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

  // ── Data loading ──────────────────────────────
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
          returnData.quizQuestions.forEach((q: QuizQuestion) => {
            if (q.userAnswer !== null) newSubmitted.add(q.questionId);
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

  // ── Quiz actions (declared before keyboard effect) ─────────────
  const jumpToQuestion = useCallback(
    (idx: number) => {
      if (!assignment?.quizQuestions) return;
      const target = assignment.quizQuestions[idx];
      setCurrentQ(idx);
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

    // Already answered with the same choice — just show result
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

        setSubmittedIds((prev) => new Set(prev).add(q.questionId));

        setAssignment((prev) => {
          if (!prev?.quizQuestions) return prev;
          const qs = [...prev.quizQuestions];
          qs[currentQ] = {
            ...qs[currentQ],
            correctAnswer: correctAnswer ?? qs[currentQ].correctAnswer,
            explanation: explanation ?? qs[currentQ].explanation,
            userAnswer: selected,
            isCorrect,
            numberAttempt: numberAttempt ?? qs[currentQ].numberAttempt ?? 0,
          };
          return { ...prev, quizQuestions: qs };
        });

        // Auto-advance on correct answer
        if (isCorrect && currentQ < assignment.quizQuestions.length - 1) {
          const timer = setTimeout(() => {
            setShowResult(false);
            setSelected(null);
            setCurrentQ((q) => q + 1);
            setLastAnswerCorrect(null);
          }, 1500);
          setAutoNavigateTimer(timer);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setShowResult(true);
    }
  }, [selected, assignment, isSubmitting, currentQ, planId, dayNum]);

  // ── Effects ───────────────────────────────────
  useEffect(() => {
    loadData();
  }, [dayNum]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Reset quiz state on day change
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
    setAutoNavigateTimer((prev) => {
      if (prev) clearTimeout(prev);
      return null;
    });
  }, [dayNum]);

  // Keyboard navigation
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

  // Cleanup auto-navigate timer on unmount
  useEffect(() => {
    return () => {
      if (autoNavigateTimer) clearTimeout(autoNavigateTimer);
    };
  }, [autoNavigateTimer]);

  // Confetti on quiz completion
  useEffect(() => {
    if (quizDone && hasQuiz && !showConfetti) {
      const t = setTimeout(() => setShowConfetti(true), 300);
      return () => clearTimeout(t);
    }
  }, [quizDone, hasQuiz, showConfetti]);

  // ── Handlers ──────────────────────────────────
  const markComplete = async () => {
    if (isCompleted) return;
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
        title: "Complete today's reading first",
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

  // ── Shared sub-components ──────────────────────
  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full"
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

  const DayNavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 flex gap-3">
      <button
        onClick={() => navigateDay("prev")}
        disabled={!canGoPrev}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors",
          canGoPrev
            ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
            : "bg-stone-50 text-stone-300 cursor-not-allowed",
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      <button
        onClick={() => navigateDay("next")}
        disabled={!canGoNext}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors",
          canGoNext
            ? "bg-teal-600 text-white hover:bg-teal-700"
            : "bg-stone-50 text-stone-300 cursor-not-allowed",
        )}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  // ── Loading / Not yet added ────────────────────
  if (loading || notYetAdded || !assignment) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="bg-white border-b border-stone-200 px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-xl font-bold text-stone-800">
            {loading ? "Loading…" : `Day ${dayNum}`}
          </h1>
          <p className="text-sm text-stone-500">{planTitle}</p>
        </div>

        <div className="bg-white border-b border-stone-200 px-6 py-3">
          <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
            Day {dayNum} {totalDays > 0 ? `/ ${totalDays}` : ""}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-stone-200 rounded w-1/3 mb-3" />
                <div className="h-16 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : notYetAdded ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">
              Coming Soon
            </h3>
            <p className="text-sm text-stone-500 text-center">
              Day {dayNum}'s reading assignment hasn't been added yet.
            </p>
          </div>
        ) : null}

        <DayNavBar />
      </div>
    );
  }

  // ── Main render ────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-xl font-bold text-stone-800">
          {assignment.title || `Day ${dayNum}`}
        </h1>
        <p className="text-sm text-stone-500">{planTitle}</p>
      </div>

      {/* Day strip */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
            Day {dayNum} {totalDays > 0 ? `/ ${totalDays}` : ""}
          </span>
          {totalDays > 0 && (
            <div className="h-1.5 w-32 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 rounded-full transition-all"
                style={{
                  width: `${Math.round(((dayNum - 1) / totalDays) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
        <button
          onClick={canMarkComplete ? markComplete : undefined}
          disabled={!canMarkComplete}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
            isCompleted
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : canMarkComplete
                ? "bg-stone-100 text-stone-700 hover:bg-stone-200"
                : "bg-stone-50 text-stone-300 cursor-not-allowed",
          )}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Done
            </>
          ) : (
            <>
              <Circle className="w-4 h-4" />
              Mark Done
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 pb-24 space-y-6">
        {/* Chapters */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-teal-500 rounded-full" />
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Today's Reading
            </span>
          </div>
          <div className="space-y-3">
            {assignment.chapters.map((ch, idx) => (
              <button
                key={idx}
                onClick={() =>
                  navigate(
                    `/bible-reader?book=${encodeURIComponent(ch.book)}&chapter=${ch.chapter}`,
                  )
                }
                className="w-full flex items-center gap-4 p-3 rounded-xl border border-stone-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800">
                    {ch.book} {ch.chapter}
                  </p>
                  <p className="text-xs text-stone-500">Tap to read</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Reflection questions (no quiz) */}
        {!hasQuiz &&
          Array.isArray(assignment.reflectionQuestions) &&
          assignment.reflectionQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-amber-500 rounded-full" />
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Reflection Questions
                </span>
              </div>
              <div className="space-y-3">
                {assignment.reflectionQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 rounded-xl bg-amber-50/50 border-l-4 border-teal-500"
                  >
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Quiz */}
        {hasQuiz && !quizDone && activeQ && (
          <div className="bg-gradient-to-br from-white via-violet-50/30 to-white rounded-2xl border border-violet-200 shadow-lg shadow-violet-100/50 p-5">
            {showConfetti && <Confetti />}

            {/* Review banner */}
            {isReviewing && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  Review mode — tap a dot to jump, or tap an option to retry
                </span>
              </div>
            )}

            {/* Quiz header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-violet-500 rounded-full" />
                <Star className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Knowledge Check
                </span>
              </div>

              {/* Circular progress */}
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(submittedIds.size / quizTotal) * 100}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-700">
                    {submittedIds.size}/{quizTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Question dots */}
            <div className="flex gap-1.5 mb-5 justify-center flex-wrap">
              {assignment.quizQuestions!.map((q, i) => (
                <button
                  key={i}
                  onClick={() => jumpToQuestion(i)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    i === currentQ && q.userAnswer === null
                      ? "bg-violet-500 ring-2 ring-violet-300 scale-125"
                      : q.isCorrect === true
                        ? "bg-emerald-500"
                        : q.isCorrect === false
                          ? "bg-red-500"
                          : "bg-stone-200 hover:bg-stone-300",
                  )}
                />
              ))}
            </div>

            {/* Auto-navigate indicator */}
            {autoNavigateTimer && lastAnswerCorrect && (
              <div className="mb-4 p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700">
                  ✓ Next question in 1.5s…
                </span>
                <button
                  onClick={cancelAutoNavigate}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Question card */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 mb-5 border border-violet-100">
              <p className="text-lg font-semibold text-stone-800 leading-relaxed">
                {activeQ.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-5">
              {activeQ.options.map((opt, idx) => {
                const isSel = selected === idx;
                const isCorrectOpt =
                  showResult && activeQ.correctAnswer === idx;
                const isWrong = showResult && isSel && !isCorrectOpt;

                return (
                  <button
                    key={idx}
                    ref={(el) => {
                      optionRefs.current[idx] = el;
                    }}
                    onClick={() => handleSelect(idx)}
                    disabled={showResult && !isReviewing}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                      isCorrectOpt
                        ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                        : isWrong
                          ? "border-red-500 bg-red-50 shadow-md shadow-red-100"
                          : isSel && !showResult
                            ? "border-violet-500 bg-violet-50 shadow-md shadow-violet-100 scale-[1.02]"
                            : "border-stone-200 hover:border-violet-300 hover:bg-violet-50/50 hover:scale-[1.01]",
                      showResult && !isReviewing && "cursor-default",
                    )}
                  >
                    <span
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0 transition-all duration-300",
                        isCorrectOpt
                          ? "bg-emerald-500 text-white scale-110"
                          : isWrong
                            ? "bg-red-500 text-white scale-110"
                            : isSel && !showResult
                              ? "bg-violet-500 text-white scale-110"
                              : "bg-stone-100 text-stone-600",
                      )}
                    >
                      {showResult && isCorrectOpt ? (
                        <CheckCircle className="w-5 h-5 animate-bounce" />
                      ) : showResult && isWrong ? (
                        <XCircle className="w-5 h-5 animate-bounce" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-base",
                        isCorrectOpt
                          ? "text-emerald-700 font-medium"
                          : isWrong
                            ? "text-red-700 font-medium"
                            : "text-stone-700",
                      )}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showResult && activeQ.explanation && (
              <div
                className={cn(
                  "mb-5 p-4 rounded-xl border-l-4 shadow-md",
                  selected === activeQ.correctAnswer
                    ? "bg-emerald-50 border-emerald-500"
                    : "bg-red-50 border-red-500",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider mb-1",
                    selected === activeQ.correctAnswer
                      ? "text-emerald-700"
                      : "text-red-700",
                  )}
                >
                  {selected === activeQ.correctAnswer
                    ? "✓ Correct!"
                    : "✗ Incorrect"}
                </p>
                <p className="text-sm text-stone-700 leading-relaxed">
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
              >
                {currentQ < quizTotal - 1 ? "Next Question" : "See Results"}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : showResult ? (
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
              >
                {currentQ < quizTotal - 1 ? "Next Question" : "See Results"}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-3">
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={selected === null || isSubmitting}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200",
                    selected !== null && !isSubmitting
                      ? "bg-violet-600 text-white hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-200"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed",
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking…
                    </>
                  ) : assignment.quizQuestions![currentQ].userAnswer !==
                    null ? (
                    "Update Answer"
                  ) : (
                    "Submit Answer"
                  )}
                </button>
                <p className="text-xs text-center text-stone-400">
                  Use ← → arrow keys to select, Enter to submit
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quiz results */}
        {hasQuiz && quizDone && (
          <div className="bg-gradient-to-br from-white via-violet-50/30 to-white rounded-2xl border border-violet-200 shadow-lg shadow-violet-100/50 p-6">
            {showConfetti && <Confetti />}

            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-5 h-5" style={{ color: perf.color }} />
              <span
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: perf.color }}
              >
                Quiz Complete!
              </span>
              <Star className="w-5 h-5" style={{ color: perf.color }} />
            </div>

            {/* Score ring */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4 shadow-lg"
                style={{
                  borderColor: perf.color + "20",
                  backgroundColor: perf.color + "10",
                }}
              >
                <div
                  className="w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center bg-white"
                  style={{ borderColor: perf.color }}
                >
                  <span className="text-3xl animate-bounce">{perf.emoji}</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: perf.color }}
                  >
                    {correctCount}/{quizTotal}
                  </span>
                </div>
              </div>
              <p className="text-xl font-bold text-stone-800">{perf.label}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100">
                <span className="text-sm font-medium text-stone-600">
                  {accuracyPct}% accuracy
                </span>
              </div>
              <p className="text-sm text-stone-500 mt-3 max-w-sm mx-auto">
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

            {/* Badges */}
            <div className="flex justify-center gap-3 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">
                  {correctCount} Correct
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  {quizTotal - correctCount} Wrong
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-stone-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                Question Summary
              </p>
              <div className="space-y-2">
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
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                      q.isCorrect === true
                        ? "hover:bg-emerald-100 bg-emerald-50/50"
                        : q.isCorrect === false
                          ? "hover:bg-red-100 bg-red-50/50"
                          : "hover:bg-stone-200",
                    )}
                  >
                    <span
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        q.isCorrect === true
                          ? "bg-emerald-500 text-white"
                          : q.isCorrect === false
                            ? "bg-red-500 text-white"
                            : "bg-stone-300 text-white",
                      )}
                    >
                      {q.isCorrect === true
                        ? "✓"
                        : q.isCorrect === false
                          ? "✗"
                          : "?"}
                    </span>
                    <span className="flex-1 text-sm text-stone-700 truncate">
                      Q{idx + 1}: {q.question}
                    </span>
                    <div className="flex items-center gap-2">
                      {q.numberAttempt && q.numberAttempt > 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                          {q.numberAttempt} tries
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                setShowConfetti(false);
                retryQuiz();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-violet-200 text-violet-700 font-semibold hover:bg-violet-50 transition-all mb-3"
            >
              <RotateCcw className="w-4 h-4" />
              Review & Retry Answers
            </button>

            {canMarkComplete && (
              <button
                onClick={markComplete}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-200"
              >
                <CheckCircle className="w-5 h-5" />
                Mark Day {dayNum} Complete
              </button>
            )}

            {isCompleted && (
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold p-3 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                Day {dayNum} completed ✓
              </div>
            )}
          </div>
        )}

        {/* Mark complete (no quiz) */}
        {canMarkComplete && !hasQuiz && (
          <button
            onClick={markComplete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Day {dayNum} Complete
          </button>
        )}
        {isCompleted && !hasQuiz && (
          <div className="flex items-center justify-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle className="w-4 h-4" />
            Day {dayNum} completed ✓
          </div>
        )}
      </div>

      <DayNavBar />
    </div>
  );
};

export default DailyReading;

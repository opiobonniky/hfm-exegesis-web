// useDailyReadingPage — comprehensive hook for DailyReading page
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useLanguage } from "@/components/languages/languageProvider";

interface Chapter { id: number; bookName: string; chapter: number; completed: boolean; }
interface Reflection { id: number; question: string; reflectionText: string; }
interface QuizQuestion { id: number; question: string; options: string[]; correctAnswer: number; }
interface DailyAssignment {
  planId: string; dayNumber: number; chapters: Chapter[];
  reflectionPrompt: string; reflections: Reflection[];
  quizQuestions: QuizQuestion[]; ponderNotes: string;
}
interface SubmissionRecord { planId: string; dayNumber: number; completedAt: string; }

export function useDailyReadingPage() {
  const navigate = useNavigate();
  const { planId, day } = useParams();
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<DailyAssignment | null>(null);
  const [notYetAdded, setNotYetAdded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [ponderedReflections, setPonderedReflections] = useState<Set<number>>(new Set());
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [revealedCorrectAnswer, setRevealedCorrectAnswer] = useState<number | null>(null);

  const dayNumber = Number(day) || 1;
  const currentDayIdx = dayNumber - 1;

  const planTitleText = useMemo(() => planTitle || t.readingPlan?.dailyReadingTitle || "Daily Reading", [planTitle, t]);

  useEffect(() => {
    if (!planId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setNotYetAdded(false);
      try {
        const res = await sendPostRequest("reading-plans", "get-plan-assignments", { planId, dayNumber });
        if (cancelled) return;
        if (res?.returnCode === 200 && res.returnData) {
          setAssignment(res.returnData);
          setPlanTitle(res.returnData.planTitle || "Reading Plan");
          setTotalDays(res.returnData.totalDays || 0);
        } else {
          setNotYetAdded(true);
        }
      } catch {
        if (!cancelled) setNotYetAdded(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [planId, dayNumber]);

  useEffect(() => {
    if (!planId) return;
    const check = async () => {
      try {
        const res = await sendPostRequest("reading-plans", "get-submission-records", { planId });
        if (res?.returnCode === 200) {
          const records: SubmissionRecord[] = res.returnData || [];
          setIsCompleted(records.some((r) => r.dayNumber === dayNumber));
        }
      } catch { /* noop */ }
    };
    check();
  }, [planId, dayNumber]);

  const togglePonder = useCallback((id: number) => {
    setPonderedReflections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAnswer = useCallback((optionIndex: number) => {
    if (showResult || isReviewing) return;
    setSelected(optionIndex);
    setShowResult(true);
    const isCorrect = optionIndex === assignment?.quizQuestions[currentQ]?.correctAnswer;
    setLastAnswerCorrect(isCorrect);
    setRevealedCorrectAnswer(assignment?.quizQuestions[currentQ]?.correctAnswer ?? null);
    if (isCorrect) setCorrectCount((c) => c + 1);
  }, [showResult, isReviewing, assignment, currentQ]);

  const handleNextQuestion = useCallback(() => {
    if (!assignment) return;
    const quiz = assignment.quizQuestions;
    if (currentQ < quiz.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowResult(false);
      setLastAnswerCorrect(null);
      setRevealedCorrectAnswer(null);
    } else {
      setQuizDone(true);
    }
  }, [assignment, currentQ]);

  const handleRetryQuiz = useCallback(() => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setQuizDone(false);
    setCorrectCount(0);
    setIsReviewing(false);
    setLastAnswerCorrect(null);
    setRevealedCorrectAnswer(null);
  }, []);

  const handleReviewQuiz = useCallback(() => {
    setIsReviewing(true);
  }, []);

  const handleSubmitDay = useCallback(async () => {
    if (!planId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await sendPostRequest("reading-plans", "submit-day-completion", {
        planId, dayNumber, completedAt: new Date().toISOString(),
      });
      if (res?.returnCode === 200) {
        setIsCompleted(true);
        setSubmittedIds((prev) => new Set(prev).add(dayNumber));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        toast({ title: "Day completed!" });
      }
    } catch {
      toast({ title: "Submission failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [planId, dayNumber, isSubmitting, toast]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const allReflectionsPondered = useMemo(() => {
    if (!assignment?.reflections?.length) return true;
    return assignment.reflections.every((r) => ponderedReflections.has(r.id));
  }, [assignment, ponderedReflections]);

  const canComplete = isCompleted || (allReflectionsPondered && (quizDone || !assignment?.quizQuestions?.length));

  return {
    navigate, isRtl, loading, assignment, notYetAdded, isCompleted,
    planTitle: planTitleText, totalDays, dayNumber, currentDayIdx, ponderedReflections,
    currentQ, selected, showResult, isReviewing, quizDone, correctCount,
    isSubmitting, submittedIds, showConfetti, lastAnswerCorrect, revealedCorrectAnswer,
    allReflectionsPondered, canComplete,
    togglePonder, handleSelectAnswer, handleNextQuestion,
    handleRetryQuiz, handleReviewQuiz, handleSubmitDay,
    setCurrentQ, setSelected, setShowConfetti,
  };
}

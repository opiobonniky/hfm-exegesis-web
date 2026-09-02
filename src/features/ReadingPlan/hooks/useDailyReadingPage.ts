// useDailyReadingPage — comprehensive hook for DailyReading page
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useReadingPlanApi } from "../services";

interface Chapter {
  id: number;
  bookName: string;
  chapter: number;
  chapterEnd?: number;
  verseStart?: number;
  verseEnd?: number;
}
interface Reflection { id: number; question: string; reflectionText: string; }
interface QuizQuestion { id: number; question: string; options: string[]; correctAnswer: number; }
interface DailyAssignment {
  planId: string; dayNumber: number; chapters: Chapter[];
  reflectionPrompt: string; reflections: Reflection[];
  quizQuestions: QuizQuestion[]; ponderNotes: string;
}

const reflectionStorageKey = (planId: string, dayNumber: number) =>
  `reading-plan-reflections:${planId}:${dayNumber}`;

const loadReflectionDrafts = (planId: string, dayNumber: number): Record<number, string> => {
  try {
    return JSON.parse(localStorage.getItem(reflectionStorageKey(planId, dayNumber)) || "{}");
  } catch {
    return {};
  }
};

export function useDailyReadingPage() {
  const navigate = useNavigate();
  const { planId, day } = useParams();
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const api = useReadingPlanApi();

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<DailyAssignment | null>(null);
  const [notYetAdded, setNotYetAdded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [totalDays, setTotalDays] = useState(0);
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

  const planTitleText = useMemo(() => planTitle || t.readingPlan?.dailyReading || "Daily Reading", [planTitle, t]);

  useEffect(() => {
    if (!planId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setNotYetAdded(false);
      try {
        const [res, planRes] = await Promise.all([
          api.getDailyAssignment({ planId, dayNumber }),
          api.getPlanDetail(planId).catch(() => null),
        ]);
        if (cancelled) return;
        if (res?.returnCode === 200 && res.returnData) {
          const rd = res.returnData as any;
          const reflectionDrafts = loadReflectionDrafts(planId, dayNumber);
          const normalized: DailyAssignment = {
            planId: rd.planId ?? planId,
            dayNumber: rd.dayNumber ?? dayNumber,
            chapters: (rd.chapters || []).map((c: any, i: number) => ({
              id: c.id ?? i,
              bookName: c.book ?? c.bookName ?? "",
              chapter: c.chapter ?? c.startChapter ?? c.chapterStart ?? 0,
              chapterEnd: c.endChapter ?? c.chapterEnd,
              verseStart: c.verseStart ?? c.startVerse ?? c.verse,
              verseEnd: c.verseEnd ?? c.endVerse ?? c.verseStart ?? c.startVerse ?? c.verse,
            })),
            reflectionPrompt: rd.title ?? "",
            reflections: (rd.reflectionQuestions || []).map((q: string, i: number) => ({
              id: i,
              question: q,
              reflectionText: reflectionDrafts[i] ?? "",
            })),
            quizQuestions: (rd.quizQuestions || []).map((q: any, i: number) => ({
              id: q.id ?? q.questionId ?? i,
              question: q.question ?? "",
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: q.correctAnswer ?? 0,
            })),
            ponderNotes: "",
          };
          setAssignment(normalized);
          if (planRes?.returnCode === 200 && planRes.returnData) {
            setPlanTitle(planRes.returnData.title || "Reading Plan");
            setTotalDays(planRes.returnData.total_days || 0);
          } else {
            setPlanTitle("Reading Plan");
          }
          if (typeof rd.completed === "boolean") setIsCompleted(rd.completed);
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
  }, [planId, dayNumber, api]);

  const updateReflectionAnswer = useCallback((id: number, value: string) => {
    setAssignment((current) => {
      if (!current || !planId) return current;
      const reflections = current.reflections.map((reflection) =>
        reflection.id === id ? { ...reflection, reflectionText: value } : reflection,
      );
      try {
        localStorage.setItem(
          reflectionStorageKey(planId, dayNumber),
          JSON.stringify(Object.fromEntries(reflections.map((reflection) => [reflection.id, reflection.reflectionText]))),
        );
      } catch {
        // Local storage may be unavailable in private browsing modes.
      }
      return { ...current, reflections };
    });
  }, [dayNumber, planId]);

  const openBibleReading = useCallback((chapter: Chapter) => {
    if (!chapter.bookName || chapter.chapter < 1) return;
    const params = new URLSearchParams({
      book: chapter.bookName,
      chapter: String(chapter.chapter),
      ref: "reading-plan",
    });
    if (chapter.verseStart) params.set("verse", String(chapter.verseStart));
    navigate(`/bible-reader?${params.toString()}`);
  }, [navigate]);

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
      const res = await api.completeDay({ planId, dayNumber });
      if (res?.returnCode === 200) {
        setIsCompleted(true);
        setSubmittedIds((prev) => new Set(prev).add(dayNumber));
        setShowConfetti(true);
        toast({ title: "Day completed!" });
      }
    } catch {
      toast({ title: "Submission failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }, [planId, dayNumber, isSubmitting, toast, api]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const allReflectionsAnswered = useMemo(() => {
    if (!assignment?.reflections?.length) return true;
    return assignment.reflections.every((reflection) => reflection.reflectionText.trim().length > 0);
  }, [assignment?.reflections]);

  const canComplete = isCompleted || (allReflectionsAnswered && (quizDone || !assignment?.quizQuestions?.length));

  const incompleteMessage = !allReflectionsAnswered
    ? "Answer each reflection before completing this day."
    : !quizDone && assignment?.quizQuestions?.length
      ? "Finish the quiz before completing this day."
      : undefined;

  return {
    data: {
      navigate,
      isRtl,
      loading,
      assignment,
      notYetAdded,
      isCompleted,
      planTitle: planTitleText,
      totalDays,
      dayNumber,
      currentDayIdx,
      currentQ,
      selected,
      showResult,
      isReviewing,
      quizDone,
      correctCount,
      isSubmitting,
      submittedIds,
      showConfetti,
      lastAnswerCorrect,
      revealedCorrectAnswer,
      allReflectionsAnswered,
      canComplete,
      incompleteMessage,
    },
    actions: {
      updateReflectionAnswer,
      openBibleReading,
      handleSelectAnswer,
      handleNextQuestion,
      handleRetryQuiz,
      handleReviewQuiz,
      handleSubmitDay,
      setCurrentQ,
      setSelected,
      setShowConfetti,
    },
  };
}

export type DailyReadingPageModel = ReturnType<typeof useDailyReadingPage>;

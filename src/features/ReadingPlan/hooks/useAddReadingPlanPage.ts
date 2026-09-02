import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useReadingPlanApi } from "../services";
import type { DayAssignment, QuizQuestion } from "../types";

export interface PlanMeta {
  title: string;
  description: string;
  totalDays: number;
  questionsEnabled: boolean;
  category: string;
  difficulty: string;
}

export const emptyQuiz = (): QuizQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
});

const emptyDay = (n: number): DayAssignment => ({
  dayNumber: n,
  chapters: [{ book: "", chapter: 1 }],
  reflectionQuestions: [""],
  quizQuestions: [],
});

export const isDayComplete = (d: DayAssignment) =>
  d.chapters.some((c) => c.book) && d.reflectionQuestions.some((r) => r.trim().length > 0);

export const isDayPartial = (d: DayAssignment) =>
  !isDayComplete(d) &&
  (d.reflectionQuestions.some((r) => r.trim().length > 0) || d.chapters.some((c) => c.book));

export function useAddReadingPlanPage() {
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const api = useReadingPlanApi();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState<PlanMeta>({
    title: "",
    description: "",
    totalDays: 1,
    questionsEnabled: true,
    category: "intro",
    difficulty: "easy",
  });
  const [days, setDays] = useState<DayAssignment[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | undefined>(undefined);

  const updateMeta = <K extends keyof PlanMeta>(key: K, val: PlanMeta[K]) =>
    setMeta((m) => ({ ...m, [key]: val }));

  const normaliseDays = (total: number) =>
    setDays((prev) => {
      const next = [...prev];
      while (next.length < total) next.push(emptyDay(next.length + 1));
      if (next.length > total) next.splice(total);
      return next;
    });

  const handleUpdateDay = useCallback(
    (dayIdx: number, patch: Partial<DayAssignment>) =>
      setDays((p) => p.map((d, x) => (x === dayIdx ? { ...d, ...patch } : d))),
    []
  );

  const goToStep2 = () => {
    if (!meta.title.trim()) {
      toast({ title: t.readingPlan?.toastTitleRequired || "Title required", variant: "destructive" });
      return;
    }
    if (meta.totalDays < 1) {
      toast({ title: t.readingPlan?.atLeastOneDay || "At least 1 day", variant: "destructive" });
      return;
    }
    normaliseDays(meta.totalDays);
    setExpandedDay(1);
    setStep(2);
  };

  const goToStep3 = () => {
    for (let i = 0; i < days.length; i++) {
      if (isDayPartial(days[i])) {
        toast({
          title: (t.readingPlan?.dayIncomplete || "Day {day} incomplete").replace("{day}", String(days[i].dayNumber)),
          variant: "destructive",
        });
        setExpandedDay(days[i].dayNumber);
        return;
      }
    }
    if (days.filter(isDayComplete).length === 0) {
      toast({ title: t.readingPlan?.completeAtLeastOneDay || "Complete at least one day", variant: "destructive" });
      setExpandedDay(1);
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const planRes = await api.createPlan({
        title: meta.title,
        description: meta.description,
        totalDays: meta.totalDays,
        questionsEnabled: meta.questionsEnabled,
        category: meta.category,
        difficulty: meta.difficulty,
      });
      if (planRes.returnCode !== 200) {
        toast({ title: t.readingPlan?.failedToCreatePlan || "Failed to create", description: planRes.returnMessage, variant: "destructive" });
        return;
      }
      const planId = planRes.returnData?.planId;
      const completedDays = days.filter(isDayComplete);
      for (const d of completedDays) {
        await api.addAssignment({
          planId,
          dayNumber: d.dayNumber,
          title: d.title,
          chapters: d.chapters.map((c) => ({ book: c.book, chapter: c.chapter })),
          reflectionQuestions: d.reflectionQuestions.filter((r) => r.trim().length > 0),
        });
        const quizQs = d.quizQuestions.filter((q) => q.question.trim());
        if (quizQs.length > 0) {
          await api.addQuizQuestions({
            planId,
            dayNumber: d.dayNumber,
            questions: quizQs.map((q) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
          });
        }
      }
      toast({ title: t.readingPlan?.planCreated || "Plan created", description: t.readingPlan?.planCreated || "Plan created successfully" });
      navigate("/admin/plans");
    } catch {
      toast({ title: t.common?.error || "Error", description: "Failed to create plan", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    data: {
      step,
      submitting,
      meta,
      days,
      expandedDay,
      navigate,
      t,
      isRtl,
    },
    actions: {
      setStep,
      updateMeta,
      setExpandedDay,
      handleUpdateDay,
      goToStep2,
      goToStep3,
      handleSubmit,
    },
  };
}

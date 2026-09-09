// useEditReadingPlanPage — comprehensive hook for EditReadingPlan
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useReadingPlanApi } from "../services/index";
import type { DayAssignment, PlanMeta, QuizQuestion } from "../types";

export function useEditReadingPlanPage() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { toast } = useToast();
  const api = useReadingPlanApi();
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PlanMeta | null>(null);
  const [days, setDays] = useState<DayAssignment[]>([]);
  const [expandedDay, setExpandedDay] = useState<number>(-1);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [deletedQuizIds, setDeletedQuizIds] = useState<Array<number | string>>([]);

  useEffect(() => {
    if (!planId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [metaRes, daysRes] = await Promise.all([
          api.getPlanMeta(planId),
          api.getPlanDays(planId),
        ]);
        if (cancelled) return;
        const detail = metaRes?.returnData;
        if (metaRes?.returnCode === 200 && detail) {
          const d = detail;
          setMeta({
            isPublished: d.is_active ?? d.isActive ?? true,
            title: d.title ?? "",
            description: d.description ?? "",
            totalDays: d.total_days ?? 0,
            questionsEnabled: d.questions_enabled ?? d.questionsEnabled ?? true,
            category: d.category ?? "intro",
            difficulty: d.difficulty ?? "medium",
          });
        }
        const rawDaysData = daysRes?.returnData as unknown;
        const rawDays = Array.isArray(rawDaysData)
          ? rawDaysData
          : (rawDaysData as { days?: unknown[]; assignments?: unknown[] } | undefined)?.days
            ?? (rawDaysData as { days?: unknown[]; assignments?: unknown[] } | undefined)?.assignments
            ?? [];
        if (daysRes?.returnCode === 200 && Array.isArray(rawDays)) {
          const detailDays = Array.isArray(detail?.days) ? detail.days : [];
          setDays(
            rawDays.map((a: any) => {
              const detailDay = detailDays.find((d: any) =>
                (d.dayNumber ?? d.day_number) === (a.dayNumber ?? a.day_number),
              );
              const chapters = (a.chapters ?? detailDay?.chapters ?? []).map((c: any) => ({
                book: c.book ?? c.bookName ?? c.book_name ?? "",
                chapter: c.chapter ?? c.startChapter ?? c.chapterStart ?? 1,
                startChapter: c.startChapter,
                endChapter: c.endChapter,
              }));
              return {
              assignmentId: a.id ?? a.assignmentId,
              dayNumber: a.dayNumber ?? a.day_number ?? 0,
              title: a.title ?? "",
              chapters,
              reflectionQuestions: a.reflectionQuestions ?? a.reflection_questions ?? detailDay?.reflectionQuestions ?? [],
              quizQuestions: (detailDay?.quizQuestions ?? a.quizQuestions ?? a.quiz_questions ?? []).map((q: any): QuizQuestion => ({
                questionId: q?.questionId ?? q?.id,
                question: q?.question ?? "",
                options: [
                  q?.options?.[0] ?? "",
                  q?.options?.[1] ?? "",
                  q?.options?.[2] ?? "",
                  q?.options?.[3] ?? "",
                ],
                correctAnswer: q?.correctAnswer ?? 0,
                explanation: q?.explanation ?? "",
              })),
              };
            })
          );
        }
      } catch {
        toast({ title: "Failed to load plan", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [planId, toast, api]);

  const handleSaveMeta = useCallback(async () => {
    if (!meta || !planId) return;
    setSavingMeta(true);
    try {
      const res = await api.updatePlanMeta(planId, {
        title: meta.title,
        description: meta.description,
        isActive: meta.isPublished,
        totalDays: meta.totalDays,
      });
      if (res?.returnCode === 200) toast({ title: "Plan updated" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSavingMeta(false);
    }
  }, [meta, planId, toast, api]);

  const handleSaveDay = useCallback(async (dayIdx: number) => {
    if (!planId || !days[dayIdx]) return;
    setSavingDay(dayIdx);
    try {
      const day = days[dayIdx];
      const res = await api.updateDay({
        assignmentId: day.assignmentId,
        planId,
        dayNumber: day.dayNumber,
        title: day.title,
        chapters: day.chapters.map((c) => ({ book: c.book, chapter: c.chapter })),
        reflectionQuestions: day.reflectionQuestions,
      });
      if (res?.returnCode === 200 && planId) {
        for (const questionId of deletedQuizIds) {
          await api.deleteQuizQuestion(questionId);
        }
        const existingQuestions = day.quizQuestions.filter((question) => question.questionId !== undefined);
        for (const question of existingQuestions) {
          await api.updateQuizQuestion({
            questionId: question.questionId!,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
          });
        }
        const newQuestions = day.quizQuestions.filter((question) => question.questionId === undefined && question.question.trim());
        if (newQuestions.length > 0) {
          await api.addQuizQuestions({
            planId,
            dayNumber: day.dayNumber,
            questions: newQuestions,
          });
        }
        toast({ title: `Day ${day.dayNumber} saved` });
        setDeletedQuizIds([]);
      }
    } finally {
      setSavingDay(null);
    }
  }, [planId, days, deletedQuizIds, toast, api]);

  const updateMeta = useCallback((field: string, value: any) =>
    setMeta((prev) => prev ? { ...prev, [field]: value } : prev), []);

  const updateDay = useCallback((dayIdx: number, patch: Partial<DayAssignment>) =>
    setDays((prev) => prev.map((d, i) => {
      if (i !== dayIdx) return d;
      const removedIds = patch.quizQuestions
        ? d.quizQuestions
          .map((question) => question.questionId)
          .filter((id): id is number => id !== undefined && !patch.quizQuestions?.some((q) => q.questionId === id))
        : [];
      if (removedIds.length > 0) {
        setDeletedQuizIds((ids) => [...new Set([...ids, ...removedIds])]);
      }
      return { ...d, ...patch };
    })), []);

  return {
    data: {
      navigate,
      loading,
      meta,
      days,
      expandedDay,
      savingMeta,
      savingDay,
    },
    actions: {
      setExpandedDay,
      handleSaveMeta,
      handleSaveDay,
      updateMeta,
      updateDay,
    },
  };
}

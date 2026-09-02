// useEditReadingPlanPage — comprehensive hook for EditReadingPlan
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useReadingPlanApi } from "../services";

interface PlanMeta {
  id: string; title: string; description: string; totalDays: number;
  isPublished: boolean; createdBy: string; createdOn: string;
}

interface DayAssignment {
  assignmentId?: string | number;
  dayNumber: number; title: string; chapters: { bookName: string; chapter: number }[];
  reflectionPrompt: string; reflectionText: string;
  quizQuestions: { id: number; question: string; options: string[]; correctAnswer: number }[];
}

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
  const [deleteQuizTarget, setDeleteQuizTarget] = useState<{ dayIdx: number; quizIdx: number } | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

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
        if (metaRes?.returnCode === 200 && metaRes.returnData) {
          const d = metaRes.returnData;
          setMeta({
            id: d.planId ?? planId,
            title: d.title ?? "",
            description: d.description ?? "",
            totalDays: d.total_days ?? 0,
            isPublished: d.is_active ?? false,
            createdBy: String(d.created_by ?? ""),
            createdOn: d.plan_created_on ?? "",
          });
        }
        if (daysRes?.returnCode === 200 && Array.isArray(daysRes.returnData)) {
          setDays(
            daysRes.returnData.map((a: any) => ({
              assignmentId: a?.id,
              dayNumber: a.dayNumber ?? 0,
              title: a.title ?? "",
              chapters: (a.chapters || []).map((c: any) => ({
                bookName: c.book ?? c.bookName ?? c.book_name ?? "",
                chapter: c.chapter ?? c.chapterStart ?? 0,
              })),
              reflectionPrompt: a.title ?? "",
              reflectionText: (a.reflectionQuestions || []).join("\n"),
              quizQuestions: (a.quizQuestions || []).map((q: any) => ({
                id: q?.id ?? q?.questionId,
                question: q?.question ?? "",
                options: q?.options ?? [],
                correctAnswer: q?.correctAnswer ?? 0,
              })),
            }))
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
        chapters: day.chapters.map((c) => ({ book: c.bookName, chapter: c.chapter })),
        reflectionQuestions: day.reflectionText ? day.reflectionText.split("\n") : [],
      });
      if (res?.returnCode === 200) toast({ title: `Day ${day.dayNumber} saved` });
    } finally {
      setSavingDay(null);
    }
  }, [planId, days, toast, api]);

  const handleDeleteQuiz = useCallback(async () => {
    if (!deleteQuizTarget || !planId) return;
    setDeletingQuiz(true);
    try {
      const { dayIdx, quizIdx } = deleteQuizTarget;
      const day = days[dayIdx];
      const newQuiz = [...day.quizQuestions];
      newQuiz.splice(quizIdx, 1);
      const res = await api.updateDay({
        assignmentId: day.assignmentId,
        planId,
        dayNumber: day.dayNumber,
        quizQuestions: newQuiz,
      });
      if (res?.returnCode === 200) {
        setDays((prev) => prev.map((d, i) => i === dayIdx ? { ...d, quizQuestions: newQuiz } : d));
        toast({ title: "Quiz removed" });
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeletingQuiz(false);
      setDeleteQuizTarget(null);
    }
  }, [deleteQuizTarget, planId, days, toast, api]);

  const updateMeta = useCallback((field: string, value: any) =>
    setMeta((prev) => prev ? { ...prev, [field]: value } : prev), []);

  const updateDay = useCallback((dayIdx: number, field: string, value: any) =>
    setDays((prev) => prev.map((d, i) => i === dayIdx ? { ...d, [field]: value } : d)), []);

  const updateChapter = useCallback((dayIdx: number, chIdx: number, field: string, value: any) => {
    setDays((prev) => prev.map((d, i) => i === dayIdx
      ? { ...d, chapters: d.chapters.map((c, j) => j === chIdx ? { ...c, [field]: value } : c) }
      : d));
  }, []);

  return {
    data: {
      navigate,
      loading,
      meta,
      days,
      expandedDay,
      savingMeta,
      savingDay,
      deleteQuizTarget,
      deletingQuiz,
    },
    actions: {
      setExpandedDay,
      setDeleteQuizTarget,
      handleSaveMeta,
      handleSaveDay,
      handleDeleteQuiz,
      updateMeta,
      updateDay,
      updateChapter,
    },
  };
}

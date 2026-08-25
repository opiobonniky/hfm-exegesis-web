// useEditReadingPlanPage — comprehensive hook for EditReadingPlan
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

interface PlanMeta {
  id: string; title: string; description: string; totalDays: number;
  isPublished: boolean; createdBy: string; createdOn: string;
}

interface DayAssignment {
  dayNumber: number; title: string; chapters: { bookName: string; chapter: number }[];
  reflectionPrompt: string; reflectionText: string;
  quizQuestions: { id: number; question: string; options: string[]; correctAnswer: number }[];
}

export function useEditReadingPlanPage() {
  const navigate = useNavigate();
  const { planId } = useParams();
  const { toast } = useToast();
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
          sendPostRequest("reading-plans", "get-plan-meta", { planId }),
          sendPostRequest("reading-plans", "get-plan-days", { planId }),
        ]);
        if (cancelled) return;
        if (metaRes?.returnCode === 200) setMeta(metaRes.returnData);
        if (daysRes?.returnCode === 200) setDays(daysRes.returnData || []);
      } catch {
        toast({ title: "Failed to load plan", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [planId, toast]);

  const handleSaveMeta = useCallback(async () => {
    if (!meta || !planId) return;
    setSavingMeta(true);
    try {
      const res = await sendPostRequest("reading-plans", "update-plan-meta", {
        planId, title: meta.title, description: meta.description, isPublished: meta.isPublished,
      });
      if (res?.returnCode === 200) toast({ title: "Plan updated" });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSavingMeta(false);
    }
  }, [meta, planId, toast]);

  const handleSaveDay = useCallback(async (dayIdx: number) => {
    if (!planId || !days[dayIdx]) return;
    setSavingDay(dayIdx);
    try {
      const day = days[dayIdx];
      const res = await sendPostRequest("reading-plans", "update-day", {
        planId, dayNumber: day.dayNumber, title: day.title,
        chapters: day.chapters, reflectionPrompt: day.reflectionPrompt,
        reflectionText: day.reflectionText, quizQuestions: day.quizQuestions,
      });
      if (res?.returnCode === 200) toast({ title: `Day ${day.dayNumber} saved` });
    } finally {
      setSavingDay(null);
    }
  }, [planId, days, toast]);

  const handleDeleteQuiz = useCallback(async () => {
    if (!deleteQuizTarget || !planId) return;
    setDeletingQuiz(true);
    try {
      const { dayIdx, quizIdx } = deleteQuizTarget;
      const day = days[dayIdx];
      const newQuiz = [...day.quizQuestions];
      newQuiz.splice(quizIdx, 1);
      const res = await sendPostRequest("reading-plans", "update-day", {
        planId, dayNumber: day.dayNumber, quizQuestions: newQuiz,
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
  }, [deleteQuizTarget, planId, days, toast]);

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
    navigate, loading, meta, days, expandedDay, setExpandedDay,
    savingMeta, savingDay, deleteQuizTarget, setDeleteQuizTarget, deletingQuiz,
    handleSaveMeta, handleSaveDay, handleDeleteQuiz,
    updateMeta, updateDay, updateChapter,
  };
}

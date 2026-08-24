import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
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
  title: "",
  chapters: [{ book: "", chapter: 1 }],
  reflectionQuestions: [""],
  quizQuestions: [],
export const isDayComplete = (d: DayAssignment) =>
  d.chapters.some((c) => c.book) && d.title.trim().length > 0;
export const isDayPartial = (d: DayAssignment) =>
  !isDayComplete(d) &&
  (d.title.trim().length > 0 || d.chapters.some((c) => c.book));
export function useAddReadingPlanPage() {
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
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
      toast({ title: t.readingPlan.toastTitleRequired, variant: "destructive" });
      return;
    }
    if (meta.totalDays < 1) {
      toast({ title: t.readingPlan.atLeastOneDay, variant: "destructive" });
    normaliseDays(meta.totalDays);
    setExpandedDay(1);
    setStep(2);
  };
  const goToStep3 = () => {
    for (let i = 0; i < days.length; i++) {
      if (isDayPartial(days[i])) {
        toast({
          title: t.readingPlan.dayIncomplete.replace("{day}", String(days[i].dayNumber)),
          variant: "destructive",
        });
        setExpandedDay(days[i].dayNumber);
        return;
      }
    if (days.filter(isDayComplete).length === 0) {
      toast({ title: t.readingPlan.completeAtLeastOneDay, variant: "destructive" });
      setExpandedDay(1);
    setStep(3);
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const planRes = await sendPostRequest("reading-plans", "create", {
        title: meta.title,
        description: meta.description,
        totalDays: meta.totalDays,
        questionsEnabled: meta.questionsEnabled,
        category: meta.category,
        difficulty: meta.difficulty,
      });
      if (planRes.returnCode !== 200) {
        toast({ title: t.readingPlan.failedToCreatePlan, description: planRes.returnMessage, variant: "destructive" });
      const planId = planRes.returnData?.planId;
      const completedDays = days.filter(isDayComplete);
      if (completedDays.length > 0) {
        await sendPostRequest("reading-plans", "save-days", { planId, days: completedDays });
      toast({ title: t.readingPlan.planCreated, description: t.readingPlan.planCreatedDesc });
      navigate("/admin/plans");
    } catch {
      toast({ title: t.common.error, description: "Failed to create plan", variant: "destructive" });
    } finally {
      setSubmitting(false);
  return {
    step, setStep, submitting, meta, updateMeta, days, expandedDay, setExpandedDay,
    handleUpdateDay, goToStep2, goToStep3, handleSubmit, navigate, t, isRtl,

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import type { ReadingPlan } from "../types";

export type Tab = "progress" | "browse";

export interface UserProgress {
  planId: string;
  startDate: string;
  completedDaysJson: string;
  lastCompletedDate: string | null;
  streak: number;
  isCompleted: boolean;
  completedDate: string | null;
}

export function useBibleReadingPlanPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("progress");
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [myPlans, setMyPlans] = useState<ReadingPlan[]>([]);
  const [activePlans, setActivePlans] = useState<ReadingPlan[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [startPlanModalVisible, setStartPlanModalVisible] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ReadingPlan | null>(null);
  const [removePlanModalVisible, setRemovePlanModalVisible] = useState(false);
  const [planToRemove, setPlanToRemove] = useState<ReadingPlan | null>(null);

  const loadData = useCallback(async (load = true) => {
    setLoading(load);
    try {
      const [allRes, userRes] = await Promise.all([
        sendPostRequest("reading-plans", "get-all", {}),
        sendPostRequest("reading-plans", "get-user-plans", {}),
      ]);
      if (allRes.returnCode === 200 && allRes.returnData) {
        const plansData = allRes.returnData.plans ?? allRes.returnData;
        const rawPlans = Array.isArray(plansData) ? plansData : [];
        const normalizedPlans: ReadingPlan[] = rawPlans.map((p: any) => ({
          plan_id: p.plan_id ?? p.planId ?? "",
          planId: p.planId ?? p.plan_id ?? "",
          plan_db_id: p.plan_db_id ?? 0,
          title: p.title ?? "",
          description: p.description ?? "",
          category: p.category ?? "intro",
          difficulty: p.difficulty ?? "medium",
          total_days: p.total_days ?? p.totalDays ?? 0,
          totalDays: p.totalDays ?? p.total_days ?? 0,
          total_assignments: p.total_assignments ?? 0,
          total_quiz_questions: p.total_quiz_questions ?? 0,
          questions_enabled: p.questions_enabled ?? p.questionsEnabled ?? false,
          questionsEnabled: p.questionsEnabled ?? p.questions_enabled ?? false,
          is_active: p.is_active ?? p.isActive ?? true,
          isActive: p.isActive ?? p.is_active ?? true,
          started: p.started ?? false,
          is_completed: p.is_completed ?? p.completed ?? false,
          completed: p.completed ?? p.is_completed ?? false,
          completed_date: p.completed_date ?? null,
          completion_percentage: p.completion_percentage ?? 0,
          completed_days_count: p.completed_days_count ?? 0,
          completed_days_json: p.completed_days_json ?? null,
          progress_id: p.progress_id ?? null,
          user_id: p.user_id ?? null,
          start_date: p.start_date ?? null,
          last_completed_date: p.last_completed_date ?? null,
          days_since_started: p.days_since_started ?? null,
          days_since_last_activity: p.days_since_last_activity ?? null,
          estimated_days_to_complete: p.estimated_days_to_complete ?? null,
          avg_days_to_complete: p.avg_days_to_complete ?? null,
          streak: p.streak ?? null,
          plan_created_on: p.plan_created_on ?? "",
          days: p.days ?? [],
        }));
        setPlans(normalizedPlans);
        const userProgressMap: Record<string, UserProgress> = {};
        const startedPlans: ReadingPlan[] = [];
        if (userRes.returnCode === 200 && userRes.returnData) {
          (userRes.returnData as any[]).forEach((up) => {
            const plan = normalizedPlans.find((p) => (p.planId || p.plan_id) === up.planId);
            if (plan) {
              startedPlans.push({
                ...plan,
                started: true,
                is_completed: up.isCompleted,
                completed: up.isCompleted,
                streak: up.streak,
              });
              userProgressMap[up.planId] = {
                planId: up.planId,
                startDate: up.startDate || new Date().toISOString(),
                completedDaysJson: JSON.stringify(Array.from({ length: up.completedDays || 0 }, (_, i) => i + 1)),
                lastCompletedDate: up.lastCompletedDate || null,
                streak: up.streak || 0,
                isCompleted: up.isCompleted || false,
                completedDate: up.completedDate || null,
              };
            }
          });
        }
        setMyPlans(startedPlans);
        setActivePlans(startedPlans.filter((p) => !(p.is_completed || p.completed)));
        setUserProgress(Object.values(userProgressMap));
        setProgressMap(userProgressMap);
      }
    } catch (err) {
      console.error("Failed to load reading plans", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await loadData(false); } finally { setRefreshing(false); }
  };

  const startPlan = async (plan: ReadingPlan) => {
    try {
      const res = await sendPostRequest("reading-plans", "start", { planId: plan.planId || plan.plan_id });
      if (res.returnCode === 200) {
        toast({
          title: t.readingPlan?.toastStarted || "Plan started!",
          description: (t.readingPlan?.toastStartedDesc || 'You\'ve started "{title}". Let\'s build that habit!').replace("{title}", plan.title || ""),
        });
        await loadData();
        setActiveTab("progress");
      } else {
        toast({ title: t.readingPlan?.toastFailedStart || "Failed to start plan", description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || "Error", description: t.readingPlan?.toastUnableStart || "Failed to start reading plan", variant: "destructive" });
    }
  };

  const removePlan = async (plan: ReadingPlan) => {
    try {
      const res = await sendPostRequest("reading-plans", "remove", { planId: plan.planId || plan.plan_id });
      if (res.returnCode === 200) {
        toast({ title: t.readingPlan?.toastRemoved || "Plan removed", description: t.readingPlan?.toastRemovedDesc || "Your progress has been lost." });
        await loadData(false);
      } else {
        toast({ title: t.readingPlan?.toastFailedRemove || "Failed to remove plan", description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || "Error", description: t.readingPlan?.toastUnableRemove || "Failed to remove reading plan", variant: "destructive" });
    }
  };

  const getCompletedDays = (pr: UserProgress): number[] => {
    try { return pr.completedDaysJson ? JSON.parse(pr.completedDaysJson) : []; } catch { return []; }
  };

  return {
    loading, activeTab, setActiveTab, plans, myPlans, activePlans, progressMap, userProgress,
    refreshing, onRefresh, startPlan, removePlan, getCompletedDays,
    startPlanModalVisible, setStartPlanModalVisible, pendingPlan, setPendingPlan,
    removePlanModalVisible, setRemovePlanModalVisible, planToRemove, setPlanToRemove,
    navigate, t, isRtl,
  };
}

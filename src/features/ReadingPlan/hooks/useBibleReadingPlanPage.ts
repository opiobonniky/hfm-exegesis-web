import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export type Tab = "progress" | "browse";
export interface ReadingPlan {
  planId: string; title: string; description: string; duration?: number; totalDays?: number;
  isActive?: boolean; is_active?: boolean; started?: boolean; completed?: boolean;
  is_completed?: boolean; questionsEnabled?: boolean; questions_enabled?: boolean;
  streak?: number; completedDays?: number; planImage?: string;
}
export interface UserProgress {
  planId: string; startDate: string; completedDaysJson: string;
  lastCompletedDate: string | null; streak: number; isCompleted: boolean;
  completedDate: string | null;
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
        const allPlans = (Array.isArray(plansData) ? plansData : []) as ReadingPlan[];
        const normalizedPlans = allPlans.map((p) => ({
          ...p, started: p.started ?? false, completed: p.completed ?? false,
          isActive: p.isActive ?? p.is_active ?? true,
          totalDays: p.totalDays ?? p.total_days ?? 0,
          questionsEnabled: p.questionsEnabled ?? p.questions_enabled ?? false,
        }));
        setPlans(normalizedPlans);
        let userProgressMap: Record<string, UserProgress> = {};
        let startedPlans: ReadingPlan[] = [];
        if (userRes.returnCode === 200 && userRes.returnData) {
          (userRes.returnData as any[]).forEach((up) => {
            const plan = normalizedPlans.find((p) => p.planId === up.planId);
            if (plan) {
              startedPlans.push({ ...plan, started: true, completed: up.isCompleted, isCompleted: up.isCompleted, streak: up.streak, completedDays: up.completedDays });
              userProgressMap[up.planId] = {
                planId: up.planId, startDate: up.startDate || new Date().toISOString(),
                completedDaysJson: JSON.stringify(Array.from({ length: up.completedDays || 0 }, (_, i) => i + 1)),
                lastCompletedDate: up.lastCompletedDate || null, streak: up.streak || 0,
                isCompleted: up.isCompleted || false, completedDate: up.completedDate || null,
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
      const res = await sendPostRequest("reading-plans", "start", { planId: plan.planId });
      if (res.returnCode === 200) {
        toast({ title: t.readingPlan?.toastStarted || "Plan started!",
          description: (t.readingPlan?.toastStartedDesc || 'You\'ve started "{title}". Let\'s build that habit!').replace("{title}", plan.title) });
        await loadData();
        setActiveTab("progress");
      } else {
        toast({ title: t.readingPlan?.toastFailedStart || "Failed to start plan", description: res.returnMessage, variant: "destructive" });
    } catch {
      toast({ title: t.common?.error || "Error", description: t.readingPlan?.toastUnableStart || "Failed to start reading plan", variant: "destructive" });
  const removePlan = async (plan: ReadingPlan) => {
      const res = await sendPostRequest("reading-plans", "remove", { planId: plan.planId });
        toast({ title: t.readingPlan?.toastRemoved || "Plan removed", description: t.readingPlan?.toastRemovedDesc || "Your progress has been lost." });
        await loadData(false);
        toast({ title: t.readingPlan?.toastFailedRemove || "Failed to remove plan", description: res.returnMessage, variant: "destructive" });
      toast({ title: t.common?.error || "Error", description: t.readingPlan?.toastUnableRemove || "Failed to remove reading plan", variant: "destructive" });
  const getCompletedDays = (pr: UserProgress): number[] => {
    try { return pr.completedDaysJson ? JSON.parse(pr.completedDaysJson) : []; } catch { return []; }
  return {
    loading, activeTab, setActiveTab, plans, myPlans, activePlans, progressMap, userProgress,
    refreshing, onRefresh, startPlan, removePlan, getCompletedDays,
    startPlanModalVisible, setStartPlanModalVisible, pendingPlan, setPendingPlan,
    removePlanModalVisible, setRemovePlanModalVisible, planToRemove, setPlanToRemove,
    navigate, t, isRtl,

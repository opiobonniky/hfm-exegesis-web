import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useReadingPlanApi } from "../services";

export interface UserPlanReadingPlan {
  planId: string; title: string; description: string; totalDays?: number;
  category?: string; difficulty?: string; isActive?: boolean;
  questionsEnabled?: boolean; planImage?: string;
}

export interface UserPlan {
  planId: string; startDate: string; completedDays: number; streak: number;
  isCompleted: boolean; plan?: UserPlanReadingPlan;
}

export function useUserPlansPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const api = useReadingPlanApi();
  const [activeTab, setActiveTab] = useState<"progress" | "browse">("progress");
  const [allPlans, setAllPlans] = useState<UserPlanReadingPlan[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [removeModal, setRemoveModal] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, userRes] = await Promise.all([
        api.getAllPlans({}),
        api.getUserPlans(),
      ]);
      if (allRes.returnCode === 200) {
        const plansData = allRes.returnData?.plans ?? allRes.returnData;
        setAllPlans(Array.isArray(plansData) ? plansData : []);
      }
      if (userRes.returnCode === 200 && Array.isArray(userRes.returnData)) {
        setUserPlans(userRes.returnData as unknown as UserPlan[]);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const startPlan = useCallback(async (planId: string) => {
    try {
      const res = await api.startPlan(planId);
      if (res.returnCode === 200) {
        toast({ title: t.readingPlan?.toastStarted || "Plan started!" });
        await loadData();
      } else {
        toast({ title: t.readingPlan?.toastFailedStart || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || "Error", variant: "destructive" });
    }
  }, [toast, t, loadData, api]);

  const removePlan = useCallback(async (planId: string) => {
    try {
      const res = await api.removePlan(planId);
      if (res.returnCode === 200) {
        toast({ title: t.readingPlan?.toastRemoved || "Plan removed" });
        setRemoveModal(null);
        await loadData();
      }
    } catch { /* ignore */ }
  }, [toast, t, loadData, api]);

  const filteredPlans = allPlans.filter((p) => catFilter === "all" || p.category === catFilter);

  return {
    data: {
      activeTab,
      allPlans,
      userPlans,
      loading,
      catFilter,
      removeModal,
      filteredPlans,
      navigate,
      t,
      isRtl,
    },
    actions: {
      setActiveTab,
      setCatFilter,
      setRemoveModal,
      startPlan,
      removePlan,
    },
  };
}

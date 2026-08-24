import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export interface ReadingPlan {
  planId: string; title: string; description: string; totalDays?: number;
  category?: string; planImage?: string;
}
export interface UserPlan {
  planId: string; startDate: string; completedDays: number; streak: number;
  isCompleted: boolean; plan?: ReadingPlan;
export function useUserPlansPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<"progress" | "browse">("progress");
  const [allPlans, setAllPlans] = useState<ReadingPlan[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [removeModal, setRemoveModal] = useState<string | null>(null);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allRes, userRes] = await Promise.all([
        sendPostRequest("reading-plans", "get-all", {}),
        sendPostRequest("reading-plans", "get-user-plans", {}),
      ]);
      if (allRes.returnCode === 200) {
        const plansData = allRes.returnData?.plans ?? allRes.returnData;
        setAllPlans(Array.isArray(plansData) ? plansData : []);
      }
      if (userRes.returnCode === 200 && Array.isArray(userRes.returnData)) {
        setUserPlans(userRes.returnData);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  const startPlan = useCallback(async (planId: string) => {
      const res = await sendPostRequest("reading-plans", "start", { planId });
      if (res.returnCode === 200) {
        toast({ title: t.readingPlan?.toastStarted || "Plan started!" });
        await loadData();
      } else {
        toast({ title: t.readingPlan?.toastFailedStart || "Failed", variant: "destructive" });
    } catch {
      toast({ title: t.common?.error || "Error", variant: "destructive" });
    }
  }, [toast, t, loadData]);
  const removePlan = useCallback(async (planId: string) => {
      const res = await sendPostRequest("reading-plans", "remove", { planId });
        toast({ title: t.readingPlan?.toastRemoved || "Plan removed" });
        setRemoveModal(null);
    } catch { /* ignore */ }
  const filteredPlans = allPlans.filter((p) => catFilter === "all" || p.category === catFilter);
  return {
    activeTab, setActiveTab, allPlans, userPlans, loading, catFilter, setCatFilter,
    removeModal, setRemoveModal, startPlan, removePlan, filteredPlans,
    navigate, t, isRtl,
  };

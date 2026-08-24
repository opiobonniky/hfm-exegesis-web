import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export interface ReadingPlan {
  planId: string; title: string; description: string; total_days: number;
  created_at: string; is_active: boolean; questions_enabled: boolean;
  completed_days_json: string; planImage?: string;
}
export interface DayAssignment {
  dayNumber: number; book: string; chapterStart: number; chapterEnd: number;
  reflectionQuestions: string[]; quizQuestions: any[]; exists: boolean;
export function usePlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { t, isRtl, lang } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [days, setDays] = useState<DayAssignment[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);
  const [userSearchTerm, setUserSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "quiz" | "admin">("overview");
  const filteredUsers = useMemo(() => {
    if (!adminStats?.users) return [];
    if (!userSearchTerm.trim()) return adminStats.users;
    const term = userSearchTerm.toLowerCase().trim();
    return adminStats.users.filter((u: any) =>
      u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.username?.toLowerCase().includes(term)
    );
  }, [adminStats?.users, userSearchTerm]);
  const completedDayNums: Set<number> = useMemo(() => {
    try { if (plan?.completed_days_json) return new Set(JSON.parse(plan.completed_days_json)); } catch {}
    return new Set();
  }, [plan?.completed_days_json]);
  const loadAdminStats = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingAdminStats(true);
    try {
      const resp = await sendPostRequest("reading-plans", "admin-stats", { planId: planId ?? "" });
      if (resp.returnCode === 200) setAdminStats(resp.returnData);
    } catch (e) { console.error("Admin stats error:", e); }
    finally { setLoadingAdminStats(false); }
  }, [planId, isAdmin]);
  const loadPlan = useCallback(async () => {
    setLoadingPlan(true);
      const resp = await sendPostRequest("reading-plans", "plan-detail", { planId: planId ?? "" });
      if (resp.returnCode === 200 && resp.returnData) {
        const data = resp.returnData;
        setPlan(data);
        if (data.days && Array.isArray(data.days)) setDays(data.days);
        if (isAdmin) loadAdminStats();
      } else {
        toast({ title: t.readingPlan?.toastLoadError || "Failed to load plan", description: resp.returnMessage, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: t.readingPlan?.toastNetworkError || "Network error", description: e.message, variant: "destructive" });
    } finally { setLoadingPlan(false); }
  }, [planId, toast, isAdmin, loadAdminStats, t]);
  useEffect(() => { loadPlan(); }, [loadPlan]);
  const totalReflections = days.reduce((s, d) => s + d.reflectionQuestions.filter((r) => r.trim()).length, 0);
  const configuredDays = days.filter((d) => d.exists).length;
  const allQuizDays = days.filter((d) => d.exists && d.quizQuestions.length > 0);
  const totalQuizCount = days.reduce((s, d) => s + d.quizQuestions.length, 0);
  const configuredPct = plan && plan.total_days > 0 ? Math.round((configuredDays / plan.total_days) * 100) : 0;
  return {
    plan, adminStats, days, loadingPlan, loadingAdminStats,
    userSearchTerm, setUserSearchFilter, activeTab, setActiveTab,
    filteredUsers, completedDayNums, totalReflections, configuredDays,
    allQuizDays, totalQuizCount, configuredPct,
    isAdmin, navigate, t, isRtl, lang,
  };

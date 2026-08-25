// usePlanDetail — state and API logic
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";

export interface DailyReading {
  day: number;
  reference: string;
  completed: boolean;
  title?: string;
  book?: string;
  chapter?: number;
}

export interface ReadingPlanDetail {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  category: string;
  startDate: string;
  progress: number;
  totalUsers: number;
  completionRate: number;
  days: DailyReading[];
}

export function usePlanDetail(planId?: string) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<ReadingPlanDetail | null>(null);
  const [readings, setReadings] = useState<DailyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPlan = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const res = await sendPostRequest("reading-plans", "plan-detail", { planId });
      if (res.returnCode === 200 && res.returnData) {
        setPlan(res.returnData);
        setReadings(res.returnData.days || []);
      }
    } catch (e) {
      console.error("Failed to fetch plan", e);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => { fetchPlan(); }, [fetchPlan]);

  const toggleComplete = useCallback(async (day: number) => {
    if (!user?.id || !planId) return;
    setSaving(true);
    try {
      await sendPostRequest("reading-plans", "mark-complete", { planId, day });
      setReadings((prev) => prev.map((r) => r.day === day ? { ...r, completed: !r.completed } : r));
    } catch (e) {
      console.error("Failed to toggle reading", e);
    } finally {
      setSaving(false);
    }
  }, [user?.id, planId]);

  const completedCount = readings.filter((r) => r.completed).length;
  const progress = readings.length > 0 ? Math.round((completedCount / readings.length) * 100) : 0;

  return { plan, readings, loading, saving, completedCount, progress, toggleComplete, refresh: fetchPlan };
}

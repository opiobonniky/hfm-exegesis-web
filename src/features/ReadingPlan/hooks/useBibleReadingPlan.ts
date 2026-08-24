// useBibleReadingPlan — all state for BibleReadingPlan page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export function useBibleReadingPlan(planId?: string) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(0);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [completing, setCompleting] = useState(false);
  const loadPlan = useCallback(async () => {
    if (!planId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await sendPostRequest("reading-plans", "get-plan", { planId });
      if (res?.returnCode === 200) { setPlan(res.returnData); setCompletedDays(new Set(res.returnData?.completedDaysJson ? JSON.parse(res.returnData.completedDaysJson) : [])); }
    } catch { toast({ title: "Failed to load plan", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [planId, toast]);
  const loadAssignments = useCallback(async (day: number) => {
    if (!planId) return;
      const res = await sendPostRequest("reading-plans", "get-plan-assignments", { planId, dayNumber: day + 1 });
      if (res?.returnCode === 200) setAssignments(res.returnData?.chapters || []);
    } catch {}
  }, [planId]);
  useEffect(() => { loadPlan(); }, [loadPlan]);
  useEffect(() => { loadAssignments(currentDay); }, [currentDay, loadAssignments]);
  const markDayComplete = useCallback(async () => {
    setCompleting(true);
      const res = await sendPostRequest("reading-plans", "complete-day", { planId, dayNumber: currentDay + 1 });
      if (res?.returnCode === 200) { setCompletedDays(prev => new Set([...prev, currentDay])); setCurrentDay(d => d + 1); toast({ title: "Day completed!" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setCompleting(false); }
  }, [planId, currentDay, toast]);
  return { plan, loading, currentDay, setCurrentDay, assignments, completedDays, completing, markDayComplete };
}

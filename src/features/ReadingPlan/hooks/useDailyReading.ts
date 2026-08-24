// useDailyReading — all state for DailyReading page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export function useDailyReading() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [completing, setCompleting] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const loadPlans = useCallback(async () => {
    try {
      const res = await sendPostRequest("reading-plans", "get-user-plans", {});
      if (res?.returnCode === 200) setPlans(res.returnData || []);
    } catch {}
  }, []);
  const loadAssignments = useCallback(async (planId: string) => {
    setLoading(true);
      const res = await sendPostRequest("reading-plans", "get-plan-assignments", { planId, dayNumber: currentDay + 1 });
      if (res?.returnCode === 200) setAssignments(res.returnData?.chapters || []);
    } catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [currentDay, toast]);
  useEffect(() => { loadPlans(); }, [loadPlans]);
  useEffect(() => { if (selectedPlan) loadAssignments(selectedPlan.plan_id || selectedPlan.planId); }, [selectedPlan, loadAssignments]);
  const markComplete = useCallback(async () => {
    if (!selectedPlan) return;
    setCompleting(true);
      const res = await sendPostRequest("reading-plans", "complete-day", { planId: selectedPlan.plan_id || selectedPlan.planId, dayNumber: currentDay + 1 });
      if (res?.returnCode === 200) { toast({ title: "Day completed!" }); setCurrentDay(d => d + 1); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setCompleting(false); }
  }, [selectedPlan, currentDay, toast]);
  return {
    assignments, loading, currentDay, setCurrentDay, selectedPlan, setSelectedPlan,
    plans, completing, markComplete, quizOpen, setQuizOpen, quizAnswers, setQuizAnswers,
  };
}

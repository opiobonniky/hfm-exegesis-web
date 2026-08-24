// Lab useLabFlow — useLabFlow state and API logic
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";

export interface LabStage {
  type: string;
  title: string;
  description: string;
  completed: boolean;
  data?: any;
}
export function useLabFlow(planId?: string) {
  const { user } = useAuth();
  const [stages, setStages] = useState<LabStage[]>([]);
  const [activeStage, setActiveStage] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchSession = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const res = await sendPostRequest("exegesis", "get-session-detail", { sessionId: planId });
      if (res.returnCode === 200 && res.returnData) {
        setSession(res.returnData);
        setStages(res.returnData.stages || []);
        setActiveStage(res.returnData.currentStage || 0);
      }
    } catch (e) {
      console.error("Failed to fetch lab session", e);
    } finally {
      setLoading(false);
    }
  }, [planId]);
  useEffect(() => { fetchSession(); }, [fetchSession]);
  const saveStage = useCallback(async (stageData: any) => {
    if (!user?.id || !planId) return;
    setSaving(true);
      await sendPostRequest("exegesis", "save-stage", { sessionId: planId, stage: String(activeStage), content: JSON.stringify(stageData) });
      const updated = [...stages];
      updated[activeStage] = { ...updated[activeStage], completed: true, data: stageData };
      setStages(updated);
      if (activeStage < stages.length - 1) {
        setActiveStage(activeStage + 1);
      console.error("Failed to save stage", e);
      setSaving(false);
  }, [user?.id, planId, activeStage, stages]);
  const goToStage = useCallback((index: number) => {
    if (index >= 0 && index < stages.length) setActiveStage(index);
  }, [stages.length]);
  return {
    session,
    stages,
    activeStage,
    currentStage: stages[activeStage],
    loading,
    saving,
    saveStage,
    goToStage,
    refresh: fetchSession,
  };

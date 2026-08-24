// Lab useLabSession — useLabSession state and API logic
import { useState, useCallback } from "react";
import { labApi } from "../services/labApi";

export function useLabSession() {
  const [session, setSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.allSettled([
        labApi.getCurrentSession(),
        labApi.getSessionHistory(0, 20),
      ]);
      if (currentRes.status === "fulfilled" && currentRes.value) setSession(currentRes.value);
      if (historyRes.status === "fulfilled" && historyRes.value) setHistory(historyRes.value.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  const startSession = useCallback(async (data: any) => {
    const res = await labApi.startSession(data);
    if (res.returnCode === 200) { setSession(res.returnData); return res.returnData; }
    return null;
  const saveStage = useCallback(async (sessionId: string, stage: string, content: string) => {
    const res = await labApi.saveStage(sessionId, stage, content);
    return res.returnCode === 200;
  return { session, history, loading, loadSession, startSession, saveStage };
}

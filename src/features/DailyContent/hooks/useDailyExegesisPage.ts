import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export function useDailyExegesisPage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exegesis, setExegesis] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);

  const loadExegesis = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [todayRes, listRes] = await Promise.all([
        sendPostRequest("bible", "get-todays-exegesis", {}),
        sendPostRequest("bible", "get-daily-exegesis-list", { page: 0, size: 10 }),
      ]);
      if (todayRes?.returnCode === 200) setExegesis(todayRes.returnData);
      if (listRes?.returnCode === 200) setSeries(listRes.returnData?.content || []);
    } catch { setError("Failed to load exegesis"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadExegesis(); }, [loadExegesis]);

  return { navigate, t, isRtl, loading, error, exegesis, series, refresh: loadExegesis };
}

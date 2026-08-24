// useDashboard — all state for Dashboard page
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";

export function useDashboard() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [dailyDevotion, setDailyDevotion] = useState<any>(null);
  const [recentJournal, setRecentJournal] = useState<any[]>([]);
  const [stats, setStats] = useState({ plansActive: 0, versesRead: 0, journalEntries: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [verseRes, devotionRes, journalRes] = await Promise.all([
        sendPostRequest("bible", "get-daily-verse", {}),
        sendPostRequest("bible", "get-daily-devotion", {}),
        sendPostRequest("journal", "get-recent", { limit: 5 }),
      ]);
      if (verseRes?.returnCode === 200) setDailyVerse(verseRes.returnData);
      if (devotionRes?.returnCode === 200) setDailyDevotion(devotionRes.returnData);
      if (journalRes?.returnCode === 200) setRecentJournal(journalRes.returnData?.entries || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { t, isRtl, navigate, userInfo, dailyVerse, dailyDevotion, recentJournal, stats, loading };
}

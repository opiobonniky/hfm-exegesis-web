// Home useUserDashboard — useUserDashboard state and API logic
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRTL } from "@/providers/RTLProvider";
import { sendPostRequest } from "@/services/api";
import { getCurrentSession } from "@/services/exegesisApi";

import type { UserDashboardVerse, UserDashboardPlan, UserDashboardStats, UserDashboardActivity } from "../types";

export function useUserDashboard() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { isRtl } = useRTL();
  const [dailyVerse, setDailyVerse] = useState<UserDashboardVerse | null>(null);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [readingPlans, setReadingPlans] = useState<UserDashboardPlan[]>([]);
  const [stats, setStats] = useState<UserDashboardStats>({
    chaptersRead: 0, highlights: 0, notes: 0, favorites: 0, journalEntries: 0,
  });
  const [recentActivity, setRecentActivity] = useState<UserDashboardActivity[]>([]);
  const [lastRead, setLastRead] = useState<UserDashboardActivity | null>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [dailyExegesis, setDailyExegesis] = useState<any>(null);
  const [dailyDevotion, setDailyDevotion] = useState<any>(null);
  const [latestEntry, setLatestEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [verseRes, statsRes, plansRes, journalRes, readHistoryRes, journalListRes] = await Promise.all([
        sendPostRequest("bible", "get-todays-verse", {}),
        sendPostRequest("bible", "get-home-stats", {}),
        sendPostRequest("reading-plans", "get-user-plans", {}),
        sendPostRequest("journal", "stats", {}),
        sendPostRequest("bible", "get-read-history", { page: 0, pageSize: 1 }),
        sendPostRequest("journal", "get-all", { page: 0, pageSize: 1 }),
      ]);
      if (statsRes.returnCode === 200 && statsRes.returnData) {
        const d = statsRes.returnData;
        setStats({
          chaptersRead: d.chaptersRead ?? 0,
          highlights: d.highlights ?? 0,
          notes: d.notes ?? 0,
          favorites: d.favorites ?? 0,
          journalEntries: journalRes.returnData?.totalEntries ?? 0,
        });
        setRecentActivity(d.recentActivity ?? []);
      }
      if (plansRes.returnCode === 200) setReadingPlans(plansRes.returnData?.slice(0, 3) ?? []);
      if (readHistoryRes.returnCode === 200 && readHistoryRes.returnData?.readHistories?.length > 0) {
        const hist = readHistoryRes.returnData.readHistories[0];
        setLastRead({ bookName: hist.bookName, chapter: hist.chapter, updatedOn: hist.updatedOn || hist.createdOn });
      }
      if (journalListRes.returnCode === 200 && journalListRes.returnData?.entries?.length > 0) {
        setLatestEntry(journalListRes.returnData.entries[0]);
      }
      if (verseRes.returnCode === 200 && verseRes.returnData) {
        const v = verseRes.returnData;
        setDailyVerse({ bookName: v.bookName, chapter: v.chapter, verseNumber: v.verseNumber, reflection: v.reflection });
      }
      // Parallel background fetches
      const [sessionRes, exegesisRes, devotionRes] = await Promise.allSettled([
        getCurrentSession(),
        sendPostRequest("bible", "get-todays-exegesis", {}),
        sendPostRequest("bible", "get-todays-devotion", {}),
      ]);
      if (sessionRes.status === "fulfilled" && sessionRes.value && !sessionRes.value.completed) {
        setCurrentSession(sessionRes.value);
      }
      if (exegesisRes.status === "fulfilled" && exegesisRes.value.returnCode === 200) {
        setDailyExegesis(exegesisRes.value.returnData);
      }
      if (devotionRes.status === "fulfilled" && devotionRes.value.returnCode === 200) {
        setDailyDevotion(devotionRes.value.returnData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived values ──
  const name = userInfo?.firstName || userInfo?.lastName || userInfo?.username || "Friend";
  const initial = name.charAt(0).toUpperCase();

  return {
    navigate, isRtl, name, initial,
    dailyVerse, verseText, readingPlans, stats, recentActivity,
    lastRead, currentSession, dailyExegesis, dailyDevotion, latestEntry,
    loading, fetchAll,
  };
}

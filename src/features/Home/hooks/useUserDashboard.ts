// Home useUserDashboard — useUserDashboard state and API logic
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { getCurrentSession, type ExegesisSession } from "@/services/exegesisApi";
import { homeApi } from "../services/homeApi";

import type {
  UserDashboardActivity,
  UserDashboardDevotion,
  UserDashboardExegesis,
  UserDashboardJournalEntry,
  UserDashboardPlan,
  UserDashboardStats,
  UserDashboardVerse,
} from "../types";

interface RecentActivityResponse {
  id: string | number;
  type: string;
  book?: string;
  chapter?: number;
  verse?: number;
  time?: string;
}

export function useUserDashboard() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { isRtl } = useLanguage();
  const [dailyVerse, setDailyVerse] = useState<UserDashboardVerse | null>(null);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [readingPlans, setReadingPlans] = useState<UserDashboardPlan[]>([]);
  const [stats, setStats] = useState<UserDashboardStats>({
    chaptersRead: 0, highlights: 0, notes: 0, favorites: 0, journalEntries: 0,
  });
  const [recentActivity, setRecentActivity] = useState<UserDashboardActivity[]>([]);
  const [lastRead, setLastRead] = useState<UserDashboardActivity | null>(null);
  const [currentSession, setCurrentSession] = useState<ExegesisSession | null>(null);
  const [dailyExegesis, setDailyExegesis] = useState<UserDashboardExegesis | null>(null);
  const [dailyDevotion, setDailyDevotion] = useState<UserDashboardDevotion | null>(null);
  const [latestEntry, setLatestEntry] = useState<UserDashboardJournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [verseRes, statsRes, plansRes, journalRes, readHistoryRes, journalListRes, activityRes] = await Promise.all([
        homeApi.getTodaysVerse(),
        homeApi.getUserDashboard(),
        homeApi.getUserPlans(),
        homeApi.getJournalStats(),
        homeApi.getReadHistory(),
        homeApi.getLatestJournal(),
        homeApi.getRecentActivity(),
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
      }
      if (activityRes.returnCode === 200 && Array.isArray(activityRes.returnData)) {
        setRecentActivity(activityRes.returnData.map((activity: RecentActivityResponse) => ({
          id: String(activity.id),
          type: activity.type,
          title: activity.book || "Activity",
          description: activity.type,
          updatedOn: activity.time || "",
          bookName: activity.type === "plan" ? undefined : activity.book,
          chapter: activity.type === "plan" ? undefined : activity.chapter,
          verseNumber: activity.type === "plan" ? undefined : activity.verse,
        })));
      }
      if (plansRes.returnCode === 200) setReadingPlans(plansRes.returnData?.slice(0, 3) ?? []);
      if (readHistoryRes.returnCode === 200 && readHistoryRes.returnData?.readHistories?.length > 0) {
        const hist = readHistoryRes.returnData.readHistories[0];
        const lastRead: UserDashboardActivity = {
          id: String(hist.id ?? ""),
          type: "read",
          title: hist.bookName,
          description: "Continue reading",
          updatedOn: hist.updatedOn || hist.createdOn,
          bookName: hist.bookName,
          chapter: hist.chapter,
        };
        setLastRead(lastRead);
      }
      if (journalListRes.returnCode === 200 && journalListRes.returnData?.entries?.length > 0) {
        setLatestEntry(journalListRes.returnData.entries[0]);
      }
      if (verseRes.returnCode === 200 && verseRes.returnData) {
        const v = verseRes.returnData;
        setDailyVerse({
          id: v.id,
          bookName: v.bookName,
          chapter: v.chapter,
          verseNumber: v.verseNumber,
          verseText: v.verseText ?? v.verse_text ?? v.text ?? "",
          reflection: v.reflection ?? "",
          displayDate: v.displayDate ?? "",
        });
      }
      // Parallel background fetches
      const [sessionRes, exegesisRes, devotionRes] = await Promise.allSettled([
        getCurrentSession(),
        homeApi.getTodaysExegesis(),
        homeApi.getTodaysDevotion(),
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
    data: {
      isRtl, name, initial, dailyVerse, verseText, readingPlans, stats, recentActivity,
      lastRead, currentSession, dailyExegesis, dailyDevotion, latestEntry, loading,
    },
    actions: { navigate, fetchAll },
  };
}

export type UserDashboardPageModel =
  ReturnType<typeof useUserDashboard>["data"] &
  ReturnType<typeof useUserDashboard>["actions"];

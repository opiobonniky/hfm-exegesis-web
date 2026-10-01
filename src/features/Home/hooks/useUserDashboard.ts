// Home useUserDashboard — useUserDashboard state and API logic
import { useState, useCallback, useEffect, useRef } from "react";
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
import { tt } from '@/components/languages/hardcodedTranslate';

interface RecentActivityResponse {
  id: string | number;
  type: string;
  book?: string;
  chapter?: number;
  verse?: number;
  time?: string;
}

/**
 * Upper bound on how long the full-page skeleton may block first paint. Every
 * card below renders `null` until its data arrives, so painting the real page
 * early and streaming the rest in always beats holding a static skeleton.
 */
const SKELETON_MAX_MS = 1200;

type CriticalResults = [
  Awaited<ReturnType<typeof homeApi.getTodaysVerse>>,
  Awaited<ReturnType<typeof homeApi.getUserDashboard>>,
  Awaited<ReturnType<typeof homeApi.getUserPlans>>,
  Awaited<ReturnType<typeof homeApi.getJournalStats>>,
  Awaited<ReturnType<typeof homeApi.getReadHistory>>,
  Awaited<ReturnType<typeof homeApi.getLatestJournal>>,
  Awaited<ReturnType<typeof homeApi.getRecentActivity>>,
];

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

  // Guards every state write: the hook can be unmounted (or a second fetch can
  // start) while requests are still in flight.
  const aliveRef = useRef(true);

  const fetchAll = useCallback(async () => {
    aliveRef.current = true;
    setLoading(true);

    // One round trip for everything the first paint needs.
    const critical = Promise.all([
      homeApi.getTodaysVerse(),
      homeApi.getUserDashboard(),
      homeApi.getUserPlans(),
      homeApi.getJournalStats(),
      homeApi.getReadHistory(),
      homeApi.getLatestJournal(),
      homeApi.getRecentActivity(),
    ]);
    // Stop blocking on `critical` after SKELETON_MAX_MS; every card renders
    // `null` until its own data lands, so painting early always beats holding
    // a static skeleton.
    const timeout = new Promise<'timeout'>((resolve) => {
      window.setTimeout(() => resolve('timeout'), SKELETON_MAX_MS);
    });
    const outcome = await Promise.race([critical.then(() => 'done' as const), timeout]);
    if (aliveRef.current) setLoading(false);
    if (outcome === 'timeout') void critical.catch(() => undefined);

    let results: CriticalResults;
    try {
      results = await critical;
    } catch (e) {
      console.error(e);
      return;
    }
    if (!aliveRef.current) return;

    const [verseRes, statsRes, plansRes, journalRes, readHistoryRes, journalListRes, activityRes] = results;

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
    // `returnData` is an array, but a non-array payload must not throw and take
    // the rest of the dashboard down with it.
    if (plansRes.returnCode === 200) {
      const plans = Array.isArray(plansRes.returnData)
        ? plansRes.returnData
        : Array.isArray((plansRes.returnData as { plans?: unknown } | undefined)?.plans)
          ? (plansRes.returnData as { plans: UserDashboardPlan[] }).plans
          : [];
      setReadingPlans(plans.slice(0, 3));
    }
    if (readHistoryRes.returnCode === 200 && readHistoryRes.returnData?.readHistories?.length > 0) {
      const hist = readHistoryRes.returnData.readHistories[0];
      const lastRead: UserDashboardActivity = {
        id: String(hist.id ?? ""),
        type: "read",
        title: hist.bookName,
        description: tt("Continue reading"),
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

    // Everything below is secondary: daily content is prose that goes through
    // the backend translator with a long time budget, and an active session
    // spans several tables. None of it blocks the first paint - each card
    // renders itself as soon as its request lands.
    void Promise.allSettled([
      getCurrentSession()
        .then((value) => {
          if (aliveRef.current && value && !value.completed) setCurrentSession(value);
        })
        .catch((error) => console.error('[Dashboard] session failed', error)),
      homeApi.getTodaysExegesis().then((res) => {
        if (aliveRef.current && res.returnCode === 200) setDailyExegesis(res.returnData);
      }),
      homeApi.getTodaysDevotion().then((res) => {
        if (aliveRef.current && res.returnCode === 200) setDailyDevotion(res.returnData);
      }),
    ]);
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    fetchAll();
    return () => { aliveRef.current = false; };
  }, [fetchAll]);

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

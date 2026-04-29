"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  BadgeCheck,
  BookOpenCheck,
  ShieldCheck,
  Shield,
  BookOpen,
  TrendingUp,
  Calendar,
  RefreshCw,
  Activity,
  ScrollText,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  BadgeX,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  LogIn,
  LogOut,
  AlertTriangle,
  Wifi,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendPostRequest } from "@/services/api";
import { getVerseText } from "@/utilities/bibleUtils";
import { routes } from "@/components/Routes/routes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminCount: number;
  memberCount: number;
  newUsersThisMonth: number;
  totalPlans: number;
  activePlans: number;
  totalEnrollments: number;
  completedEnrollments: number;
  activeRate: number;
  verificationRate: number;
  completionRate: number;
}
interface RecentUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
  status: boolean;
  isVerified: boolean;
  createdOn: string;
}
interface ReadingPlan {
  planId: string;
  title: string;
  totalDays: number;
  total_days?: number;
  category: string;
  difficulty: string;
  isActive: boolean;
  is_active?: boolean;
  started: boolean;
  completed: boolean;
  progress: number;
  streak: number;
  questionsEnabled: boolean;
  questions_enabled?: boolean;
}
interface DailyVerse {
  id: number;
  verseReference: string;
  reflection: string;
  displayDate: string;
  published: boolean;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
}
interface ActivityRecord {
  id: number;
  userId: number;
  username: string;
  email?: string;
  ip: string;
  browserName: string;
  os: string;
  deviceType: string;
  deviceName: string;
  engine: string;
  locale: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  loggedInAt: string;
  loggedOutAt?: string;
}

// ─────────────────────────────────────────────
// Hooks & tiny utils
// ─────────────────────────────────────────────
const useCountUp = (target: number, duration = 1000, active = true) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active || target === 0) {
      setVal(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return val;
};

const timeAgo = (ts: string) => {
  if (!ts) return "—";
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─────────────────────────────────────────────
// Micro-components
// ─────────────────────────────────────────────
const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-lg bg-stone-100", className)} />
);

const PALETTE = [
  "#d97706",
  "#0891b2",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#2563eb",
  "#0d9488",
];
const avatarColor = (u: string) => {
  let h = 0;
  for (const c of u) h += c.charCodeAt(0);
  return PALETTE[h % PALETTE.length];
};
const Av = ({ f, l, u }: { f: string; l: string; u: string }) => (
  <div
    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white shrink-0"
    style={{ backgroundColor: avatarColor(u) }}
  >
    {(f?.[0] ?? "?").toUpperCase()}
    {(l?.[0] ?? "?").toUpperCase()}
  </div>
);

const DeviceIcon = ({
  type,
  className,
}: {
  type: string;
  className?: string;
}) => {
  const t = (type ?? "").toUpperCase();
  if (t === "MOBILE") return <Smartphone className={className} />;
  if (t === "TABLET") return <Tablet className={className} />;
  if (t === "BOT") return <Globe className={className} />;
  return <Monitor className={className} />;
};

// ── KPI card — compact on mobile, normal on sm+ ──
const KPI = ({
  label,
  value,
  icon: Icon,
  accent,
  iconBg,
  iconColor,
  sub,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  iconColor: string;
  sub?: string;
  loading?: boolean;
}) => {
  const n = useCountUp(value, 900, !loading);
  return (
    <div
      className={cn(
        "relative bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200",
      )}
    >
      <div
        className={cn(
          "absolute top-0 inset-x-0 h-[3px] rounded-t-xl sm:rounded-t-2xl",
          accent,
        )}
      />
      {/* Mobile layout: icon left, text right in a row */}
      <div className="p-3 pt-4 sm:p-5 sm:pt-6">
        {loading ? (
          <div className="flex items-center gap-2.5 sm:block">
            <Shimmer className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0 sm:mb-4" />
            <div className="flex-1 sm:block space-y-1.5 sm:space-y-0">
              <Shimmer className="h-5 sm:h-7 w-14 sm:w-16 sm:mb-2" />
              <Shimmer className="h-2.5 sm:h-3 w-20 sm:w-24" />
            </div>
          </div>
        ) : (
          // Mobile: horizontal pill layout
          <div className="flex items-center gap-2.5 sm:block">
            <div
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 sm:mb-4",
                iconBg,
              )}
            >
              <Icon
                className={cn("w-4 h-4 sm:w-[18px] sm:h-[18px]", iconColor)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xl sm:text-[26px] font-bold text-stone-800 tracking-tight leading-none"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {n.toLocaleString()}
              </p>
              <p className="text-[11px] sm:text-sm text-stone-500 mt-0.5 sm:mt-1.5 font-medium leading-tight truncate">
                {label}
              </p>
              {sub && (
                <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5 truncate hidden sm:block">
                  {sub}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RateBar = ({
  label,
  value,
  fill,
  loading,
}: {
  label: string;
  value: number;
  fill: string;
  loading?: boolean;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs sm:text-sm">
      <span className="text-stone-500 font-medium">{label}</span>
      {loading ? (
        <Shimmer className="w-8 sm:w-10 h-3 sm:h-3.5" />
      ) : (
        <span className="font-bold text-stone-700">{value}%</span>
      )}
    </div>
    <div className="h-1.5 sm:h-2 rounded-full bg-stone-100 overflow-hidden">
      {!loading && (
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            fill,
          )}
          style={{ width: `${value}%` }}
        />
      )}
    </div>
  </div>
);

const DIFF: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actLoad, setActLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  // ── Derived activity metrics ────────────────
  const actStats = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLogins = activity.filter(
      (a) => a.success && new Date(a.loggedInAt) >= todayStart,
    ).length;
    const failedToday = activity.filter(
      (a) => !a.success && new Date(a.loggedInAt) >= todayStart,
    ).length;
    const activeSessions = activity.filter(
      (a) => a.success && !a.loggedOutAt,
    ).length;
    const deviceCounts = activity.reduce<Record<string, number>>((acc, a) => {
      const t = a.deviceType || "UNKNOWN";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const browserCounts = activity.reduce<Record<string, number>>((acc, a) => {
      const b = (a.browserName || "Unknown").split(" ")[0];
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {});
    const topBrowser =
      Object.entries(browserCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return {
      todayLogins,
      failedToday,
      activeSessions,
      deviceCounts,
      topBrowser,
    };
  }, [activity]);

  const fetchActivity = useCallback(async () => {
    setActLoad(true);
    try {
      const r: any = await sendPostRequest("admin", "get-all-activity", {
        page: 1,
        pageSize: 20,
      });
      if (r?.returnCode === 200) {
        const activityData = r.returnData;
        setActivity(
          Array.isArray(activityData)
            ? activityData
            : (activityData?.sessions ?? []),
        );
      }
    } catch {
    } finally {
      setActLoad(false);
    }
  }, []);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [sR, uR, pR, vR] = await Promise.allSettled([
        sendPostRequest("admin", "get-admin-dashboard-stats", {}),
        sendPostRequest("admin", "get-users-by-admin", {
          page: 1,
          pageSize: 6,
        }),
        sendPostRequest("reading-plans", "get-all", {}),
        sendPostRequest("bible", "get-todays-verse", {}),
      ]);
      if (sR.status === "fulfilled" && (sR.value as any)?.returnCode === 200)
        setStats((sR.value as any).returnData);
      if (uR.status === "fulfilled" && (uR.value as any)?.returnCode === 200) {
        const usersData = (uR.value as any).returnData;
        const usersArray = Array.isArray(usersData)
          ? usersData
          : (usersData?.users ?? []);
        setRecentUsers(usersArray.slice(0, 6));
      }
      if (pR.status === "fulfilled" && (pR.value as any)?.returnCode === 200) {
        const plansData = (pR.value as any).returnData;
        const plansArray = plansData?.plans ?? plansData ?? [];
        const plansWithDefaults = (
          Array.isArray(plansArray) ? plansArray : []
        ).map((p: any) => ({
          ...p,
          totalDays: p.totalDays ?? p.total_days ?? 0,
          isActive: p.isActive ?? p.is_active ?? true,
          questionsEnabled: p.questionsEnabled ?? p.questions_enabled ?? false,
          started: p.started ?? false,
          completed: p.completed ?? false,
          progress: p.progress ?? 0,
          streak: p.streak ?? 0,
        }));
        setPlans(plansWithDefaults);
      }
      if (vR.status === "fulfilled" && (vR.value as any)?.returnCode === 200)
        setVerse((vR.value as any).returnData);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchActivity();
  }, [fetchAll, fetchActivity]);

  // ── Device breakdown bar ─────────────────────
  const DeviceBar = () => {
    const total = Object.values(actStats.deviceCounts).reduce(
      (a, b) => a + b,
      0,
    );
    if (total === 0)
      return (
        <p className="text-xs text-stone-400 text-center py-2">No data yet</p>
      );
    const items = [
      {
        key: "DESKTOP",
        label: "Desktop",
        color: "bg-indigo-500",
        Icon: Monitor,
      },
      {
        key: "MOBILE",
        label: "Mobile",
        color: "bg-emerald-500",
        Icon: Smartphone,
      },
      { key: "TABLET", label: "Tablet", color: "bg-amber-500", Icon: Tablet },
      { key: "BOT", label: "Bot", color: "bg-rose-400", Icon: Globe },
    ];
    return (
      <div className="space-y-3">
        <div className="flex h-2.5 sm:h-3 rounded-full overflow-hidden gap-px">
          {items.map(({ key, color }) => {
            const pct = Math.round(
              ((actStats.deviceCounts[key] ?? 0) / total) * 100,
            );
            return pct > 0 ? (
              <div
                key={key}
                className={cn("h-full transition-all duration-700", color)}
                style={{ width: `${pct}%` }}
              />
            ) : null;
          })}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {items.map(({ key, label, color, Icon }) => {
            const count = actStats.deviceCounts[key] ?? 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full shrink-0", color)} />
                <Icon className="w-3 h-3 text-stone-400 shrink-0" />
                <span className="text-[11px] text-stone-500 font-medium">
                  {label}
                </span>
                <span className="ml-auto text-[11px] font-bold text-stone-700">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#f7f5f2]"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
    >
      {/* top accent bar */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* ── Header ───────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase mb-1.5 sm:mb-2">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Admin
              Console
            </div>
            <h1
              className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800 tracking-tight leading-none"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Platform Overview
            </h1>
            {/* date hidden on smallest screens to save space */}
            <p className="text-stone-400 text-xs sm:text-sm mt-1 sm:mt-1.5 items-center gap-1.5 font-medium hidden xs:flex sm:flex">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{today}</span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              fetchAll(true);
              fetchActivity();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-700 text-xs sm:text-sm shadow-sm transition-all shrink-0 font-medium"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", refreshing && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-700 font-medium">
            ⚠ {error}
          </div>
        )}

        {/* ── Primary KPIs — 2 col mobile, 4 col lg ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <KPI
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            accent="bg-blue-500"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            sub={`${stats?.newUsersThisMonth ?? 0} new this month`}
            loading={loading}
          />
          <KPI
            label="Active Accounts"
            value={stats?.activeUsers ?? 0}
            icon={UserCheck}
            accent="bg-emerald-500"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            sub={`${stats?.inactiveUsers ?? 0} inactive`}
            loading={loading}
          />
          <KPI
            label="Verified Emails"
            value={stats?.verifiedUsers ?? 0}
            icon={BadgeCheck}
            accent="bg-sky-500"
            iconBg="bg-sky-50"
            iconColor="text-sky-600"
            sub={`${stats?.unverifiedUsers ?? 0} pending`}
            loading={loading}
          />
          <KPI
            label="Enrollments"
            value={stats?.totalEnrollments ?? 0}
            icon={BookOpenCheck}
            accent="bg-violet-500"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            sub={`${stats?.completedEnrollments ?? 0} completed`}
            loading={loading}
          />
        </div>

        {/* ── Secondary KPIs — 2 col mobile, 4 col lg ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <KPI
            label="Admins"
            value={stats?.adminCount ?? 0}
            icon={ShieldCheck}
            accent="bg-violet-400"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            loading={loading}
          />
          <KPI
            label="Members"
            value={stats?.memberCount ?? 0}
            icon={Shield}
            accent="bg-stone-400"
            iconBg="bg-stone-100"
            iconColor="text-stone-600"
            loading={loading}
          />
          <KPI
            label="Reading Plans"
            value={stats?.totalPlans ?? 0}
            icon={BookOpen}
            accent="bg-teal-500"
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            sub={`${stats?.activePlans ?? 0} active`}
            loading={loading}
          />
          <KPI
            label="New This Month"
            value={stats?.newUsersThisMonth ?? 0}
            icon={TrendingUp}
            accent="bg-amber-400"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            loading={loading}
          />
        </div>

        {/* ── Activity KPIs ─────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            <h2 className="text-xs sm:text-sm font-bold text-stone-600 uppercase tracking-widest">
              Login Activity
            </h2>
            <div className="flex-1 h-px bg-stone-200" />
            <a
              href="/admin/activity"
              className="text-[11px] sm:text-xs text-stone-400 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
            >
              Full report <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>
          </div>
          {/* 3 cols on sm+, 1 col (horizontal scroll row) on mobile */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <KPI
              label="Logins Today"
              value={actStats.todayLogins}
              icon={LogIn}
              accent="bg-indigo-500"
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              sub="Successful"
              loading={actLoad}
            />
            <KPI
              label="Failed Today"
              value={actStats.failedToday}
              icon={AlertTriangle}
              accent="bg-rose-400"
              iconBg="bg-rose-50"
              iconColor="text-rose-500"
              sub="Bad credentials"
              loading={actLoad}
            />
            <KPI
              label="Active Sessions"
              value={actStats.activeSessions}
              icon={Wifi}
              accent="bg-teal-500"
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              sub="Currently online"
              loading={actLoad}
            />
          </div>
        </div>

        {/* ── Health + Verse — stacked on mobile ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Platform Health */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-stone-100">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700">
                Platform Health
              </h3>
            </div>
            <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-5">
              <RateBar
                label="Active user rate"
                value={stats?.activeRate ?? 0}
                fill="bg-emerald-500"
                loading={loading}
              />
              <RateBar
                label="Email verification"
                value={stats?.verificationRate ?? 0}
                fill="bg-sky-500"
                loading={loading}
              />
              <RateBar
                label="Plan completion"
                value={stats?.completionRate ?? 0}
                fill="bg-violet-500"
                loading={loading}
              />
              {!loading && (
                <div className="pt-3 sm:pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
                  {[
                    {
                      pct: stats?.activeRate ?? 0,
                      label: "Active",
                      color: "text-emerald-600",
                    },
                    {
                      pct: stats?.verificationRate ?? 0,
                      label: "Verified",
                      color: "text-sky-600",
                    },
                    {
                      pct: stats?.completionRate ?? 0,
                      label: "Complete",
                      color: "text-violet-600",
                    },
                  ].map(({ pct, label, color }) => (
                    <div key={label}>
                      <p
                        className={cn("text-lg sm:text-2xl font-bold", color)}
                        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                      >
                        {pct}%
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-widest mt-0.5 font-semibold">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily Verse */}
          <div className="lg:col-span-2 relative bg-white rounded-xl sm:rounded-2xl border border-amber-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-orange-50/20 to-white pointer-events-none" />
            <div
              className="absolute top-1 right-3 sm:top-2 sm:right-4 text-[60px] sm:text-[90px] leading-none text-amber-100 select-none pointer-events-none"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-amber-100/70">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-700">
                  Today's Daily Verse
                </h3>
                {verse && (
                  <span
                    className={cn(
                      "ml-auto px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border",
                      verse.published
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200",
                    )}
                  >
                    {verse.published ? "Published" : "Draft"}
                  </span>
                )}
              </div>
              <div className="p-3.5 sm:p-5">
                {loading ? (
                  <div className="space-y-2.5 sm:space-y-3">
                    <Shimmer className="h-3.5 sm:h-4 w-28 sm:w-36" />
                    <Shimmer className="h-3.5 sm:h-4 w-full" />
                    <Shimmer className="h-3.5 sm:h-4 w-5/6" />
                    <Shimmer className="h-3 w-2/3 mt-2 sm:mt-3" />
                  </div>
                ) : verse ? (
                  <>
                    <p className="text-amber-600 font-bold text-xs sm:text-sm mb-2 sm:mb-3">
                      {verse.verseReference ??
                        `${verse.bookName ?? ""} ${verse.chapter ?? ""}:${verse.verseNumber ?? ""}`}
                    </p>
                    <blockquote
                      className="text-stone-700 text-sm sm:text-base leading-relaxed italic mb-2 sm:mb-3 border-l-2 border-amber-300 pl-3 sm:pl-4"
                      style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                    >
                      {getVerseText(
                        verse.bookName,
                        Number(verse.chapter),
                        Number(verse.verseNumber),
                      )}
                    </blockquote>
                    {verse.reflection && (
                      <p className="text-stone-400 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                        {verse.reflection}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center py-6 sm:py-8 text-center">
                    <ScrollText className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200 mb-2" />
                    <p className="text-stone-400 text-xs sm:text-sm font-medium">
                      No verse scheduled for today
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reading Plans + Recent Users — stacked on mobile ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Reading Plans */}
          <div className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-stone-100">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700">
                Reading Plans
              </h3>
              {!loading && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 text-[10px] font-bold">
                  {plans.length}
                </span>
              )}
              <a
                href={routes.readingPlans.path}
                className="ml-auto text-[11px] sm:text-xs text-stone-400 hover:text-teal-600 flex items-center gap-0.5 sm:gap-1 font-medium transition-colors"
              >
                View all <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </a>
            </div>
            <div className="divide-y divide-stone-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3 sm:py-4"
                  >
                    <Shimmer className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5 sm:space-y-2">
                      <Shimmer className="h-3 sm:h-3.5 w-28 sm:w-32" />
                      <Shimmer className="h-2.5 w-16 sm:w-20" />
                    </div>
                    <Shimmer className="h-4 sm:h-5 w-12 sm:w-14 rounded-full" />
                  </div>
                ))
              ) : plans.length === 0 ? (
                <div className="flex flex-col items-center py-10 sm:py-12 text-stone-300">
                  <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 mb-2" />
                  <p className="text-xs sm:text-sm">No reading plans yet</p>
                </div>
              ) : (
                plans.slice(0, 6).map((plan) => {
                  const pct =
                    plan.totalDays > 0
                      ? Math.round((plan.progress / plan.totalDays) * 100)
                      : 0;
                  const diffStyle =
                    DIFF[plan.difficulty] ??
                    "bg-stone-50 text-stone-600 border-stone-200";
                  return (
                    <div
                      key={plan.planId}
                      className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3 hover:bg-stone-50/70 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0",
                          plan.isActive ? "bg-teal-50" : "bg-stone-100",
                        )}
                      >
                        <BookOpen
                          className={cn(
                            "w-3.5 h-3.5 sm:w-4 sm:h-4",
                            plan.isActive ? "text-teal-600" : "text-stone-400",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-stone-700 truncate">
                          {plan.title}
                        </p>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] sm:text-[11px] text-stone-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {plan.totalDays}d
                          </span>
                          <span
                            className={cn(
                              "text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded border font-bold uppercase tracking-wide",
                              diffStyle,
                            )}
                          >
                            {plan.difficulty}
                          </span>
                          {plan.questionsEnabled && (
                            <span className="text-[9px] sm:text-[10px] text-violet-600 font-bold">
                              Quiz
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {plan.started ? (
                          plan.completed ? (
                            <div className="flex items-center gap-0.5 sm:gap-1 text-emerald-600">
                              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="text-[11px] sm:text-xs font-bold">
                                Done
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-[11px] sm:text-xs text-stone-500 font-bold">
                                {pct}%
                              </p>
                              <div className="w-12 sm:w-16 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              {plan.streak > 0 && (
                                <p className="text-[9px] sm:text-[10px] text-amber-600 flex items-center gap-0.5 justify-end font-bold">
                                  <Flame className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                  {plan.streak}
                                </p>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="text-[10px] sm:text-[11px] text-stone-300 font-medium">
                            Not started
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-stone-100">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700">
                Recent Users
              </h3>
            </div>
            <div className="divide-y divide-stone-50 flex-1">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3"
                    >
                      <Shimmer className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Shimmer className="h-3 w-20 sm:w-24" />
                        <Shimmer className="h-2.5 w-14 sm:w-16" />
                      </div>
                      <Shimmer className="w-10 sm:w-12 h-4 sm:h-5 rounded-md" />
                    </div>
                  ))
                : recentUsers.map((u) => (
                    <div
                      key={u.username}
                      className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3 hover:bg-stone-50/70 transition-colors"
                    >
                      <Av f={u.firstName} l={u.lastName} u={u.username} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-stone-700 truncate">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-stone-400 font-mono truncate">
                          @{u.username}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={cn(
                            "text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded border",
                            u.roleName === "admin"
                              ? "text-violet-700 border-violet-200 bg-violet-50"
                              : "text-sky-700 border-sky-200 bg-sky-50",
                          )}
                        >
                          {u.roleName}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          {u.isVerified ? (
                            <BadgeCheck className="w-3 h-3 sm:w-3 sm:h-3 text-emerald-500" />
                          ) : (
                            <BadgeX className="w-3 h-3 sm:w-3 sm:h-3 text-amber-400" />
                          )}
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              u.status ? "bg-emerald-500" : "bg-stone-300",
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
            {!loading && recentUsers.length > 0 && (
              <a
                href={routes.systemUsers.path}
                className="flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-stone-100 text-[11px] sm:text-xs text-stone-400 hover:text-indigo-600 hover:bg-stone-50 transition-colors font-semibold"
              >
                View all users{" "}
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* ── Activity Section — stacked on mobile ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Device + Browser breakdown */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-stone-100">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700">
                Device Breakdown
              </h3>
            </div>
            <div className="p-3.5 sm:p-5">
              {actLoad ? (
                <div className="space-y-2.5 sm:space-y-3">
                  <Shimmer className="h-2.5 w-full rounded-full" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Shimmer key={i} className="h-3.5 sm:h-4 w-full" />
                  ))}
                </div>
              ) : (
                <DeviceBar />
              )}
              {!actLoad && (
                <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-stone-100 space-y-1 sm:space-y-1.5">
                  <p className="text-[9px] sm:text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    Top Browser
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
                    <span className="text-xs sm:text-sm font-semibold text-stone-700">
                      {actStats.topBrowser}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent login feed */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-stone-100">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-stone-700">
                Recent Login Activity
              </h3>
              <a
                href={routes.useractivity.path}
                className="ml-auto text-[11px] sm:text-xs text-stone-400 hover:text-emerald-600 flex items-center gap-0.5 sm:gap-1 font-medium transition-colors"
              >
                View all <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </a>
            </div>
            <div className="divide-y divide-stone-50">
              {actLoad ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3"
                  >
                    <Shimmer className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Shimmer className="h-3 w-24 sm:w-32" />
                      <Shimmer className="h-2.5 w-36 sm:w-48" />
                    </div>
                    <Shimmer className="h-3.5 sm:h-4 w-12 sm:w-16" />
                  </div>
                ))
              ) : activity.length === 0 ? (
                <div className="flex flex-col items-center py-10 sm:py-12 text-stone-300">
                  <Activity className="w-7 h-7 sm:w-8 sm:h-8 mb-2" />
                  <p className="text-xs sm:text-sm">No activity recorded yet</p>
                </div>
              ) : (
                activity.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3 hover:bg-stone-50/70 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border-2",
                        a.success
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-rose-50 border-rose-200",
                      )}
                    >
                      <DeviceIcon
                        type={a.deviceType}
                        className={cn(
                          "w-3 h-3 sm:w-3.5 sm:h-3.5",
                          a.success ? "text-emerald-500" : "text-rose-400",
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <p className="text-xs sm:text-sm font-semibold text-stone-700 truncate">
                          {a.username ?? "Unknown"}
                        </p>
                        {!a.success && (
                          <span className="shrink-0 text-[8px] sm:text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 rounded">
                            FAILED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                        <span className="font-medium text-stone-500">
                          {a.browserName || "Unknown"}
                        </span>
                        {" · "}
                        {/* hide OS on very small screens */}
                        <span className="hidden xs:inline sm:inline">
                          {a.os || "Unknown"} ·{" "}
                        </span>
                        <span className="font-mono">{a.ip}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] sm:text-[11px] text-stone-400 font-medium whitespace-nowrap">
                        {timeAgo(a.loggedInAt)}
                      </p>
                      {a.loggedOutAt ? (
                        <p className="text-[9px] sm:text-[10px] text-stone-300 flex items-center gap-0.5 justify-end mt-0.5">
                          <LogOut className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> out
                        </p>
                      ) : a.success ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-emerald-600 font-bold mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                          online
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

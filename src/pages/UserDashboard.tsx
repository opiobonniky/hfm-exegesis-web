import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Clock,
  ChevronRight,
  Loader2,
  CalendarDays,
  Globe,
  Brain,
  Mic2,
  HandHeart,
  BookMarked,
  History,
  Heart,
  Star,
  Flame,
  BookOpen,
  Sparkles,
  Settings,
  TrendingUp,
  ArrowRight,
  Quote,
  PenLine,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { getVerseText } from "@/utilities/bibleUtils";

// ─── Types ─────────────────────────────────────────────────────────────────
interface DailyVerse {
  bookName: string;
  chapter: number;
  verseNumber: number;
  reflection: string;
}

interface ReadingPlan {
  id: string;
  planName: string;
  description: string;
  totalDays: number;
  startDate: string;
  endDate: string;
  completedDays: number;
}

interface Stats {
  chaptersRead: number;
  highlights: number;
  notes: number;
  favorites: number;
  journalEntries: number;
}

interface RecentActivity {
  bookName: string;
  chapter: number;
  updatedOn: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Good Night";
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const formatTime = (ds: string): string => {
  const diff = Date.now() - new Date(ds).getTime();
  const m = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(ds).toLocaleDateString();
};

const getInitials = (first?: string, last?: string, username?: string) => {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first[0].toUpperCase();
  if (username) return username[0].toUpperCase();
  return "U";
};

// ─── Dashboard ─────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);
  const [stats, setStats] = useState<Stats>({
    chaptersRead: 0,
    highlights: 0,
    notes: 0,
    favorites: 0,
    journalEntries: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName =
    userInfo?.firstName || userInfo?.lastName || userInfo?.username || "Friend";
  const initials = getInitials(
    userInfo?.firstName,
    userInfo?.lastName,
    userInfo?.username,
  );

  // ── Data ──
  const exploreItems = useMemo(
    () => [
      {
        id: "1",
        label: "Exegesis Bible",
        sub: "Read & study",
        icon: BookOpen,
        bg: "bg-indigo-600",
        iconBg: "bg-white/15",
        badge: "New",
        badgeCls: "bg-white/20 text-white",
        onPress: () => navigate(routes.bibleReader.path),
      },
      {
        id: "2",
        label: "Daily Verse",
        sub: "Today's word",
        icon: Sun,
        bg: "bg-amber-500",
        iconBg: "bg-white/15",
        badge: null,
        badgeCls: "",
        onPress: () => navigate(routes.userDailyVerse.path),
      },
      {
        id: "3",
        label: "Reading Plans",
        sub: "Guided journeys",
        icon: CalendarDays,
        bg: "bg-emerald-600",
        iconBg: "bg-white/15",
        badge: null,
        badgeCls: "",
        onPress: () => navigate(routes.userPlans.path),
      },
      {
        id: "4",
        label: "Prayer Wall",
        sub: "Lift your voice",
        icon: HandHeart,
        bg: "bg-teal-600",
        iconBg: "bg-white/15",
        badge: null,
        badgeCls: "",
        onPress: () => {},
      },
      {
        id: "5",
        label: "Testify",
        sub: "Share your story",
        icon: Mic2,
        bg: "bg-rose-500",
        iconBg: "bg-white/15",
        badge: null,
        badgeCls: "",
        onPress: () => {},
      },
      {
        id: "6",
        label: "My Journal",
        sub: "Reflect & write",
        icon: PenLine,
        bg: "bg-green-600",
        iconBg: "bg-white/15",
        badge: null,
        badgeCls: "",
        onPress: () => navigate(routes.journal.path),
      },
      {
        id: "6",
        label: "Bible Trivia",
        sub: "Test knowledge",
        icon: Brain,
        bg: "bg-violet-600",
        iconBg: "bg-white/15",
        badge: "Soon",
        badgeCls: "bg-white/20 text-white",
        onPress: () => {},
      },
    ],
    [navigate],
  );

  const statCards = useMemo(
    () => [
      {
        label: "Chapters Read",
        value: stats.chaptersRead,
        icon: BookOpen,
        accent: "#4F46E5",
        lightBg: "#EEF2FF",
        textColor: "#4338CA",
      },
      {
        label: "Highlights",
        value: stats.highlights,
        icon: Star,
        accent: "#D97706",
        lightBg: "#FFFBEB",
        textColor: "#B45309",
      },
      {
        label: "Notes",
        value: stats.notes,
        icon: BookMarked,
        accent: "#7C3AED",
        lightBg: "#F5F3FF",
        textColor: "#6D28D9",
      },
      {
        label: "Journal Entries",
        value: stats.journalEntries,
        icon: PenLine,
        accent: "#059669",
        lightBg: "#ECFDF5",
        textColor: "#047857",
      },
      {
        label: "Favorites",
        value: stats.favorites,
        icon: Heart,
        accent: "#E11D48",
        lightBg: "#FFF1F2",
        textColor: "#BE123C",
      },
    ],
    [stats],
  );

  const quickLinks = useMemo(
    () => [
      {
        id: "1",
        label: "My Notes",
        icon: BookMarked,
        color: "#7C3AED",
        lightBg: "#F5F3FF",
        onPress: () => navigate(routes.myActivity.path),
      },
      {
        id: "2",
        label: "Journal",
        icon: PenLine,
        color: "#059669",
        lightBg: "#ECFDF5",
        onPress: () => navigate(routes.journal.path),
      },
      {
        id: "3",
        label: "History",
        icon: History,
        color: "#059669",
        lightBg: "#ECFDF5",
        onPress: () => navigate(routes.myActivity.path),
      },
      {
        id: "4",
        label: "Highlights",
        icon: Star,
        color: "#D97706",
        lightBg: "#FFFBEB",
        onPress: () => navigate(routes.myActivity.path),
      },
      {
        id: "5",
        label: "Favorites",
        icon: Heart,
        color: "#E11D48",
        lightBg: "#FFF1F2",
        onPress: () => navigate(routes.myActivity.path),
      },
    ],
    [navigate],
  );

  // ── Fetch ──
  useEffect(() => {
    (async () => {
      try {
        const [verseRes, statsRes, plansRes, journalRes] = await Promise.all([
          sendPostRequest("bible", "get-todays-verse", {}),
          sendPostRequest("bible", "get-home-stats", {}),
          sendPostRequest("reading-plans", "get-user-plans", {}),
          sendPostRequest("journal", "stats", {}),
        ]);
        if (verseRes.returnCode === 200 && verseRes.returnData) {
          const v = verseRes.returnData;
          setDailyVerse({
            verseNumber: v.verseNumber,
            chapter: v.chapter,
            bookName: v.bookName,
            reflection: v.reflection,
          });
        }
        if (statsRes.returnCode === 200 && statsRes.returnData) {
          const d = statsRes.returnData;
          setStats({
            chaptersRead: d.chaptersRead ?? 0,
            highlights: d.highlightCount ?? 0,
            notes: d.noteCount ?? 0,
            favorites: d.favorites ?? 0,
            journalEntries: journalRes.returnData?.totalEntries ?? 0,
          });
          setRecentActivity(d.recentActivity ?? []);
        }
        if (plansRes.returnCode === 200 && plansRes.returnData)
          setReadingPlans(plansRes.returnData.slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-indigo-600" />
        </div>
        <p className="text-sm text-slate-400 font-medium tracking-wide">
          Loading your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      {/* ══════════════════ HERO ══════════════════ */}
      <div className="bg-white border-b border-slate-100">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center ring-4 ring-indigo-50"
                  style={{
                    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  }}
                >
                  <span className="text-sm font-bold text-white leading-none">
                    {initials}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                  {getGreeting()}
                </p>
                <h1 className="text-lg font-bold text-slate-800 leading-tight truncate max-w-[180px] sm:max-w-xs">
                  {displayName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs text-indigo-600 font-semibold">
                  {stats.chaptersRead} chapters
                </span>
              </div>
              <button
                onClick={() => navigate(routes.settings.path)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
              >
                <Settings className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Daily verse card */}
          {dailyVerse && (
            <button
              onClick={() => navigate(routes.userDailyVerse.path)}
              className="group w-full flex items-start gap-4 p-5 rounded-2xl text-left transition-all active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              }}
            >
              {/* Quote mark */}
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Quote className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/50 mb-1.5">
                  Verse of the day
                </p>
                <p
                  className="text-sm text-white/90 italic leading-relaxed line-clamp-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  "
                  {getVerseText(
                    dailyVerse.bookName,
                    dailyVerse.chapter,
                    dailyVerse.verseNumber,
                  )}
                  "
                </p>
                <p className="text-[10px] text-white/40 mt-2 font-semibold tracking-wide">
                  — {dailyVerse.bookName} {dailyVerse.chapter}:
                  {dailyVerse.verseNumber}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════ BODY ══════════════════ */}
      <div className="mx-auto px-8 sm:px-6 lg:px-8 py-7 space-y-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl bg-white border border-slate-100 p-4 flex flex-col gap-3 hover:shadow-sm hover:border-slate-200 transition-all"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: s.lightBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: s.accent }} />
                </div>
                <div>
                  <p
                    className="text-2xl font-bold leading-none"
                    style={{ color: s.textColor }}
                  >
                    {s.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-8">
          {/* LEFT */}
          <div className="space-y-8">
            {/* Explore */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                  Explore
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onPress}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-150",
                        "active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-md",
                        item.bg,
                      )}
                    >
                      {/* Subtle inner highlight */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                      {item.badge && (
                        <span
                          className={cn(
                            "absolute top-2.5 right-2.5 text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full",
                            item.badgeCls,
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
                          item.iconBg,
                        )}
                      >
                        <Icon
                          className="w-5 h-5 text-white"
                          strokeWidth={1.8}
                        />
                      </div>

                      <p className="font-bold text-sm text-white leading-tight">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-white/60 mt-0.5 hidden sm:block">
                        {item.sub}
                      </p>

                      <ChevronRight className="absolute bottom-3 right-3 w-3.5 h-3.5 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Reading Plans */}
            {readingPlans.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                    Reading Plans
                  </h2>
                  <button
                    onClick={() => navigate(routes.userPlans.path)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    See all
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-3">
                  {readingPlans.map((plan) => {
                    const pct = Math.min(
                      100,
                      Math.round((plan.completedDays / plan.totalDays) * 100),
                    );
                    const done = pct >= 70;
                    return (
                      <div
                        key={plan.id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 hover:border-slate-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-800 line-clamp-1">
                              {plan.planName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                              {plan.description}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-xs font-bold px-2.5 py-1 rounded-full",
                              done
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-indigo-50 text-indigo-700",
                            )}
                          >
                            {pct}%
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: done
                                  ? "linear-gradient(90deg, #10B981, #34D399)"
                                  : "linear-gradient(90deg, #4F46E5, #7C3AED)",
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                              {plan.completedDays} of {plan.totalDays} days
                            </p>
                            <p className="text-xs text-slate-400">
                              {plan.totalDays - plan.completedDays} left
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* Quick Access */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                  Quick Access
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      onClick={link.onPress}
                      className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all active:scale-[0.97]"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: link.lightBg }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: link.color }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {link.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                    Recent Activity
                  </h2>
                  <button
                    onClick={() => navigate(routes.myActivity.path)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    All history
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden divide-y divide-slate-50">
                  {recentActivity.slice(0, 5).map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        navigate(
                          `${routes.bibleReader.path}?book=${encodeURIComponent(act.bookName)}&chapter=${act.chapter}`,
                        )
                      }
                      className="group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-700 truncate">
                          {act.bookName} {act.chapter}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatTime(act.updatedOn)}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Motivation nudge */}
            <section>
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #F0F4FF 0%, #FAF5FF 100%)",
                }}
              >
                {/* Decorative circle */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-indigo-100/60 pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-violet-100/40 pointer-events-none" />

                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">
                        Keep it up!
                      </p>
                      <p className="text-xs text-slate-500">
                        {stats.chaptersRead} chapters total
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    You're doing great. Read a chapter today to continue your
                    journey in Scripture.
                  </p>
                  <button
                    onClick={() => navigate(routes.bibleReader.path)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                    }}
                  >
                    Continue Reading
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}

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
  BarChart2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DailyVerse {
  id: string;
  verseReference: string;
  verseText: string;
  createdAt: string;
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
}

interface RecentActivity {
  bookName: string;
  chapter: number;
  updatedOn: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-3",
        className,
      )}
    >
      {children}
    </p>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
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
        icon: CalendarDays,
        bg: "bg-blue-600",
        iconCls: "text-blue-50",
        glow: "shadow-blue-500/20",
        onPress: () => navigate(routes.bibleReader.path),
      },
      {
        id: "2",
        label: "Daily Verse",
        sub: "Today's word",
        icon: Sun,
        bg: "bg-amber-500",
        iconCls: "text-amber-50",
        glow: "shadow-amber-500/20",
        onPress: () => navigate(routes.userDailyVerse.path),
      },
      {
        id: "3",
        label: "Reading Plans",
        sub: "Guided journeys",
        icon: Globe,
        bg: "bg-teal-600",
        iconCls: "text-teal-50",
        glow: "shadow-teal-500/20",
        onPress: () => navigate(routes.userPlans.path),
      },
      {
        id: "4",
        label: "Prayer Wall",
        sub: "Lift your voice",
        icon: HandHeart,
        bg: "bg-emerald-600",
        iconCls: "text-emerald-50",
        glow: "shadow-emerald-500/20",
        onPress: () => {},
      },
      {
        id: "5",
        label: "Testify",
        sub: "Share your story",
        icon: Mic2,
        bg: "bg-rose-500",
        iconCls: "text-rose-50",
        glow: "shadow-rose-500/20",
        onPress: () => {},
      },
      {
        id: "6",
        label: "Bible Trivia",
        sub: "Test knowledge",
        icon: Brain,
        bg: "bg-violet-600",
        iconCls: "text-violet-50",
        glow: "shadow-violet-500/20",
        onPress: () => {},
      },
    ],
    [navigate],
  );

  const quickLinks = useMemo(
    () => [
      {
        id: "1",
        label: "Notes",
        icon: BookMarked,
        iconCls: "text-violet-500",
        bg: "bg-violet-50 dark:bg-violet-950/40",
      },
      {
        id: "2",
        label: "History",
        icon: History,
        iconCls: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
      },
      {
        id: "3",
        label: "Highlights",
        icon: Star,
        iconCls: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-950/40",
      },
      {
        id: "4",
        label: "Favorites",
        icon: Heart,
        iconCls: "text-rose-500",
        bg: "bg-rose-50 dark:bg-rose-950/40",
      },
    ],
    [],
  );

  const statCards = useMemo(
    () => [
      {
        label: "Chapters",
        value: stats.chaptersRead,
        icon: BookOpen,
        iconCls: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/40",
        border: "border-blue-100 dark:border-blue-900/50",
      },
      {
        label: "Highlights",
        value: stats.highlights,
        icon: Star,
        iconCls: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-100 dark:border-amber-900/50",
      },
      {
        label: "Notes",
        value: stats.notes,
        icon: BookMarked,
        iconCls: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-100 dark:border-emerald-900/50",
      },
      {
        label: "Favorites",
        value: stats.favorites,
        icon: Heart,
        iconCls: "text-rose-500",
        bg: "bg-rose-50 dark:bg-rose-950/40",
        border: "border-rose-100 dark:border-rose-900/50",
      },
    ],
    [stats],
  );

  // ── Fetch ──
  useEffect(() => {
    (async () => {
      try {
        const [verseRes, statsRes, plansRes] = await Promise.all([
          sendPostRequest("bible", "get-todays-verse", {}),
          sendPostRequest("bible", "get-home-stats", {}),
          sendPostRequest("reading-plans", "get-user-plans", {}),
        ]);
        if (verseRes.returnCode === 200 && verseRes.returnData)
          setDailyVerse(verseRes.returnData);
        if (statsRes.returnCode === 200 && statsRes.returnData) {
          const d = statsRes.returnData;
          setStats({
            chaptersRead: d.chaptersRead ?? 0,
            highlights: d.highlights ?? 0,
            notes: d.notes ?? 0,
            favorites: d.favorites ?? 0,
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-primary" />
          <Loader2 className="w-5 h-5 animate-spin text-primary absolute -bottom-1.5 -right-1.5 bg-background rounded-full p-0.5" />
        </div>
        <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <div className="relative bg-slate-950 overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Colour blobs */}
        <div className="absolute -top-24 -right-12 w-80 h-80 rounded-full bg-primary/30 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-4 w-48 h-48 rounded-full bg-amber-500/20 blur-[60px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-8">
          {/* Top row */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-primary flex items-center justify-center shrink-0 ring-4 ring-primary/25 shadow-xl shadow-primary/30">
                <span className="text-lg font-bold text-white leading-none">
                  {initials}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-white/40 font-medium tracking-wide">
                  {getGreeting()}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {displayName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-white/60 font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                {stats.chaptersRead} read
              </div>
            </div>
          </div>

          {/* Verse strip */}
          {dailyVerse && (
            <button
              onClick={() => navigate(routes.userDailyVerse.path)}
              className="w-full flex items-start gap-3 p-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.11] border border-white/10 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-widest uppercase text-amber-400/70 mb-1">
                  Verse of the day
                </p>
                <p className="text-sm text-white/75 italic font-serif line-clamp-2 leading-relaxed">
                  "{dailyVerse.verseText}"
                </p>
                <p className="text-[11px] text-white/35 mt-1.5 font-medium">
                  — {dailyVerse.verseReference}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/25 shrink-0 mt-1" />
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════
          BODY
      ══════════════════════════════ */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={cn(
                  "rounded-2xl border p-4 flex flex-col gap-3",
                  s.bg,
                  s.border,
                )}
              >
                <div className="w-8 h-8 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center">
                  <Icon className={cn("w-4 h-4", s.iconCls)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {s.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {s.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two-column layout on LG */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* ── LEFT ── */}
          <div className="space-y-6">
            {/* Explore */}
            <section>
              <SectionLabel>Explore</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onPress}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-md active:scale-[0.98] transition-all duration-150 text-left"
                    >
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                          item.bg,
                          item.glow,
                        )}
                      >
                        <Icon
                          className={cn("w-5 h-5", item.iconCls)}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground leading-snug">
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.sub}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Reading Plans */}
            {readingPlans.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel className="mb-0">Reading Plans</SectionLabel>
                  <button
                    onClick={() => navigate(routes.userPlans.path)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
                  >
                    See all <ChevronRight className="w-3 h-3" />
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
                        className="rounded-2xl border border-border/50 bg-card p-4 sm:p-5 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-4.5 h-4.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground line-clamp-1">
                              {plan.planName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                              {plan.description}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-xs font-bold px-2.5 py-1 rounded-full",
                              done
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: done
                                  ? "#10B981"
                                  : "hsl(var(--primary))",
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {plan.completedDays} of {plan.totalDays} days
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-6">
            {/* Quick Access */}
            <section>
              <SectionLabel>Quick Access</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      onClick={() => {}}
                      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border/50 bg-card hover:bg-accent/40 hover:border-border active:scale-[0.97] transition-all"
                    >
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center",
                          link.bg,
                        )}
                      >
                        <Icon className={cn("w-5 h-5", link.iconCls)} />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
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
                <SectionLabel>Recent Activity</SectionLabel>
                <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                  {recentActivity.slice(0, 6).map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        navigate(
                          `${routes.bibleReader.path}?book=${encodeURIComponent(act.bookName)}&chapter=${act.chapter}`,
                        )
                      }
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-accent/40 active:bg-accent/60 transition-colors border-b border-border/30 last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {act.bookName} {act.chapter}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(act.updatedOn)}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Stats bar chart — desktop-only */}
            <section className="hidden lg:block">
              <SectionLabel>Stats Overview</SectionLabel>
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <div className="space-y-3.5">
                  {statCards.map((s) => {
                    const Icon = s.icon;
                    const maxVal = Math.max(
                      ...statCards.map((x) => x.value),
                      1,
                    );
                    const pct = Math.round((s.value / maxVal) * 100);
                    return (
                      <div key={s.label} className="flex items-center gap-3">
                        <Icon
                          className={cn("w-3.5 h-3.5 shrink-0", s.iconCls)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs text-muted-foreground">
                              {s.label}
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {s.value}
                            </span>
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: "hsl(var(--primary))",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

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
  BookText,
  Lightbulb,
  Trophy,
  Microscope,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { getCurrentSession } from "@/services/exegesisApi";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { getVerseText } from "@/utilities/bibleUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
const getGreeting = (t: any) => {
  const h = new Date().getHours();
  if (h < 5) return t?.userDashboard?.goodNight || 'Good Night';
  if (h < 12) return t?.userDashboard?.goodMorning || 'Good Morning';
  if (h < 17) return t?.userDashboard?.goodAfternoon || 'Good Afternoon';
  return t?.userDashboard?.goodEvening || 'Good Evening';
};

const formatTime = (ds: string, t: any): string => {
  const diff = Date.now() - new Date(ds).getTime();
  const m = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return t?.userDashboard?.justNow || 'Just now';
  if (m < 60) return (t?.userDashboard?.minutesAgo || '{m}m ago').replace('{m}', String(m));
  if (hr < 24) return (t?.userDashboard?.hoursAgo || '{h}h ago').replace('{h}', String(hr));
  if (d < 7) return (t?.userDashboard?.daysAgo || '{d}d ago').replace('{d}', String(d));
  return new Date(ds).toLocaleDateString();
};

const getInitials = (first?: string, last?: string, username?: string) => {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first[0].toUpperCase();
  if (username) return username[0].toUpperCase();
  return "U";
};

/* ── Reusable Card Wrapper ─────────────────────────────────────────────── */

function DashboardCard({
  children,
  className,
  onClick,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border bg-card p-4 sm:p-5 transition-all duration-200",
        hover && onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]",
        hover && !onClick && "hover:shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Section Header ────────────────────────────────────────────────────── */

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground/70">
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {action.label}
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════════════════════ */

export default function UserDashboard() {
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
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
  const [lastRead, setLastRead] = useState<RecentActivity | null>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [latestEntry, setLatestEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const displayName =
    userInfo?.firstName || userInfo?.lastName || userInfo?.username || (t?.userDashboard?.friend || 'Friend');
  const initials = getInitials(
    userInfo?.firstName,
    userInfo?.lastName,
    userInfo?.username,
  );

  // ── Daily content state ──
  const [dailyExegesis, setDailyExegesis] = useState<any>(null);
  const [dailyDevotion, setDailyDevotion] = useState<any>(null);
  const [dailyTrivia, setDailyTrivia] = useState<any>(null);

  // ── Data ──
  const exploreItems = useMemo(
    () => [
      {
        id: "1",
        label: t?.userDashboard?.exegesisBible || 'Bible Reader',
        sub: t?.userDashboard?.readStudy || 'Read & study',
        icon: BookOpen,
        gradient: "from-blue-600 to-blue-500",
        onPress: () => navigate(routes.bibleReader.path),
      },
      {
        id: "2",
        label: t?.userDashboard?.dailyVerse || 'Daily Verse',
        sub: t?.userDashboard?.todaysWord || "Today's word",
        icon: Sun,
        gradient: "from-amber-500 to-orange-500",
        onPress: () => navigate(routes.userDailyVerse.path),
      },
      {
        id: "3",
        label: t?.userDashboard?.readingPlans || 'Reading Plans',
        sub: t?.userDashboard?.guidedJourneys || 'Guided journeys',
        icon: CalendarDays,
        gradient: "from-emerald-500 to-teal-500",
        onPress: () => navigate(routes.userPlans.path),
      },
      {
        id: "4",
        label: 'Word Study',
        sub: 'Dictionary & tools',
        icon: Microscope,
        gradient: "from-violet-500 to-purple-500",
        onPress: () => navigate(routes.dictionary.path),
      },
      {
        id: "5",
        label: 'Bible Trivia',
        sub: 'Test knowledge',
        icon: Trophy,
        gradient: "from-rose-500 to-pink-500",
        onPress: () => navigate(routes.trivia.path),
      },
      {
        id: "6",
        label: t?.userDashboard?.myJournal || 'My Journal',
        sub: t?.userDashboard?.reflectWrite || 'Reflect & write',
        icon: PenLine,
        gradient: "from-green-500 to-emerald-500",
        onPress: () => navigate(routes.journal.path),
      },
    ],
    [navigate, t],
  );

  const statCards = useMemo(
    () => [
      {
        label: t?.userDashboard?.chaptersRead || 'Chapters Read',
        value: stats.chaptersRead,
        icon: BookOpen,
        accent: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950/40",
        border: "border-blue-100 dark:border-blue-900/50",
      },
      {
        label: t?.userDashboard?.highlights || 'Highlights',
        value: stats.highlights,
        icon: Star,
        accent: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-100 dark:border-amber-900/50",
      },
      {
        label: t?.userDashboard?.notes || 'Notes',
        value: stats.notes,
        icon: BookMarked,
        accent: "text-violet-600",
        bg: "bg-violet-50 dark:bg-violet-950/40",
        border: "border-violet-100 dark:border-violet-900/50",
      },
      {
        label: t?.userDashboard?.journalEntries || 'Journal Entries',
        value: stats.journalEntries,
        icon: PenLine,
        accent: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-100 dark:border-emerald-900/50",
      },
      {
        label: t?.userDashboard?.favorites || 'Favorites',
        value: stats.favorites,
        icon: Heart,
        accent: "text-rose-600",
        bg: "bg-rose-50 dark:bg-rose-950/40",
        border: "border-rose-100 dark:border-rose-900/50",
      },
    ],
    [stats, t],
  );

  // ── Fetch ──
  useEffect(() => {
    (async () => {
      try {
        const [verseRes, statsRes, plansRes, journalRes, readHistoryRes, journalListRes] = await Promise.all([
          sendPostRequest("bible", "get-todays-verse", {}),
          sendPostRequest("bible", "get-home-stats", {}),
          sendPostRequest("reading-plans", "get-user-plans", {}),
          sendPostRequest("journal", "stats", {}),
          sendPostRequest("bible", "get-read-history", { page: 0, pageSize: 1 }),
          sendPostRequest("journal", "get-all", { page: 0, pageSize: 1 }),
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
        if (readHistoryRes.returnCode === 200 && readHistoryRes.returnData?.readHistories?.length > 0) {
          const hist = readHistoryRes.returnData.readHistories[0];
          setLastRead({ bookName: hist.bookName, chapter: hist.chapter, updatedOn: hist.updatedOn || hist.createdOn });
        }
        if (journalListRes.returnCode === 200 && journalListRes.returnData?.entries?.length > 0) {
          setLatestEntry(journalListRes.returnData.entries[0]);
        }
      } catch (e) {
        console.error(e);
      }

      // Core data loaded — show the page immediately
      setLoading(false);

      // Fetch remaining sections in parallel (don't block the page render)
      await Promise.all([
        (async () => {
          try {
            const session = await getCurrentSession();
            if (session && !session.completed) setCurrentSession(session);
          } catch {}
        })(),
        (async () => {
          try {
            const exegesisRes = await sendPostRequest("bible", "get-todays-exegesis", {});
            if (exegesisRes.returnCode === 200 && exegesisRes.returnData) setDailyExegesis(exegesisRes.returnData);
          } catch {}
        })(),
        (async () => {
          try {
            const devotionRes = await sendPostRequest("bible", "get-todays-devotion", {});
            if (devotionRes.returnCode === 200 && devotionRes.returnData) setDailyDevotion(devotionRes.returnData);
          } catch {}
        })(),
        (async () => {
          try {
            const triviaRes = await sendPostRequest("trivia", "get-todays-trivia", {});
            if (triviaRes.returnCode === 200 && triviaRes.returnData) setDailyTrivia(triviaRes.returnData);
          } catch {}
        })(),
      ]);
    })();
  }, []);

  return (
    <div className="min-h-full bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ══════════════════ HERO ══════════════════ */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-in fade-in duration-700">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              {/* Avatar with ring */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center ring-4 ring-primary/10 shadow-sm">
                  <span className="text-sm font-bold text-primary-foreground leading-none">
                    {initials}
                  </span>
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background",
                  isRtl ? "-left-0.5" : "-right-0.5",
                )} />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60">
                  {getGreeting(t)}
                </p>
                <h1 className="text-lg font-bold text-foreground leading-tight truncate max-w-[180px] sm:max-w-xs">
                  {displayName}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                <TrendingUp className="w-3.5 h-3.5 text-primary/70" />
                <span className="text-xs text-primary font-semibold">
                  {stats.chaptersRead} {t?.userDashboard?.chapters || 'chapters'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => navigate(routes.settings.path)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Daily verse card */}
          {dailyVerse && (
            <button
              onClick={() => navigate(routes.userDailyVerse.path)}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-5 sm:p-6 text-start transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.99]"
            >
              {/* Decorative */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5 blur-lg pointer-events-none" />

              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-sm">
                  <Quote className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/50 mb-1.5">
                    {t?.userDashboard?.verseOfTheDay || 'Verse of the day'}
                  </p>
                  <p
                    className="text-sm sm:text-base text-white/90 italic leading-relaxed line-clamp-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    &ldquo;
                    {getVerseText(
                      dailyVerse.bookName,
                      dailyVerse.chapter,
                      dailyVerse.verseNumber,
                    )}
                    &rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-semibold tracking-wide text-white/60">
                      &mdash; {dailyVerse.bookName} {dailyVerse.chapter}:{dailyVerse.verseNumber}
                    </span>
                    {dailyVerse.reflection && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                        Reflection available
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-white/40 group-hover:text-white/70 transition-colors mt-2">
                  <span className="text-[10px] font-semibold hidden sm:inline">Read</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════ BODY ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
          {statCards.map((s, idx) => {
            const Icon = s.icon;
            return (
              <DashboardCard key={`stat-${s.label}-${idx}`} className="flex flex-col gap-3" hover={false}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", s.bg, s.border)}>
                  <Icon className={cn("w-4 h-4", s.accent)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none tabular-nums">
                    {s.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {s.label}
                  </p>
                </div>
              </DashboardCard>
            );
          })}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* ============ LEFT COLUMN ============ */}
          <div className="space-y-8">
            {/* Explore */}
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '50ms' }}>
              <SectionHeader title={t?.userDashboard?.explore || 'Explore'} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onPress}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-start transition-all duration-200",
                        "hover:shadow-lg active:scale-[0.97] hover:-translate-y-0.5",
                        `bg-gradient-to-br ${item.gradient}`,
                      )}
                    >
                      {/* Inner glow */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 ring-1 ring-white/10">
                          <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                        </div>
                        <p className="font-bold text-sm text-white leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-white/60 mt-0.5 hidden sm:block">
                          {item.sub}
                        </p>
                      </div>

                      <ChevronRight className="absolute bottom-3 end-3 w-3.5 h-3.5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Exegesis Lab Resume */}
            {currentSession && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
                <SectionHeader
                  title={t?.userDashboard?.resumeStudy || 'Resume Study'}
                  action={{
                    label: t?.userDashboard?.open || 'Open',
                    onClick: () => navigate(`${routes.labFlow.path}?sessionId=${currentSession.id}`),
                  }}
                />
                <DashboardCard
                  onClick={() => navigate(`${routes.labFlow.path}?sessionId=${currentSession.id}`)}
                  className="border-violet-200/50 dark:border-violet-800/30 hover:border-violet-300 dark:hover:border-violet-700/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {currentSession.passageRef || `${currentSession.bookName} ${currentSession.chapter}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Study Session &middot; Stage {currentSession.currentStage
                          ? currentSession.currentStage.charAt(0).toUpperCase() + currentSession.currentStage.slice(1)
                          : (t?.userDashboard?.inProgress || 'In progress')}
                      </p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1.5 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                          {t?.userDashboard?.active || 'Active'}
                        </Badge>
                        {currentSession.listenCompleted && (
                          <span className="text-[10px] text-muted-foreground">
                            {t?.userDashboard?.stageCompleted || 'Listen completed'}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1" />
                  </div>
                </DashboardCard>
              </section>
            )}

            {/* Reading Plans */}
            {readingPlans.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '150ms' }}>
                <SectionHeader
                  title={t?.userDashboard?.readingPlans || 'Reading Plans'}
                  action={{
                    label: t?.userDashboard?.seeAll || 'See all',
                    onClick: () => navigate(routes.userPlans.path),
                  }}
                />
                <div className="space-y-3">
                  {readingPlans.map((plan, idx) => {
                    const pct = Math.min(100, Math.round((plan.completedDays / plan.totalDays) * 100));
                    const done = pct >= 70;
                    return (
                      <DashboardCard key={plan.id || `plan-${plan.planName}-${idx}`} className="hover:border-border">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-5 h-5 text-primary/80" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground line-clamp-1">
                              {plan.planName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {plan.description}
                            </p>
                          </div>
                          <Badge
                            variant={done ? "default" : "secondary"}
                            className={cn(
                              "shrink-0 text-xs font-bold px-2.5",
                              done && "bg-emerald-500 hover:bg-emerald-600",
                            )}
                          >
                            {pct}%
                          </Badge>
                        </div>

                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${pct}%`,
                                background: done
                                  ? "linear-gradient(90deg, #10B981, #34D399)"
                                  : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary))/0.7)",
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {(t?.userDashboard?.daysOf || '{completed} of {total} days')
                                .replace('{completed}', String(plan.completedDays))
                                .replace('{total}', String(plan.totalDays))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(t?.userDashboard?.left || '{remaining} left')
                                .replace('{remaining}', String(plan.totalDays - plan.completedDays))}
                            </p>
                          </div>
                        </div>
                      </DashboardCard>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Challenge Yourself — under Reading Plans */}
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
              <div
                className="relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99]"
                onClick={() => navigate(routes.trivia.path)}
                style={{
                  background: "linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)",
                }}
              >
                <div className={cn(
                  "absolute -top-6 w-24 h-24 rounded-full bg-rose-200/50 pointer-events-none",
                  isRtl ? "-left-6" : "-right-6",
                )} />
                <div className={cn(
                  "absolute -bottom-4 w-16 h-16 rounded-full bg-rose-200/30 pointer-events-none",
                  isRtl ? "-right-4" : "-left-4",
                )} />

                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-rose-800">Challenge Yourself</p>
                      <p className="text-[10px] text-rose-500">Bible Trivia Quiz</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-300 shrink-0 ml-auto" />
                  </div>
                  <p className="text-xs text-rose-600/70 leading-relaxed mb-3">
                    Test your knowledge of the Scriptures with fun trivia questions across all difficulty levels!
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(routes.trivia.path); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #E11D48, #BE123C)" }}
                  >
                    Play Trivia
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* ============ RIGHT COLUMN ============ */}
          <div className="space-y-6">
            {/* Continue Reading */}
            {lastRead && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '50ms' }}>
                <SectionHeader
                  title={t?.userDashboard?.continueReading || 'Continue Reading'}
                  action={{
                    label: t?.userDashboard?.readNow || 'Read now',
                    onClick: () => navigate(
                      `${routes.bibleReader.path}?book=${encodeURIComponent(lastRead.bookName)}&chapter=${lastRead.chapter}`
                    ),
                  }}
                />
                <DashboardCard
                  onClick={() => navigate(
                    `${routes.bibleReader.path}?book=${encodeURIComponent(lastRead.bookName)}&chapter=${lastRead.chapter}`
                  )}
                  className="border-primary/10 hover:border-primary/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {lastRead.bookName} {lastRead.chapter}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t?.userDashboard?.lastRead || 'Last read'} &middot; {lastRead.updatedOn ? formatTime(lastRead.updatedOn, t) : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  </div>
                </DashboardCard>
              </section>
            )}

            {/* Quick Access */}
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
              <SectionHeader title={t?.userDashboard?.quickAccess || 'Quick Access'} />
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: t?.userDashboard?.myNotes || 'My Notes',
                    icon: BookMarked,
                    color: "text-violet-600",
                    bg: "bg-violet-50 dark:bg-violet-950/40",
                    border: "border-violet-100 dark:border-violet-900/50",
                    onClick: () => navigate(routes.myActivity.path),
                  },
                  {
                    label: t?.userDashboard?.journal || 'Journal',
                    icon: PenLine,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50 dark:bg-emerald-950/40",
                    border: "border-emerald-100 dark:border-emerald-900/50",
                    onClick: () => navigate(routes.journal.path),
                  },
                  {
                    label: t?.userDashboard?.history || 'History',
                    icon: History,
                    color: "text-blue-600",
                    bg: "bg-blue-50 dark:bg-blue-950/40",
                    border: "border-blue-100 dark:border-blue-900/50",
                    onClick: () => navigate(routes.myActivity.path),
                  },
                  {
                    label: t?.userDashboard?.highlights || 'Highlights',
                    icon: Star,
                    color: "text-amber-600",
                    bg: "bg-amber-50 dark:bg-amber-950/40",
                    border: "border-amber-100 dark:border-amber-900/50",
                    onClick: () => navigate(routes.myActivity.path),
                  },
                  {
                    label: t?.userDashboard?.favorites || 'Favorites',
                    icon: Heart,
                    color: "text-rose-600",
                    bg: "bg-rose-50 dark:bg-rose-950/40",
                    border: "border-rose-100 dark:border-rose-900/50",
                    onClick: () => navigate(routes.myActivity.path),
                  },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.label}
                      onClick={link.onClick}
                      className={cn(
                        "flex flex-col items-center gap-2.5 p-3.5 rounded-xl border bg-card transition-all duration-200",
                        "hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.97]",
                        link.border,
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border", link.bg, link.border)}>
                        <Icon className={cn("w-4 h-4", link.color)} />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground/80">
                        {link.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '150ms' }}>
                <SectionHeader
                  title={t?.userDashboard?.recentActivity || 'Recent Activity'}
                  action={{
                    label: t?.userDashboard?.allHistory || 'All history',
                    onClick: () => navigate(routes.myActivity.path),
                  }}
                />
                <div className="rounded-2xl border bg-card overflow-hidden divide-y divide-border/40">
                  {recentActivity.slice(0, 5).map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(
                        `${routes.bibleReader.path}?book=${encodeURIComponent(act.bookName)}&chapter=${act.chapter}`
                      )}
                      className="group w-full flex items-center gap-3 px-4 py-3.5 text-start hover:bg-muted/30 active:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-primary/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {act.bookName} {act.chapter}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatTime(act.updatedOn, t)}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Lordsbook Daily Exegesis */}
            {dailyExegesis && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
                <SectionHeader
                  title="Daily Exegesis"
                  action={{
                    label: "Open study",
                    onClick: () => navigate(routes.dailyExegesis.path),
                  }}
                />
                <DashboardCard
                  onClick={() => navigate(routes.dailyExegesis.path)}
                  className="border-indigo-200/50 dark:border-indigo-800/30 hover:border-indigo-300 dark:hover:border-indigo-700/50"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                      <BookText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">
                        {dailyExegesis.title || 'Daily Exegesis'}
                      </p>
                      {dailyExegesis.passageRef && (
                        <p className="text-xs text-indigo-500 font-medium mt-0.5">
                          {dailyExegesis.passageRef}
                        </p>
                      )}
                    </div>
                  </div>
                  {dailyExegesis.introduction && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic border-l-2 border-indigo-200 dark:border-indigo-800 pl-3">
                      &ldquo;{dailyExegesis.introduction}&rdquo;
                    </p>
                  )}
                </DashboardCard>
              </section>
            )}

            {/* Daily Devotional + Keep it up! + Bible Trivia */}
            

            {/* Journal Preview */}
            {latestEntry && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: '300ms' }}>
                <SectionHeader
                  title={t?.userDashboard?.latestEntry || 'Latest Journal'}
                  action={{
                    label: t?.userDashboard?.open || 'Open',
                    onClick: () => navigate(`/journal/view/${latestEntry.id}`),
                  }}
                />
                <DashboardCard
                  onClick={() => navigate(`/journal/view/${latestEntry.id}`)}
                  className="border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700/50"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shrink-0 shadow-sm">
                      <PenLine className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">
                        {latestEntry.passageRef || latestEntry.title || (t?.userDashboard?.journalEntry || 'Journal entry')}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {latestEntry.createdOn
                          ? (() => {
                              const diff = Date.now() - new Date(latestEntry.createdOn).getTime();
                              const d = Math.floor(diff / 86400000);
                              if (d < 1) return t?.userDashboard?.today || 'Today';
                              if (d === 1) return t?.userDashboard?.yesterday || 'Yesterday';
                              return new Date(latestEntry.createdOn).toLocaleDateString();
                            })()
                          : ''}
                      </p>
                    </div>
                  </div>

                  {/* Preview text */}
                  {(latestEntry.reflection || latestEntry.lookNotes) && (
                    <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/50 p-3">
                      <p className="text-xs text-foreground/70 italic leading-relaxed line-clamp-2">
                        &ldquo;{latestEntry.reflection || latestEntry.lookNotes}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {latestEntry.isPublic && (
                      <Badge variant="outline" className="text-[9px] font-semibold tracking-wider uppercase text-emerald-500 border-emerald-200 dark:border-emerald-800">
                        {t?.userDashboard?.public || 'Public'}
                      </Badge>
                    )}
                    {latestEntry.bookName && (
                      <span className="text-[10px] text-muted-foreground">
                        {latestEntry.bookName} {latestEntry.chapter || ''}
                      </span>
                    )}
                  </div>
                </DashboardCard>
              </section>
            )}

          </div>
        </div>

        
        
        <div className="h-6" />
      </div>
    </div>
  );
}

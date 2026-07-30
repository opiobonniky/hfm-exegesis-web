import { useState, useLayoutEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Clock,
  ChevronRight,
  CalendarDays,
  BookMarked,
  Heart,
  Star,
  BookOpen,
  Sparkles,
  Settings,
  Quote,
  PenLine,
  BookText,
  Lightbulb,
  Trophy,
  Microscope,
  History,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { getCurrentSession } from "@/services/exegesisApi";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { getVerseTextAsync } from "@/utilities/bibleUtils";

interface DailyVerse {
  bookName: string;
  chapter: number;
  verseNumber: number;
  reflection: string;
  title?: string;
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

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted-foreground/[0.08]",
        className,
      )}
      aria-hidden="true"
    />
  );
}

function DashboardSkeleton({ isRtl }: { isRtl: boolean }) {
  return (
    <div
      className="min-h-full bg-background pointer-events-none select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-primary/[0.04] to-transparent pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-36 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="hidden sm:block w-32 h-7" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>
          <Skeleton className="w-full h-[132px] rounded-2xl" />
        </div>
      </div>

      {/* Body skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Stats row skeleton */}
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="w-4 h-4" />
              <div className="flex items-baseline gap-1">
                <Skeleton className="w-8 h-5" />
                <Skeleton className="w-14 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Two-column skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-8">
            {/* Explore grid skeleton */}
            <div>
              <Skeleton className="w-16 h-[14px] mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[116px] rounded-2xl" />
                ))}
              </div>
            </div>
            {/* Reading plans skeleton */}
            <div>
              <Skeleton className="w-24 h-[14px] mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-[124px] rounded-2xl" />
                ))}
              </div>
            </div>
            {/* Challenge skeleton */}
            <Skeleton className="h-[172px] rounded-2xl" />
          </div>

          {/* Right column skeleton */}
          <div className="space-y-7">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="w-20 h-[14px] mb-3" />
                <Skeleton className="h-[68px] rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();

  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [verseTextLoading, setVerseTextLoading] = useState(false);
  const [verseTextError, setVerseTextError] = useState(false);
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
  const initials = getInitials(userInfo?.firstName, userInfo?.lastName, userInfo?.username);

  const [dailyExegesis, setDailyExegesis] = useState<any>(null);
  const [dailyDevotion, setDailyDevotion] = useState<any>(null);
  const [dailyTrivia, setDailyTrivia] = useState<any>(null);

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

  useLayoutEffect(() => {
    let cancelled = false;

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

        if (cancelled) return;

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
        if (plansRes.returnCode === 200 && plansRes.returnData)
          setReadingPlans(plansRes.returnData.slice(0, 3));
        if (readHistoryRes.returnCode === 200 && readHistoryRes.returnData?.readHistories?.length > 0) {
          const hist = readHistoryRes.returnData.readHistories[0];
          setLastRead({ bookName: hist.bookName, chapter: hist.chapter, updatedOn: hist.updatedOn || hist.createdOn });
        }
        if (journalListRes.returnCode === 200 && journalListRes.returnData?.entries?.length > 0) {
          setLatestEntry(journalListRes.returnData.entries[0]);
        }

        if (cancelled) return;
        setLoading(false);

        if (verseRes.returnCode === 200 && verseRes.returnData) {
          const v = verseRes.returnData;
          setDailyVerse({
            verseNumber: v.verseNumber,
            chapter: v.chapter,
            bookName: v.bookName,
            reflection: v.reflection,
          });
          setVerseTextLoading(true);
          setVerseTextError(false);
          getVerseTextAsync(v.bookName, v.chapter, v.verseNumber).then((text) => {
            if (cancelled) return;
            if (text !== null) {
              setVerseText(text);
            } else {
              setVerseTextError(true);
            }
          }).catch(() => {
            if (!cancelled) setVerseTextError(true);
          }).finally(() => {
            if (!cancelled) setVerseTextLoading(false);
          });
        }

        await Promise.all([
          (async () => {
            try {
              const session = await getCurrentSession();
              if (!cancelled && session && !session.completed) setCurrentSession(session);
            } catch {}
          })(),
          (async () => {
            try {
              const exegesisRes = await sendPostRequest("bible", "get-todays-exegesis", {});
              if (!cancelled && exegesisRes.returnCode === 200 && exegesisRes.returnData) setDailyExegesis(exegesisRes.returnData);
            } catch {}
          })(),
          (async () => {
            try {
              const devotionRes = await sendPostRequest("bible", "get-todays-devotion", {});
              if (!cancelled && devotionRes.returnCode === 200 && devotionRes.returnData) setDailyDevotion(devotionRes.returnData);
            } catch {}
          })(),
          (async () => {
            try {
              const triviaRes = await sendPostRequest("trivia", "get-todays-trivia", {});
              if (!cancelled && triviaRes.returnCode === 200 && triviaRes.returnData) setDailyTrivia(triviaRes.returnData);
            } catch {}
          })(),
        ]);
      } catch (e) {
        console.error(e);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <DashboardSkeleton isRtl={isRtl} />;
  }

  return (
    <div className="min-h-full bg-background animate-in fade-in duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Hero ── */}
      <div className="bg-gradient-to-b from-primary/[0.04] to-transparent pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{initials}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/60 font-medium">{getGreeting(t)}</p>
                <h1 className="text-lg font-bold text-foreground leading-tight">{displayName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground/60">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="font-medium">{stats.chaptersRead} {t?.userDashboard?.chapters || 'chapters'}</span>
              </div>
              <button
                onClick={() => navigate(routes.settings.path)}
                className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground/60" />
              </button>
            </div>
          </div>

          {dailyVerse && (
            <button
              onClick={() => navigate(routes.userDailyVerse.path)}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-5 sm:p-6 text-start transition-all duration-200 hover:shadow-lg active:scale-[0.99] animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
            >
              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Quote className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold tracking-wider uppercase text-white/50 mb-1.5">
                    {t?.userDashboard?.verseOfTheDay || 'Verse of the day'}
                  </p>
                  <p
                    className="text-sm sm:text-base text-white/90 italic leading-relaxed line-clamp-2"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {verseTextLoading ? (
                      <span className="inline-flex items-center gap-1.5 text-white/50 text-xs">
                        <span className="inline-block w-3 h-3 rounded-full bg-white/30 animate-pulse" />
                        Loading verse…
                      </span>
                    ) : verseText ? (
                      <>&ldquo;{verseText}&rdquo;</>
                    ) : (
                      <span className="text-white/50 text-xs italic">
                        Open to read today&rsquo;s verse
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-medium text-white/60">
                      {dailyVerse.bookName} {dailyVerse.chapter}:{dailyVerse.verseNumber}
                    </span>
                    {dailyVerse.reflection && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        Reflection available
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Stats row */}
        <div className="flex flex-wrap gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
          {([
            { label: t?.userDashboard?.chaptersRead || 'Chapters', value: stats.chaptersRead, icon: BookOpen, color: "text-blue-500" },
            { label: t?.userDashboard?.highlights || 'Highlights', value: stats.highlights, icon: Star, color: "text-amber-500" },
            { label: t?.userDashboard?.notes || 'Notes', value: stats.notes, icon: BookMarked, color: "text-violet-500" },
            { label: t?.userDashboard?.journalEntries || 'Journal', value: stats.journalEntries, icon: PenLine, color: "text-emerald-500" },
            { label: t?.userDashboard?.favorites || 'Favorites', value: stats.favorites, icon: Heart, color: "text-rose-500" },
          ] as const).map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4", s.color)} />
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-foreground tabular-nums">{s.value.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground/60">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">

          {/* ── LEFT ── */}
          <div className="space-y-8">

            {/* Explore */}
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {t?.userDashboard?.explore || 'Explore'}
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
                        "group relative overflow-hidden rounded-2xl p-4 sm:p-5 text-start transition-all duration-200",
                        "hover:shadow-lg active:scale-[0.97] hover:-translate-y-0.5",
                        `bg-gradient-to-br ${item.gradient}`,
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                        </div>
                        <p className="font-bold text-sm text-white leading-tight">{item.label}</p>
                        <p className="text-[11px] text-white/60 mt-0.5 hidden sm:block">{item.sub}</p>
                      </div>
                      <ChevronRight className="absolute bottom-3 end-3 w-3.5 h-3.5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Study Session */}
            {currentSession && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    {t?.userDashboard?.resumeStudy || 'Resume Study'}
                  </h2>
                  <button
                    onClick={() => navigate(`${routes.labFlow.path}?sessionId=${currentSession.id}`)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t?.userDashboard?.open || 'Open'}
                  </button>
                </div>
                <button
                  onClick={() => navigate(`${routes.labFlow.path}?sessionId=${currentSession.id}`)}
                  className="w-full text-start group block"
                >
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {currentSession.passageRef || `${currentSession.bookName} ${currentSession.chapter}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Study Session &middot; {currentSession.currentStage
                          ? currentSession.currentStage.charAt(0).toUpperCase() + currentSession.currentStage.slice(1)
                          : (t?.userDashboard?.inProgress || 'In progress')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                          {t?.userDashboard?.active || 'Active'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </section>
            )}

            {/* Reading Plans */}
            {readingPlans.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    {t?.userDashboard?.readingPlans || 'Reading Plans'}
                  </h2>
                  <button
                    onClick={() => navigate(routes.userPlans.path)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t?.userDashboard?.seeAll || 'See all'}
                  </button>
                </div>
                <div className="space-y-3">
                  {readingPlans.map((plan, idx) => {
                    const pct = Math.min(100, Math.round((plan.completedDays / plan.totalDays) * 100));
                    return (
                      <div key={plan.id || `plan-${plan.planName}-${idx}`} className="p-4 rounded-2xl bg-muted/40">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-5 h-5 text-primary/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground line-clamp-1">{plan.planName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{plan.description}</p>
                          </div>
                          <span className={cn(
                            "text-xs font-bold shrink-0",
                            pct >= 70 ? "text-emerald-500" : "text-muted-foreground",
                          )}>
                            {pct}%
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="h-1.5 bg-muted-foreground/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${pct}%`,
                                background: pct >= 70
                                  ? "linear-gradient(90deg, #10B981, #34D399)"
                                  : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)/0.7))",
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                            <span>{(t?.userDashboard?.daysOf || '{completed} of {total} days')
                              .replace('{completed}', String(plan.completedDays))
                              .replace('{total}', String(plan.totalDays))}</span>
                            <span>{(t?.userDashboard?.left || '{remaining} left')
                              .replace('{remaining}', String(plan.totalDays - plan.completedDays))}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Challenge */}
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
              <div
                className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30"
                onClick={() => navigate(routes.trivia.path)}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-rose-800 dark:text-rose-300">Challenge Yourself</p>
                    <p className="text-[10px] text-rose-500 dark:text-rose-400">Bible Trivia Quiz</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-300 dark:text-rose-600 shrink-0 ml-auto" />
                </div>
                <p className="text-xs text-rose-600/70 dark:text-rose-400/70 leading-relaxed mb-3">
                  Test your knowledge of the Scriptures with fun trivia questions across all difficulty levels!
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(routes.trivia.path); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] hover:opacity-90 bg-gradient-to-r from-rose-600 to-rose-700 dark:from-rose-500 dark:to-rose-600"
                >
                  Play Trivia
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          </div>

          {/* ── RIGHT ── */}
          <div className="space-y-7">

            {/* Continue Reading */}
            {lastRead && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    {t?.userDashboard?.continueReading || 'Continue Reading'}
                  </h2>
                  <button
                    onClick={() => navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(lastRead.bookName)}&chapter=${lastRead.chapter}`)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t?.userDashboard?.readNow || 'Read now'}
                  </button>
                </div>
                <button
                  onClick={() => navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(lastRead.bookName)}&chapter=${lastRead.chapter}`)}
                  className="w-full text-start group"
                >
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {lastRead.bookName} {lastRead.chapter}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {t?.userDashboard?.lastRead || 'Last read'} &middot; {lastRead.updatedOn ? formatTime(lastRead.updatedOn, t) : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </section>
            )}

            {/* Quick Access */}
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
              <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
                {t?.userDashboard?.quickAccess || 'Quick Access'}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { label: t?.userDashboard?.myNotes || 'My Notes', icon: BookMarked, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40", onClick: () => navigate(routes.myActivity.path) },
                  { label: t?.userDashboard?.journal || 'Journal', icon: PenLine, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40", onClick: () => navigate(routes.journal.path) },
                  { label: t?.userDashboard?.history || 'History', icon: History, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40", onClick: () => navigate(routes.myActivity.path) },
                  { label: t?.userDashboard?.highlights || 'Highlights', icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40", onClick: () => navigate(routes.myActivity.path) },
                  { label: t?.userDashboard?.favorites || 'Favorites', icon: Heart, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/40", onClick: () => navigate(routes.myActivity.path) },
                ] as const).map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.label}
                      onClick={link.onClick}
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-xl transition-all duration-200",
                        "hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.97]",
                        link.bg,
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", link.color)} />
                      <span className="text-xs font-medium text-foreground/80">{link.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    {t?.userDashboard?.recentActivity || 'Recent Activity'}
                  </h2>
                  <button
                    onClick={() => navigate(routes.myActivity.path)}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t?.userDashboard?.allHistory || 'All history'}
                  </button>
                </div>
                <div className="space-y-0.5">
                  {recentActivity.slice(0, 5).map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(act.bookName)}&chapter=${act.chapter}`)}
                      className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-start hover:bg-muted/40 active:bg-muted/60 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-primary/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {act.bookName} {act.chapter}
                        </p>
                        <p className="text-xs text-muted-foreground/60">{formatTime(act.updatedOn, t)}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Daily Exegesis */}
            {dailyExegesis && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Daily Exegesis</h2>
                  <button onClick={() => navigate(routes.dailyExegesis.path)} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Open study</button>
                </div>
                <button onClick={() => navigate(routes.dailyExegesis.path)} className="w-full text-start group">
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0">
                        <BookText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground line-clamp-1">{dailyExegesis.title || 'Daily Exegesis'}</p>
                        {dailyExegesis.passageRef && (
                          <p className="text-xs text-indigo-500 font-medium mt-0.5">{dailyExegesis.passageRef}</p>
                        )}
                      </div>
                    </div>
                    {dailyExegesis.introduction && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic pl-3">
                        &ldquo;{dailyExegesis.introduction}&rdquo;
                      </p>
                    )}
                  </div>
                </button>
              </section>
            )}

            {/* Daily Devotion */}
            {dailyDevotion && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Daily Devotion</h2>
                  <button onClick={() => navigate(routes.userDevotions.path)} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Read</button>
                </div>
                <button onClick={() => navigate(routes.userDevotions.path)} className="w-full text-start group">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{dailyDevotion.title || 'Daily Devotion'}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-1">{dailyDevotion.theme || dailyDevotion.passageRef || ''}</p>
                    </div>
                  </div>
                </button>
              </section>
            )}

            {/* Daily Trivia */}
            {dailyTrivia && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Daily Trivia</h2>
                  <button onClick={() => navigate(routes.trivia.path)} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Play</button>
                </div>
                <button onClick={() => navigate(routes.trivia.path)} className="w-full text-start group">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground line-clamp-1">{dailyTrivia.question || "Today's Trivia"}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {dailyTrivia.category ? `${dailyTrivia.category} · ` : ''}{dailyTrivia.difficulty || 'Mixed'} difficulty
                      </p>
                    </div>
                  </div>
                </button>
              </section>
            )}

            {/* Latest Journal */}
            {latestEntry && (
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    {t?.userDashboard?.latestEntry || 'Latest Journal'}
                  </h2>
                  <button onClick={() => navigate(`/journal/view/${latestEntry.id}`)} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                    {t?.userDashboard?.open || 'Open'}
                  </button>
                </div>
                <button onClick={() => navigate(`/journal/view/${latestEntry.id}`)} className="w-full text-start group">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shrink-0">
                        <PenLine className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground line-clamp-1">
                          {latestEntry.passageRef || latestEntry.title || (t?.userDashboard?.journalEntry || 'Journal entry')}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
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
                    {(latestEntry.reflection || latestEntry.lookNotes) && (
                      <div className="rounded-xl bg-white/40 dark:bg-emerald-950/20 p-3">
                        <p className="text-xs text-foreground/70 italic leading-relaxed line-clamp-2">
                          &ldquo;{latestEntry.reflection || latestEntry.lookNotes}&rdquo;
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {latestEntry.isPublic && (
                        <span className="text-[10px] font-semibold text-emerald-500">
                          {t?.userDashboard?.public || 'Public'}
                        </span>
                      )}
                      {latestEntry.bookName && (
                        <span className="text-xs text-muted-foreground/60">
                          {latestEntry.bookName} {latestEntry.chapter || ''}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </section>
            )}

          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}

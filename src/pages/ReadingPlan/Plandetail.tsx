"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  HelpCircle,
  Layers,
  MessageSquare,
  Sparkles,
  Trophy,
  Zap,
  BookMarked,
  ShieldCheck,
  FileText,
  BarChart3,
  Eye,
  CircleOff,
  Pencil,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ReadingPlan {
  plan_id: string;
  planId?: string;
  plan_db_id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  total_days: number;
  totalDays?: number;
  total_assignments: number;
  total_quiz_questions: number;
  questions_enabled: boolean;
  questionsEnabled?: boolean;
  is_active: boolean;
  isActive?: boolean;
  started: boolean;
  is_completed: boolean | null;
  completed: boolean | null;
  completed_date: string | null;
  completion_percentage: number;
  completed_days_count: number;
  completed_days_json: string | null;
  progress_id: string | null;
  user_id: string | null;
  start_date: string | null;
  last_completed_date: string | null;
  days_since_started: number | null;
  days_since_last_activity: number | null;
  estimated_days_to_complete: number | null;
  avg_days_per_completion: number | null;
  streak: number | null;
  user_correct_answers?: number;
  user_answered_questions?: number;
  quiz_accuracy_percentage?: number;
  plan_created_on: string;
  days?: DayAssignment[];
}

interface Chapter {
  book: string;
  chapter: number;
  startChapter?: number;
  endChapter?: number;
}

interface QuizQuestion {
  questionId?: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
}

interface DayAssignment {
  dayNumber: number;
  title: string;
  chapters: Chapter[];
  reflectionQuestions: string[];
  quizQuestions: QuizQuestion[];
  loaded?: boolean;
  exists?: boolean;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<
  string,
  { color: string; bg: string }
> = {
  easy: {
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  medium: {
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  hard: {
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  intro: "intro",
  INTRO: "intro",
  "whole-bible": "whole-bible",
  WHOLE_BIBLE: "whole-bible",
  nt: "nt",
  NT: "nt",
  NEW_TESTAMENT: "nt",
  ot: "ot",
  OT: "ot",
  OLD_TESTAMENT: "ot",
  book: "book",
  BOOK: "book",
  topical: "topical",
  TOPICAL: "topical",
};

const normalizeDifficulty = (diff: string) => {
  const d = diff?.toUpperCase() ?? "";
  if (d === "EASY") return "easy";
  if (d === "MEDIUM") return "medium";
  if (d === "HARD") return "hard";
  return diff?.toLowerCase() ?? "medium";
};

const normalizeCategory = (cat: string) => {
  const c = cat?.toUpperCase() ?? "";
  if (c === "INTRO") return "intro";
  if (c === "WHOLE_BIBLE") return "whole-bible";
  if (c === "NEW_TESTAMENT") return "nt";
  if (c === "OLD_TESTAMENT") return "ot";
  if (c === "BOOK") return "book";
  if (c === "TOPICAL") return "topical";
  return cat?.toLowerCase() ?? "intro";
};

const formatDate = (iso: string | null, locale = "en-US") => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ─────────────────────────────────────────────
// Shared UI
// ─────────────────────────────────────────────
const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-2xl border border-border bg-card shadow-sm",
      className,
    )}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.18em] mb-3">
    {children}
  </p>
);

const Ring = ({
  pct,
  size = 96,
  stroke = 7,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ rotate: "-90deg" }}>
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(148,163,184,.18)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#rg)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (Math.min(pct, 100) / 100) * circ}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: string;
}) => (
  <GlassCard className="p-4 hover:bg-background transition-colors">
    <div
      className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center mb-2.5",
        accent,
      )}
    >
      {icon}
    </div>
    <p className="text-xl font-bold text-foreground tracking-tight">{value}</p>
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
      {label}
    </p>
  </GlassCard>
);

const StatusBadge = ({
  active,
  completed,
}: {
  active: boolean;
  completed: boolean | null;
}) => {
  const { t } = useLanguage();

  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700">
        <Trophy className="w-3 h-3" />
        {t.readingPlan.completedLabel || "Completed"}
      </span>
    );
  }

  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-sky-200 bg-sky-50 text-sky-700">
        <ShieldCheck className="w-3 h-3" />
        {t.readingPlan.activeLabel || "Active"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-border bg-muted text-muted-foreground">
      <CircleOff className="w-3 h-3" />
      {t.common.inactive || "Inactive"}
    </span>
  );
};

// ─────────────────────────────────────────────
// DayCard
// ─────────────────────────────────────────────
const DayCard = ({
  day,
  isCompleted,
  questionsEnabled,
}: {
  day: DayAssignment;
  isCompleted: boolean;
  questionsEnabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState<number | null>(null);
  const { t } = useLanguage();

  const hasChapters = day.chapters?.some((c) => c.book);
  const hasReflections = day.reflectionQuestions?.some((r) => r.trim());
  const hasQuiz = day.quizQuestions?.length > 0;
  const exists = day.exists ?? false;

  if (!exists) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background">
        <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs font-bold text-muted-foreground/70 shrink-0">
          {day.dayNumber}
        </div>
        <p className="text-xs text-muted-foreground italic">
          {t.readingPlan.day} {day.dayNumber} — {t.readingPlan.dayNotConfigured}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-colors duration-200 bg-card",
        isCompleted
          ? "border-emerald-200 bg-emerald-50/60"
          : open
            ? "border-violet-200 bg-violet-50/50"
            : "border-border",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left group"
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border",
            isCompleted
              ? "bg-emerald-100 border-emerald-200 text-emerald-700"
              : "bg-violet-100 border-violet-200 text-violet-700",
          )}
        >
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : day.dayNumber}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground/80 truncate group-hover:text-foreground transition-colors">
            {day.title || `Day ${day.dayNumber}`}
          </p>
          {hasChapters && (
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {day.chapters
                .filter((c) => c.book)
                .map((c) => `${c.book} ${c.startChapter}`)
                .join(" · ")}
            </p>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {hasReflections && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-sky-200 bg-sky-50 text-sky-700">
              <MessageSquare className="w-2.5 h-2.5" />
              {day.reflectionQuestions.filter((r) => r.trim()).length}
            </span>
          )}
          {questionsEnabled && hasQuiz && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-amber-200 bg-amber-50 text-amber-700">
              <HelpCircle className="w-2.5 h-2.5" />
              {day.quizQuestions.length}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground/70 transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-5">
          {hasChapters && (
            <div>
              <SectionLabel>{t.readingPlan.scriptureReading}</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {day.chapters
                  .filter((c) => c.book)
                  .map((ch, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-xs font-medium text-violet-700"
                    >
                      <BookOpen className="w-3 h-3 opacity-70" />
                      {ch.book} {ch.chapter}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {hasReflections && (
            <div>
              <SectionLabel>{t.readingPlan.reflectionQuestions}</SectionLabel>
              <div className="space-y-2">
                {day.reflectionQuestions
                  .filter((r) => r.trim())
                  .map((q, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="mt-0.5 w-5 h-5 rounded-full border border-sky-200 bg-sky-50 text-[10px] font-bold text-sky-700 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {q}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {questionsEnabled && hasQuiz && (
            <div>
              <SectionLabel>
                {t.readingPlan.quizQuestionsLabel.replace("{n}", String(day.quizQuestions.length))}
              </SectionLabel>
              <div className="space-y-2">
                {day.quizQuestions.map((q, qi) => (
                  <div
                    key={qi}
                    className="rounded-xl border border-border bg-muted/70 overflow-hidden"
                  >
                    <button
                      onClick={() => setQuizOpen(quizOpen === qi ? null : qi)}
                      className="w-full flex items-start gap-2.5 px-3 py-3 text-left"
                    >
                      <span className="w-5 h-5 rounded-full border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        {qi + 1}
                      </span>
                      <p className="flex-1 text-sm text-foreground/80 leading-snug">
                        {q.question}
                      </p>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5 transition-transform",
                          quizOpen === qi && "rotate-180",
                        )}
                      />
                    </button>

                    {quizOpen === qi && (
                      <div className="border-t border-border px-3 pb-3 pt-2.5 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={cn(
                                "flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs",
                                oi === q.correctAnswer
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-border bg-card text-muted-foreground",
                              )}
                            >
                              {oi === q.correctAnswer ? (
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border border-border shrink-0" />
                              )}
                              {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div className="px-2.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                            <p className="text-[10px] font-semibold text-indigo-700 mb-0.5 uppercase tracking-wider">
                              {t.readingPlan.explanation}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
const PlanDetail = () => {
  const { planId } = useParams<{ planId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { t, isRtl, lang } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [days, setDays] = useState<DayAssignment[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);
  const [userSearchTerm, setUserSearchFilter] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "quiz" | "admin"
  >("overview");

  const filteredUsers = useMemo(() => {
    if (!adminStats?.users) return [];
    if (!userSearchTerm.trim()) return adminStats.users;

    const term = userSearchTerm.toLowerCase().trim();
    return adminStats.users.filter(
      (u: any) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.username?.toLowerCase().includes(term),
    );
  }, [adminStats?.users, userSearchTerm]);

  const completedDayNums: Set<number> = useMemo(() => {
    try {
      if (plan?.completed_days_json) {
        return new Set(JSON.parse(plan.completed_days_json));
      }
    } catch {}
    return new Set();
  }, [plan?.completed_days_json]);

  const loadAdminStats = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingAdminStats(true);
    try {
      const resp = await sendPostRequest("reading-plans", "admin-stats", {
        planId: planId ?? "",
      });
      if (resp.returnCode === 200) {
        setAdminStats(resp.returnData);
      }
    } catch (e) {
      console.error("Admin stats error:", e);
    } finally {
      setLoadingAdminStats(false);
    }
  }, [planId, isAdmin]);

  const loadPlan = useCallback(async () => {
    setLoadingPlan(true);
    try {
      const resp = await sendPostRequest("reading-plans", "plan-detail", {
        planId: planId ?? "",
      });
      if (resp.returnCode === 200 && resp.returnData) {
        const data = resp.returnData;
        setPlan(data);

        if (data.days && Array.isArray(data.days)) {
          setDays(data.days);
        }

        // If admin, also load aggregate stats
        if (isAdmin) {
          loadAdminStats();
        }
      } else {
        toast({
          title: t.readingPlan?.toastLoadError || 'Failed to load plan',
          description: resp.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: t.readingPlan?.toastNetworkError || 'Network error',
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(false);
    }
  }, [planId, toast]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const totalReflections = days.reduce(
    (s, d) => s + d.reflectionQuestions.filter((r) => r.trim()).length,
    0,
  );

  const configuredDays = days.filter((d) => d.exists).length;
  const allQuizDays = days.filter(
    (d) => d.exists && d.quizQuestions.length > 0,
  );
  const totalQuizCount = days.reduce((s, d) => s + d.quizQuestions.length, 0);
  const configuredPct =
    plan && plan.total_days > 0
      ? Math.round((configuredDays / plan.total_days) * 100)
      : 0;

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-muted-foreground text-sm">{t.readingPlan.loadingPlan}</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <BookOpen className="w-10 h-10 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground text-sm">{t.readingPlan.planNotFound}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-violet-600 text-sm hover:underline"
          >
            {t.common.goBack}
          </button>
        </div>
      </div>
    );
  }

  const diffKey = normalizeDifficulty(plan.difficulty);
  const diff = DIFFICULTY_CONFIG[diffKey] ?? DIFFICULTY_CONFIG.medium;
  const diffLabels: Record<string, string> = {
    easy: t.readingPlan.diffBeginner,
    medium: t.readingPlan.diffIntermediate,
    hard: t.readingPlan.diffAdvanced,
  };
  const diffLabel = diffLabels[diffKey] || diffKey;

  const pct = Math.round(plan.completion_percentage ?? 0);
  const catKey = normalizeCategory(plan.category);
  const catLabels: Record<string, string> = {
    intro: t.readingPlan.catIntro,
    "whole-bible": t.readingPlan.catWholeBible,
    nt: t.readingPlan.catNT,
    ot: t.readingPlan.catOT,
    book: t.readingPlan.catBookByBook,
    topical: t.readingPlan.catTopical,
  };
  const catLabel = catLabels[catKey] || catKey;

  // ── Stats Logic ──────────────────────────────
  // For admins, we often prefer showing global stats in summary areas
  const displayQuizAccuracy =
    isAdmin && adminStats
      ? adminStats.globalQuizAccuracy
      : Math.round(plan.quiz_accuracy_percentage ?? 0);

  const displayAnsweredQuestions =
    isAdmin && adminStats
      ? adminStats.totalQuizAnswers
      : (plan.user_answered_questions ?? 0);

  const displayCorrectAnswers =
    isAdmin && adminStats
      ? adminStats.totalQuizCorrect
      : (plan.user_correct_answers ?? 0);

  const displayWrongAnswers =
    isAdmin && adminStats
      ? adminStats.totalQuizWrong
      : (plan.user_answered_questions ?? 0) - (plan.user_correct_answers ?? 0);

  const displayQuizTotal =
    isAdmin && adminStats
      ? adminStats.totalQuizAnswers
      : plan.total_quiz_questions;

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-violet-200/40 blur-[130px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full bg-indigo-200/40 blur-[110px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Top */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm group w-fit"
          >
            <ArrowLeft className={cn("w-4 h-4 transition-transform", isRtl ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5")} />
            {t.readingPlan.backToPlans}
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge
              active={plan.is_active}
              completed={plan.is_completed}
            />

            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                diff.bg,
                diff.color,
              )}
            >
              <Zap className="w-3 h-3" />
              {diffLabel}
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-border bg-card text-muted-foreground">
              <Layers className="w-3 h-3" />
              {catLabel}
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-border bg-card text-muted-foreground">
              <Eye className="w-3 h-3" />
              {t.readingPlan.readOnly}
            </span>

            <button
              onClick={() =>
                navigate(
                  routes.editReadingPlan.path.replace(":planId", plan.plan_id),
                )
              }
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              {t.readingPlan.editPlan}
            </button>

            {plan.started && !isAdmin && (
              <button
                onClick={() => {
                  const nextDay = plan.completed_days_count + 1;
                  navigate(
                    `/daily-reading?planId=${plan.plan_id}&day=${Math.min(nextDay, plan.total_days)}`,
                  );
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-violet-600/20"
              >
                <Play className="w-4 h-4" />
                {plan.completed_days_count === 0
                  ? t.readingPlan.actionStart
                  : t.readingPlan.continueReading}
              </button>
            )}
          </div>
        </div>

        {/* Hero summary */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-5">
          <GlassCard className="p-6">
            <SectionLabel>{t.readingPlan.planSummary}</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Calendar className="w-4 h-4 text-violet-600" />}
                label={t.readingPlan.totalDays}
                value={plan.total_days}
                accent="bg-violet-50"
              />
              <StatCard
                icon={<BookMarked className="w-4 h-4 text-indigo-600" />}
                label={t.readingPlan.assignments}
                value={plan.total_assignments}
                accent="bg-indigo-50"
              />
              <StatCard
                icon={<HelpCircle className="w-4 h-4 text-sky-600" />}
                label={t.readingPlan.quizQs}
                value={plan.total_quiz_questions}
                accent="bg-sky-50"
              />
              <StatCard
                icon={<Flame className="w-4 h-4 text-orange-600" />}
                label={t.readingPlan.streak}
                value={plan.streak !== null ? `${plan.streak}d` : "—"}
                accent="bg-orange-50"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionLabel>{t.readingPlan.progressSnapshot}</SectionLabel>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <Ring pct={pct} size={92} stroke={6} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-foreground">
                      {pct}%
                    </span>
                    <span className="text-[8px] uppercase tracking-widest text-muted-foreground">
                      {t.readingPlan.complete}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t.readingPlan.daysCompleted}</span>
                    <span className="font-semibold text-foreground">
                      {plan.completed_days_count} / {plan.total_days}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      {t.common.status}:{" "}
                      <span
                        className={cn(
                          "font-bold",
                          plan.is_completed
                            ? "text-emerald-600"
                            : plan.started
                              ? "text-sky-600"
                              : "text-muted-foreground",
                        )}
                      >
                        {plan.is_completed
                          ? t.readingPlan.completedLabel
                          : plan.started
                            ? t.readingPlan.inProgress
                            : t.readingPlan.notStartedLabel}
                      </span>
                    </p>
                    {plan.started && (
                      <p>
                        {t.readingPlan.startDate}:{" "}
                        <span className="text-foreground/80 font-medium">
                          {formatDate(plan.start_date, lang)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && adminStats && (
                <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                      {t.readingPlan.globalCompleted}
                    </p>
                    <p className="text-lg font-bold text-emerald-900">
                      {adminStats.completedEnrollments}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                      {t.readingPlan.globalInProgress}
                    </p>
                    <p className="text-lg font-bold text-amber-900">
                      {adminStats.inProgressEnrollments}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Configuration strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GlassCard className="p-5">
            <SectionLabel>{t.readingPlan.contentReadiness}</SectionLabel>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.readingPlan.configuredDays}</span>
                <span className="font-semibold text-foreground">
                  {configuredDays} / {plan.total_days}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${configuredPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {configuredPct}% {t.readingPlan.of} {plan.total_days} {t.readingPlan.days}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionLabel>{t.readingPlan.quizCoverage}</SectionLabel>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.readingPlan.quizEnabled}</span>
                <span className="font-semibold text-foreground">
                  {plan.questions_enabled ? t.readingPlan.yes : t.readingPlan.no}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.readingPlan.quizDays}</span>
                <span className="font-semibold text-foreground">
                  {allQuizDays.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.readingPlan.totalQuestions}</span>
                <span className="font-semibold text-foreground">
                  {totalQuizCount}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionLabel>
              {isAdmin ? t.readingPlan.engagementLabel : t.readingPlan.engagementStats}
            </SectionLabel>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.readingPlan.reflections}</span>
                <span className="font-semibold text-foreground">
                  {totalReflections}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isAdmin ? t.readingPlan.globalAccuracy : t.readingPlan.quizAccuracy}
                </span>
                <span className="font-semibold text-foreground">
                  {displayQuizAccuracy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isAdmin ? t.readingPlan.totalAnswers : t.readingPlan.answeredQuestions}
                </span>
                <span className="font-semibold text-foreground">
                  {displayAnsweredQuestions}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl border border-border bg-card w-fit shadow-sm">
          {(["overview", "schedule", "quiz", "admin"] as const).map((tab) => {
            if (tab === "admin" && !isAdmin) return null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-150",
                  activeTab === tab
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab === "quiz"
                  ? t.readingPlan.quizQuestionsLabel.replace("{n}", String(totalQuizCount))
                  : tab === "schedule"
                    ? `${t.readingPlan.dailyAssignments} (${configuredDays}d)`
                    : tab === "admin"
                      ? t.readingPlan.adminInsights
                      : t.readingPlan.overview}
              </button>
            );
          })}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <GlassCard className="p-5">
              <SectionLabel>{t.readingPlan.timelineMetadata}</SectionLabel>
              {[
                { label: t.readingPlan.created, value: formatDate(plan.plan_created_on, lang) },
                { label: t.readingPlan.startDate, value: formatDate(plan.start_date, lang) },
                {
                  label: t.readingPlan.lastActivity,
                  value: formatDate(plan.last_completed_date, lang),
                },
                {
                  label: t.readingPlan.daysSinceStarted,
                  value:
                    plan.days_since_started !== null
                      ? `${plan.days_since_started}d`
                      : t.readingPlan.notStartedLabel,
                },
                {
                  label: t.readingPlan.daysSinceActivity,
                  value:
                    plan.days_since_last_activity !== null
                      ? `${plan.days_since_last_activity}d`
                      : "—",
                },
                {
                  label: t.readingPlan.completionDate,
                  value: formatDate(plan.completed_date, lang),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </GlassCard>

            <GlassCard className="p-5">
              <SectionLabel>
                {isAdmin ? t.readingPlan.aggregatePerformance : t.readingPlan.userPerformance}
              </SectionLabel>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                  <Ring pct={displayQuizAccuracy} size={72} stroke={5} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-foreground">
                      {displayQuizAccuracy}%
                    </span>
                    <span className="text-[7px] text-muted-foreground uppercase">
                      {t.readingPlan.quizAccuracyLabel}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    {
                      label: isAdmin ? t.readingPlan.totalAnswers : t.readingPlan.answered,
                      value: isAdmin
                        ? displayAnsweredQuestions
                        : `${displayAnsweredQuestions} / ${plan.total_quiz_questions}`,
                      color: "text-foreground",
                    },
                    {
                      label: t.readingPlan.correct,
                      value: displayCorrectAnswers,
                      color: "text-emerald-700",
                    },
                    {
                      label: t.readingPlan.wrong,
                      value: displayWrongAnswers,
                      color: "text-rose-700",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={cn("font-semibold", color)}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {[
                {
                  label: t.readingPlan.avgDaysPerCompletion,
                  value:
                    plan.avg_days_per_completion !== null
                      ? `${plan.avg_days_per_completion}d`
                      : "—",
                },
                {
                  label: t.readingPlan.estDaysToComplete,
                  value:
                    plan.estimated_days_to_complete !== null
                      ? `${plan.estimated_days_to_complete}d`
                      : "—",
                },
                { label: t.readingPlan.reflectionQuestions, value: totalReflections },
                {
                  label: t.readingPlan.configuredDays,
                  value: `${configuredDays} / ${plan.total_days}`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between py-2 border-b border-border last:border-0 text-xs"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </GlassCard>

            <GlassCard className="p-5 lg:col-span-2">
              <SectionLabel>{t.readingPlan.adminNotes}</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">
                      {t.readingPlan.planContent}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.readingPlan.reviewContent}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">
                      {t.readingPlan.quizQuality}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.readingPlan.reviewQuizQuality}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">
                      {t.readingPlan.analyticsText}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.readingPlan.reviewAnalytics}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">
                      {t.common.status}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.readingPlan.reviewStatus}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Admin Insights */}
        {activeTab === "admin" && isAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<BarChart3 className="w-4 h-4 text-violet-600" />}
                label={t.readingPlan.totalEnrollments}
                value={adminStats?.totalEnrollments ?? "—"}
                accent="bg-violet-50"
              />
              <StatCard
                icon={<HelpCircle className="w-4 h-4 text-sky-600" />}
                label={t.readingPlan.quizAnswersCW}
                value={
                  adminStats?.totalQuizAnswers > 0
                    ? `${adminStats.totalQuizCorrect} / ${adminStats.totalQuizWrong}`
                    : "0 / 0"
                }
                accent="bg-sky-50"
              />
              <StatCard
                icon={<Clock className="w-4 h-4 text-amber-600" />}
                label={t.readingPlan.inProgressCount}
                value={adminStats?.inProgressEnrollments ?? "—"}
                accent="bg-amber-50"
              />
              <StatCard
                icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
                label={t.readingPlan.globalQuizAccuracy}
                value={`${adminStats?.globalQuizAccuracy ?? 0}%`}
                accent="bg-indigo-50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <GlassCard className="p-5 lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <SectionLabel>{t.readingPlan.userProgressDetails}</SectionLabel>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t.readingPlan.searchUsers}
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchFilter(e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full sm:w-48 transition-all"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">  
                    <table className={cn("w-full", isRtl ? "text-right" : "text-left")}>
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className={cn("pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider", isRtl ? "text-right" : "text-left")}>
                              {t.common.name}
                            </th>
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">
                              {t.readingPlan.progress}
                            </th>
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">
                              {t.readingPlan.streak}
                            </th>
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">
                              {t.readingPlan.quizCW}
                            </th>
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">
                              {t.readingPlan.lastActivity}
                            </th>
                            <th className={cn("pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider", isRtl ? "text-left" : "text-right")}>
                              {t.common.status}
                            </th>
                          </tr>
                        </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u: any, i: number) => (
                          <tr
                            key={i}
                            className="hover:bg-background/50 transition-colors"
                          >
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                                  {u.photo && u.photo.replace(/[`\s]/g, "") ? (
                                    <img
                                      src={u.photo.replace(/[`\s]/g, "")}
                                      alt={u.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground/70 bg-muted">
                                      {u.name?.charAt(0) || "?"}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {u.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-violet-500 rounded-full"
                                    style={{
                                      width: `${u.completionPercentage}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  {u.completedDaysCount} / {plan.total_days}{" "}
                                  {t.readingPlan.days}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold">
                                <Flame className="w-3 h-3" />
                                {u.streak}d
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                  <span className="text-emerald-600">
                                    {u.quizStats?.correct || 0}
                                  </span>
                                  <span className="text-muted-foreground/50">/</span>
                                  <span className="text-rose-600">
                                    {u.quizStats?.wrong || 0}
                                  </span>
                                </div>
                                <span className="text-[9px] text-muted-foreground/70">
                                  {u.quizStats?.accuracy || 0}%
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {u.lastActivity
                                  ? new Date(
                                      u.lastActivity,
                                    ).toLocaleDateString(lang)
                                  : t.readingPlan.dateNotSet}
                              </span>
                            </td>
                            <td className="py-3 pl-4 text-right">
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                  u.status === "completed"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                    : u.status === "inprogress"
                                      ? "bg-sky-50 border-sky-100 text-sky-700"
                                      : "bg-background border-border/50 text-muted-foreground",
                                )}
                              >
                                {u.status === "completed"
                                  ? t.readingPlan.done
                                  : u.status === "inprogress"
                                    ? t.readingPlan.inProgress
                                    : t.readingPlan.startedLabel}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-xs text-muted-foreground/70 italic"
                          >
                            {userSearchTerm.trim()
                              ? t.readingPlan.noUsersMatching.replace("{term}", userSearchTerm)
                              : t.readingPlan.noUsersEnrolled}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              <div className="space-y-5">
                <GlassCard className="p-5">
                  <SectionLabel>{t.readingPlan.engagementTrends}</SectionLabel>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {t.readingPlan.globalAccuracyLabel}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {adminStats?.globalQuizAccuracy ?? 0}%
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                        {t.readingPlan.mostDifficultQuestions}
                      </p>
                      {adminStats?.difficultQuestions?.length > 0 ? (
                        adminStats.difficultQuestions.map(
                          (q: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card"
                            >
                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {q.question}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {t.readingPlan.day} {q.dayNumber} · {q.totalAnswers} {t.readingPlan.quizAnswersCW.toLowerCase()}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-bold px-2 py-1 rounded-md",
                                  q.accuracy < 30
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-100 text-amber-700",
                                )}
                              >
                                {q.accuracy}%
                              </span>
                            </div>
                          ),
                        )
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          {t.readingPlan.noQuizData}
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <SectionLabel>{t.readingPlan.planStructureSummary}</SectionLabel>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">
                        {t.readingPlan.dailyAssignments}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {adminStats?.assignmentsCount ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">
                        {t.readingPlan.quizQuestionsCount}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {adminStats?.questionsCount ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">
                        {t.readingPlan.avgQsPerDay}
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {adminStats?.assignmentsCount > 0
                          ? (
                              adminStats.questionsCount /
                              adminStats.assignmentsCount
                            ).toFixed(1)
                          : 0}
                      </span>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <p className="text-sm font-bold text-indigo-900">
                          {t.readingPlan.proTip}
                        </p>
                      </div>
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        {t.readingPlan.proTipContent}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        )}

        {/* Schedule */}
        {activeTab === "schedule" && (
          <div className="space-y-2">
            {loadingPlan
              ? Array.from({ length: plan.total_days }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-card animate-pulse border border-border"
                  />
                ))
              : days.map((day) => (
                  <DayCard
                    key={day.dayNumber}
                    day={day}
                    isCompleted={completedDayNums.has(day.dayNumber)}
                    questionsEnabled={plan.questions_enabled}
                  />
                ))}
          </div>
        )}

        {/* Quiz */}
        {activeTab === "quiz" && (
          <div>
            {!plan.questions_enabled ? (
              <div className="flex flex-col items-center py-16 text-center">
                <HelpCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">
                  {t.readingPlan.quizDisabled}
                </p>
              </div>
            ) : loadingPlan ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl bg-card animate-pulse border border-border"
                  />
                ))}
              </div>
            ) : allQuizDays.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <HelpCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">
                  {t.readingPlan.noQuizFound}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  let runningIdx = 0;
                  return allQuizDays.map((day) => (
                    <GlassCard key={day.dayNumber} className="p-4">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                        <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-[10px] font-bold text-violet-700 shrink-0">
                          {day.dayNumber}
                        </div>
                        <p className="text-xs font-semibold text-foreground/80 flex-1">
                          {day.title || `Day ${day.dayNumber}`}
                        </p>
                        {day.chapters.filter((c) => c.book).length > 0 && (
                          <span className="text-[10px] text-muted-foreground hidden sm:block">
                            {day.chapters
                              .filter((c) => c.book)
                              .map((c) => `${c.book} ${c.chapter}`)
                              .join(" · ")}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {day.quizQuestions.length}Q
                        </span>
                      </div>

                      <div className="space-y-3">
                        {day.quizQuestions.map((q, qi) => {
                          const idx = ++runningIdx;
                          return (
                            <div
                              key={qi}
                              className="rounded-xl border border-border bg-background p-3 space-y-2.5"
                            >
                              <div className="flex gap-2.5 items-start">
                                <span className="w-5 h-5 rounded-full border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                                  {idx}
                                </span>
                                <p className="text-sm text-foreground/80 leading-snug">
                                  {q.question}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-7">
                                {q.options.map((opt, oi) => (
                                  <div
                                    key={oi}
                                    className={cn(
                                      "flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs",
                                      oi === q.correctAnswer
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-border bg-card text-muted-foreground",
                                    )}
                                  >
                                    {oi === q.correctAnswer ? (
                                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    ) : (
                                      <div className="w-3 h-3 rounded-full border border-border shrink-0" />
                                    )}
                                    {opt}
                                  </div>
                                ))}
                              </div>

                              {q.explanation && (
                                <div className="pl-7 border-l-2 border-indigo-200 ml-2">
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {q.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </GlassCard>
                  ));
                })()}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 pb-8 text-[10px] text-muted-foreground/70 font-mono">
          <span>{plan.plan_id}</span>
          <span>DB#{plan.plan_db_id}</span>
          <span>{formatDate(plan.plan_created_on, lang)}</span>
          <span
            className={plan.is_active ? "text-emerald-600" : "text-rose-600"}
          >
            {plan.is_active ? `● ${t.readingPlan.activeLabel}` : `● ${t.common.inactive}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;

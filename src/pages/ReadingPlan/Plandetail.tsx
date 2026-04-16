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
  { label: string; color: string; bg: string }
> = {
  easy: {
    label: "Easy",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  medium: {
    label: "Medium",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  hard: {
    label: "Hard",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  intro: "Introduction",
  INTRO: "Introduction",
  "whole-bible": "Whole Bible",
  WHOLE_BIBLE: "Whole Bible",
  nt: "New Testament",
  NT: "New Testament",
  NEW_TESTAMENT: "New Testament",
  ot: "Old Testament",
  OT: "Old Testament",
  OLD_TESTAMENT: "Old Testament",
  book: "Single Book",
  BOOK: "Single Book",
  topical: "Topical",
  TOPICAL: "Topical",
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

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
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
      "rounded-2xl border border-slate-200 bg-white shadow-sm",
      className,
    )}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mb-3">
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
  <GlassCard className="p-4 hover:bg-slate-50 transition-colors">
    <div
      className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center mb-2.5",
        accent,
      )}
    >
      {icon}
    </div>
    <p className="text-xl font-bold text-slate-900 tracking-tight">{value}</p>
    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
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
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700">
        <Trophy className="w-3 h-3" />
        Completed
      </span>
    );
  }

  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-sky-200 bg-sky-50 text-sky-700">
        <ShieldCheck className="w-3 h-3" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 bg-slate-100 text-slate-600">
      <CircleOff className="w-3 h-3" />
      Inactive
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

  const hasChapters = day.chapters?.some((c) => c.book);
  const hasReflections = day.reflectionQuestions?.some((r) => r.trim());
  const hasQuiz = day.quizQuestions?.length > 0;
  const exists = day.exists ?? false;

  if (!exists) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
        <div className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
          {day.dayNumber}
        </div>
        <p className="text-xs text-slate-500 italic">
          Day {day.dayNumber} — not yet configured
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-colors duration-200 bg-white",
        isCompleted
          ? "border-emerald-200 bg-emerald-50/60"
          : open
            ? "border-violet-200 bg-violet-50/50"
            : "border-slate-200",
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
          <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
            {day.title || `Day ${day.dayNumber}`}
          </p>
          {hasChapters && (
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              {day.chapters
                .filter((c) => c.book)
                .map((c) => `${c.book} ${c.chapter}`)
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
            "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-5">
          {hasChapters && (
            <div>
              <SectionLabel>Scripture Reading</SectionLabel>
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
              <SectionLabel>Reflection Questions</SectionLabel>
              <div className="space-y-2">
                {day.reflectionQuestions
                  .filter((r) => r.trim())
                  .map((q, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="mt-0.5 w-5 h-5 rounded-full border border-sky-200 bg-sky-50 text-[10px] font-bold text-sky-700 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed">
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
                Quiz Questions ({day.quizQuestions.length})
              </SectionLabel>
              <div className="space-y-2">
                {day.quizQuestions.map((q, qi) => (
                  <div
                    key={qi}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden"
                  >
                    <button
                      onClick={() => setQuizOpen(quizOpen === qi ? null : qi)}
                      className="w-full flex items-start gap-2.5 px-3 py-3 text-left"
                    >
                      <span className="w-5 h-5 rounded-full border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        {qi + 1}
                      </span>
                      <p className="flex-1 text-sm text-slate-700 leading-snug">
                        {q.question}
                      </p>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 transition-transform",
                          quizOpen === qi && "rotate-180",
                        )}
                      />
                    </button>

                    {quizOpen === qi && (
                      <div className="border-t border-slate-200 px-3 pb-3 pt-2.5 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={cn(
                                "flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs",
                                oi === q.correctAnswer
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-white text-slate-500",
                              )}
                            >
                              {oi === q.correctAnswer ? (
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
                              )}
                              {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div className="px-2.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                            <p className="text-[10px] font-semibold text-indigo-700 mb-0.5 uppercase tracking-wider">
                              Explanation
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
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
  const isAdmin = userInfo?.userRole === 1;

  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [days, setDays] = useState<DayAssignment[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "quiz">(
    "overview",
  );

  const completedDayNums: Set<number> = useMemo(() => {
    try {
      if (plan?.completed_days_json) {
        return new Set(JSON.parse(plan.completed_days_json));
      }
    } catch {}
    return new Set();
  }, [plan?.completed_days_json]);

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
      } else {
        toast({
          title: "Failed to load plan",
          description: resp.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Network error",
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-slate-500 text-sm">Loading plan…</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-500 text-sm">Plan not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-violet-600 text-sm hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const diff = DIFFICULTY_CONFIG[plan.difficulty] ?? DIFFICULTY_CONFIG.medium;
  const pct = Math.round(plan.completion_percentage ?? 0);
  const quizPct = Math.round(plan.quiz_accuracy_percentage ?? 0);
  const catLabel = CATEGORY_LABELS[plan.category] ?? plan.category;

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden"
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
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Reading Plans
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
              {diff.label}
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-600">
              <Layers className="w-3 h-3" />
              {catLabel}
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-600">
              <Eye className="w-3 h-3" />
              Read Only
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
              Edit Plan
            </button>

            {plan.started && !isAdmin && (
              <button
                onClick={() => {
                  const nextDay = plan.completed_days_count + 1;
                  navigate(`/daily-reading?planId=${plan.plan_id}&day=${Math.min(nextDay, plan.total_days)}`);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-violet-600/20"
              >
                <Play className="w-4 h-4" />
                {plan.completed_days_count === 0 ? "Start Reading" : "Continue Reading"}
              </button>
            )}
          </div>
        </div>

        {/* Hero summary */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_.8fr] gap-5">
          <GlassCard className="p-6">
            <SectionLabel>Plan Summary</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Calendar className="w-4 h-4 text-violet-600" />}
                label="Total Days"
                value={plan.total_days}
                accent="bg-violet-50"
              />
              <StatCard
                icon={<BookMarked className="w-4 h-4 text-indigo-600" />}
                label="Assignments"
                value={plan.total_assignments}
                accent="bg-indigo-50"
              />
              <StatCard
                icon={<HelpCircle className="w-4 h-4 text-sky-600" />}
                label="Quiz Qs"
                value={plan.total_quiz_questions}
                accent="bg-sky-50"
              />
              <StatCard
                icon={<Flame className="w-4 h-4 text-orange-600" />}
                label="Streak"
                value={plan.streak !== null ? `${plan.streak}d` : "—"}
                accent="bg-orange-50"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionLabel>Progress Snapshot</SectionLabel>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Ring pct={pct} size={92} stroke={6} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">
                    {pct}%
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-slate-500">
                    complete
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Days completed</span>
                  <span className="font-semibold text-slate-800">
                    {plan.completed_days_count} / {plan.total_days}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Started:{" "}
                    <span className="text-slate-700 font-medium">
                      {plan.started ? "Yes" : "No"}
                    </span>
                  </p>
                  <p>
                    Completed:{" "}
                    <span className="text-slate-700 font-medium">
                      {plan.is_completed ? "Yes" : "No"}
                    </span>
                  </p>
                  <p>
                    Completion Date:{" "}
                    <span className="text-slate-700 font-medium">
                      {formatDate(plan.completed_date)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Configuration strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <GlassCard className="p-5">
            <SectionLabel>Content Readiness</SectionLabel>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Configured Days</span>
                <span className="font-semibold text-slate-900">
                  {configuredDays} / {plan.total_days}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${configuredPct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                {configuredPct}% of the schedule currently has assignment
                content.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionLabel>Quiz Coverage</SectionLabel>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Quiz Enabled</span>
                <span className="font-semibold text-slate-900">
                  {plan.questions_enabled ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quiz Days</span>
                <span className="font-semibold text-slate-900">
                  {allQuizDays.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Questions</span>
                <span className="font-semibold text-slate-900">
                  {totalQuizCount}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionLabel>Engagement Stats</SectionLabel>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Reflections</span>
                <span className="font-semibold text-slate-900">
                  {totalReflections}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quiz Accuracy</span>
                <span className="font-semibold text-slate-900">{quizPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Answered Questions</span>
                <span className="font-semibold text-slate-900">
                  {plan.user_answered_questions}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl border border-slate-200 bg-white w-fit shadow-sm">
          {(["overview", "schedule", "quiz"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-150",
                activeTab === tab
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              {tab === "quiz"
                ? `Quiz (${totalQuizCount})`
                : tab === "schedule"
                  ? `Schedule (${configuredDays}d)`
                  : "Overview"}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <GlassCard className="p-5">
              <SectionLabel>Timeline & Metadata</SectionLabel>
              {[
                { label: "Created", value: formatDate(plan.plan_created_on) },
                { label: "Start Date", value: formatDate(plan.start_date) },
                {
                  label: "Last Activity",
                  value: formatDate(plan.last_completed_date),
                },
                {
                  label: "Days Since Started",
                  value:
                    plan.days_since_started !== null
                      ? `${plan.days_since_started}d`
                      : "Not started",
                },
                {
                  label: "Days Since Activity",
                  value:
                    plan.days_since_last_activity !== null
                      ? `${plan.days_since_last_activity}d`
                      : "—",
                },
                {
                  label: "Completion Date",
                  value: formatDate(plan.completed_date),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 border-b border-slate-200 last:border-0"
                >
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-medium text-slate-800">
                    {value}
                  </span>
                </div>
              ))}
            </GlassCard>

            <GlassCard className="p-5">
              <SectionLabel>User Performance</SectionLabel>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                  <Ring pct={quizPct} size={72} stroke={5} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-slate-900">
                      {quizPct}%
                    </span>
                    <span className="text-[7px] text-slate-500 uppercase">
                      acc
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    {
                      label: "Answered",
                      value: `${plan.user_answered_questions} / ${plan.total_quiz_questions}`,
                      color: "text-slate-800",
                    },
                    {
                      label: "Correct",
                      value: plan.user_correct_answers,
                      color: "text-emerald-700",
                    },
                    {
                      label: "Wrong",
                      value:
                        plan.user_answered_questions -
                        plan.user_correct_answers,
                      color: "text-rose-700",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className={cn("font-semibold", color)}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {[
                {
                  label: "Avg Days / Completion",
                  value:
                    plan.avg_days_per_completion !== null
                      ? `${plan.avg_days_per_completion}d`
                      : "—",
                },
                {
                  label: "Est. Days to Complete",
                  value:
                    plan.estimated_days_to_complete !== null
                      ? `${plan.estimated_days_to_complete}d`
                      : "—",
                },
                { label: "Reflection Questions", value: totalReflections },
                {
                  label: "Configured Days",
                  value: `${configuredDays} / ${plan.total_days}`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between py-2 border-b border-slate-200 last:border-0 text-xs"
                >
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-800">{value}</span>
                </div>
              ))}
            </GlassCard>

            <GlassCard className="p-5 lg:col-span-2">
              <SectionLabel>Admin Notes</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-800">
                      Plan Content
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Review whether all days are configured and titles/chapters
                    are present.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-800">
                      Quiz Quality
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Confirm questions, answers, and explanations are complete
                    and accurate.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-800">
                      Analytics
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Inspect completion, streak, and quiz accuracy for admin
                    insights.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-800">
                      Status
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This page is for review and monitoring only. Users start
                    plans elsewhere.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Schedule */}
        {activeTab === "schedule" && (
          <div className="space-y-2">
            {loadingPlan
              ? Array.from({ length: plan.total_days }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-white animate-pulse border border-slate-200"
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
                <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">
                  Quiz questions are disabled for this plan.
                </p>
              </div>
            ) : loadingPlan ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl bg-white animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : allQuizDays.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">
                  No quiz questions found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  let runningIdx = 0;
                  return allQuizDays.map((day) => (
                    <GlassCard key={day.dayNumber} className="p-4">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                        <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-[10px] font-bold text-violet-700 shrink-0">
                          {day.dayNumber}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 flex-1">
                          {day.title || `Day ${day.dayNumber}`}
                        </p>
                        {day.chapters.filter((c) => c.book).length > 0 && (
                          <span className="text-[10px] text-slate-500 hidden sm:block">
                            {day.chapters
                              .filter((c) => c.book)
                              .map((c) => `${c.book} ${c.chapter}`)
                              .join(" · ")}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          {day.quizQuestions.length}Q
                        </span>
                      </div>

                      <div className="space-y-3">
                        {day.quizQuestions.map((q, qi) => {
                          const idx = ++runningIdx;
                          return (
                            <div
                              key={qi}
                              className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5"
                            >
                              <div className="flex gap-2.5 items-start">
                                <span className="w-5 h-5 rounded-full border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                                  {idx}
                                </span>
                                <p className="text-sm text-slate-700 leading-snug">
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
                                        : "border-slate-200 bg-white text-slate-500",
                                    )}
                                  >
                                    {oi === q.correctAnswer ? (
                                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    ) : (
                                      <div className="w-3 h-3 rounded-full border border-slate-300 shrink-0" />
                                    )}
                                    {opt}
                                  </div>
                                ))}
                              </div>

                              {q.explanation && (
                                <div className="pl-7 border-l-2 border-indigo-200 ml-2">
                                  <p className="text-xs text-slate-600 leading-relaxed">
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
        <div className="flex flex-wrap gap-x-5 gap-y-1 pb-8 text-[10px] text-slate-400 font-mono">
          <span>{plan.plan_id}</span>
          <span>DB#{plan.plan_db_id}</span>
          <span>{formatDate(plan.plan_created_on)}</span>
          <span
            className={plan.is_active ? "text-emerald-600" : "text-rose-600"}
          >
            {plan.is_active ? "● Active" : "● Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;

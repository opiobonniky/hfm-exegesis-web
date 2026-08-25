import { ArrowLeft, BookOpen, Calendar, CheckCircle2, Clock, Flame, Layers, Eye, Pencil, Play, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, Ring, StatusBadge } from "./PlanDetailUI";
import { DIFFICULTY_CONFIG, CATEGORY_LABELS, normalizeDifficulty, normalizeCategory, formatDate } from "../constants";
import { routes } from "@/components/Routes/routes";
import type { ReadingPlan } from "../types";
import type { Dispatch, SetStateAction } from "react";

type Tab = "overview" | "schedule" | "quiz" | "admin";

interface PlanDetailHeaderProps {
  plan: ReadingPlan;
  isAdmin: boolean;
  isRtl: boolean;
  lang: string;
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  navigate: (delta: number) => void;
  t: any;
  pct: number;
  displayQuizAccuracy: number;
  displayAnsweredQuestions: number;
  displayCorrectAnswers: number;
  displayWrongAnswers: number;
  totalReflections: number;
  configuredDays: number;
  configuredPct: number;
  totalQuizCount: number;
}

export function PlanDetailHeader({
  plan, isAdmin, isRtl, lang, activeTab, setActiveTab, navigate, t, pct,
  displayQuizAccuracy, displayAnsweredQuestions, displayCorrectAnswers,
  displayWrongAnswers, totalReflections, configuredDays, configuredPct, totalQuizCount,
}: PlanDetailHeaderProps) {
  const diffKey = normalizeDifficulty(plan.difficulty);
  const diff = DIFFICULTY_CONFIG[diffKey] ?? DIFFICULTY_CONFIG.medium;
  const diffLabels: Record<string, string> = {
    easy: t.readingPlan.diffBeginner,
    medium: t.readingPlan.diffIntermediate,
    hard: t.readingPlan.diffAdvanced,
  };
  const diffLabel = diffLabels[diffKey] || diffKey;
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

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full bg-violet-200/40 blur-[130px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full bg-indigo-200/40 blur-[110px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm group w-fit"
          >
            <ArrowLeft className={cn("w-4 h-4 transition-transform", isRtl ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5")} />
            {t.readingPlan.backToPlans}
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge active={plan.is_active} completed={plan.is_completed} />
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", diff.bg, diff.color)}>
              <Zap className="w-3 h-3" />{diffLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-border bg-card text-muted-foreground">
              <Layers className="w-3 h-3" />{catLabel}
            </span>
            <button
              onClick={() => navigate(routes.editReadingPlan.path.replace(":planId", plan.plan_id))}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors"
            >
              <Pencil className="w-4 h-4" />{t.readingPlan.editPlan}
            </button>
            {plan.started && !isAdmin && (
              <button
                onClick={() => {
                  const nextDay = plan.completed_days_count + 1;
                  navigate(`/daily-reading?planId=${plan.plan_id}&day=${Math.min(nextDay, plan.total_days)}` as any);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-violet-600/20"
              >
                <Play className="w-4 h-4" />{t.readingPlan.continueReading}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{plan.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">{plan.description}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Calendar, label: t.readingPlan.days, value: plan.total_days, accent: "bg-sky-50", iconColor: "text-sky-600" },
            { icon: BookOpen, label: t.readingPlan.assignments, value: plan.total_assignments, accent: "bg-emerald-50", iconColor: "text-emerald-600" },
            { icon: CheckCircle2, label: t.readingPlan.completedLabel, value: `${pct}%`, accent: "bg-violet-50", iconColor: "text-violet-600" },
            { icon: Flame, label: t.readingPlan.streak, value: `${plan.user_streak ?? 0}d`, accent: "bg-orange-50", iconColor: "text-orange-600" },
            { icon: Clock, label: t.readingPlan.startedLabel, value: plan.started ? formatDate(plan.start_date, lang) : "—", accent: "bg-amber-50", iconColor: "text-amber-600" },
            { icon: Zap, label: t.readingPlan.configPct, value: `${configuredPct}%`, accent: "bg-indigo-50", iconColor: "text-indigo-600" },
          ].map(({ icon: Icon, label, value, accent, iconColor }) => (
            <GlassCard key={label} className="p-3 text-center">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2", accent)}>
                <Icon className={cn("w-4 h-4", iconColor)} />
              </div>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <Ring pct={pct} size={100} stroke={7} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">{pct}%</span>
                <span className="text-[8px] text-muted-foreground uppercase">{t.readingPlan.overallProgress}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 w-full">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t.readingPlan.quizAccuracy}</span>
                <span className="font-semibold text-foreground">{displayQuizAccuracy}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{isAdmin ? t.readingPlan.totalAnswers : t.readingPlan.answeredQuestions}</span>
                <span className="font-semibold text-foreground">{displayAnsweredQuestions}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t.readingPlan.correct}</span>
                <span className="font-semibold text-emerald-700">{displayCorrectAnswers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t.readingPlan.wrong}</span>
                <span className="font-semibold text-rose-700">{displayWrongAnswers}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex items-center gap-1 p-1 rounded-2xl border border-border bg-card w-fit shadow-sm">
          {(["overview", "schedule", "quiz", "admin"] as const).map((tab) => {
            if (tab === "admin" && !isAdmin) return null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-150",
                  activeTab === tab ? "bg-violet-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground",
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
      </div>
    </>
  );
}

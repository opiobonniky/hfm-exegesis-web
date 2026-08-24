import { FileText, HelpCircle, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, SectionLabel, Ring } from "./PlanDetailUI";
import { formatDate } from "../constants";

interface PlanOverviewTabProps {
  plan: any;
  lang: string;
  isAdmin: boolean;
  adminStats: any;
  displayQuizAccuracy: number;
  displayAnsweredQuestions: number;
  displayCorrectAnswers: number;
  displayWrongAnswers: number;
  totalReflections: number;
  configuredDays: number;
  t: any;
}
export function PlanOverviewTab({ plan, lang, isAdmin, adminStats, displayQuizAccuracy, displayAnsweredQuestions, displayCorrectAnswers, displayWrongAnswers, totalReflections, configuredDays, t }: PlanOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <GlassCard className="p-5">
        <SectionLabel>{t.readingPlan.timelineMetadata}</SectionLabel>
        {[
          { label: t.readingPlan.created, value: formatDate(plan.plan_created_on, lang) },
          { label: t.readingPlan.startDate, value: formatDate(plan.start_date, lang) },
          { label: t.readingPlan.lastActivity, value: formatDate(plan.last_completed_date, lang) },
          { label: t.readingPlan.daysSinceStarted, value: plan.days_since_started !== null ? `${plan.days_since_started}d` : t.readingPlan.notStartedLabel },
          { label: t.readingPlan.daysSinceActivity, value: plan.days_since_last_activity !== null ? `${plan.days_since_last_activity}d` : "—" },
          { label: t.readingPlan.completionDate, value: formatDate(plan.completed_date, lang) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium text-foreground">{value}</span>
          </div>
        ))}
      </GlassCard>
        <SectionLabel>{isAdmin ? t.readingPlan.aggregatePerformance : t.readingPlan.userPerformance}</SectionLabel>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative shrink-0">
            <Ring pct={displayQuizAccuracy} size={72} stroke={5} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-foreground">{displayQuizAccuracy}%</span>
              <span className="text-[7px] text-muted-foreground uppercase">{t.readingPlan.quizAccuracyLabel}</span>
            </div>
          <div className="flex-1 space-y-2">
            {[
              { label: isAdmin ? t.readingPlan.totalAnswers : t.readingPlan.answered, value: isAdmin ? displayAnsweredQuestions : `${displayAnsweredQuestions} / ${plan.total_quiz_questions}`, color: "text-foreground" },
              { label: t.readingPlan.correct, value: displayCorrectAnswers, color: "text-emerald-700" },
              { label: t.readingPlan.wrong, value: displayWrongAnswers, color: "text-rose-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-semibold", color)}>{value}</span>
              </div>
            ))}
        </div>
          { label: t.readingPlan.avgDaysPerCompletion, value: plan.avg_days_per_completion !== null ? `${plan.avg_days_per_completion}d` : "—" },
          { label: t.readingPlan.estDaysToComplete, value: plan.estimated_days_to_complete !== null ? `${plan.estimated_days_to_complete}d` : "—" },
          { label: t.readingPlan.reflectionQuestions, value: totalReflections },
          { label: t.readingPlan.configuredDays, value: `${configuredDays} / ${plan.total_days}` },
          <div key={label} className="flex justify-between py-2 border-b border-border last:border-0 text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
      <GlassCard className="p-5 lg:col-span-2">
        <SectionLabel>{t.readingPlan.adminNotes}</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { icon: FileText, title: t.readingPlan.planContent, desc: t.readingPlan.reviewContent },
            { icon: HelpCircle, title: t.readingPlan.quizQuality, desc: t.readingPlan.reviewQuizQuality },
            { icon: BarChart3, title: t.readingPlan.analyticsText, desc: t.readingPlan.reviewAnalytics },
            { icon: ShieldCheck, title: t.common.status, desc: t.readingPlan.reviewStatus },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
          ))}
    </div>
  );

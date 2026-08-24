"use client";

import { usePlanDetailPage } from "../hooks/usePlanDetailPage";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { formatDate } from "../constants";
import { PlanDetailHeader } from "../components/PlanDetailHeader";
import { PlanOverviewTab, PlanAdminTab, PlanScheduleTab, PlanQuizTab } from "../components/PlanDetailTabs";
const PlanDetail = () => {
  const h = usePlanDetailPage();
  const { toast } = useToast();
  const navigate = h.navigate;
  const { t, isRtl, lang } = { t: h.t, isRtl: h.isRtl, lang: h.lang };
  const { plan, adminStats, days, loadingPlan, userSearchTerm, setUserSearchFilter, activeTab, setActiveTab, filteredUsers, completedDayNums, totalReflections, configuredDays, allQuizDays, totalQuizCount, configuredPct, isAdmin } = h;
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
        <div className="text-center space-y-3">
          <BookOpen className="w-10 h-10 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground text-sm">{t.readingPlan.planNotFound}</p>
          <button onClick={() => navigate(-1)} className="text-violet-600 text-sm hover:underline">{t.common.goBack}</button>
  const pct = Math.round(plan.completion_percentage ?? 0);
  const displayQuizAccuracy = isAdmin && adminStats ? adminStats.globalQuizAccuracy : Math.round(plan.quiz_accuracy_percentage ?? 0);
  const displayAnsweredQuestions = isAdmin && adminStats ? adminStats.totalQuizAnswers : (plan.user_answered_questions ?? 0);
  const displayCorrectAnswers = isAdmin && adminStats ? adminStats.totalQuizCorrect : (plan.user_correct_answers ?? 0);
  const displayWrongAnswers = isAdmin && adminStats ? adminStats.totalQuizWrong : (plan.user_answered_questions ?? 0) - (plan.user_correct_answers ?? 0);
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: "'Geist', 'Inter', system-ui, sans-serif" }}>
      <PlanDetailHeader
        plan={plan} isAdmin={isAdmin} isRtl={isRtl} lang={lang} activeTab={activeTab}
        setActiveTab={setActiveTab} navigate={navigate} t={t} pct={pct}
        displayQuizAccuracy={displayQuizAccuracy} displayAnsweredQuestions={displayAnsweredQuestions}
        displayCorrectAnswers={displayCorrectAnswers} displayWrongAnswers={displayWrongAnswers}
        totalReflections={totalReflections} configuredDays={configuredDays} configuredPct={configuredPct}
        totalQuizCount={totalQuizCount}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {activeTab === "overview" && (
          <PlanOverviewTab plan={plan} lang={lang} isAdmin={isAdmin} adminStats={adminStats}
            displayQuizAccuracy={displayQuizAccuracy} displayAnsweredQuestions={displayAnsweredQuestions}
            displayCorrectAnswers={displayCorrectAnswers} displayWrongAnswers={displayWrongAnswers}
            totalReflections={totalReflections} configuredDays={configuredDays} t={t} />
        )}
        {activeTab === "admin" && isAdmin && (
          <PlanAdminTab adminStats={adminStats} filteredUsers={filteredUsers} userSearchTerm={userSearchTerm}
            setUserSearchFilter={setUserSearchFilter} plan={plan} isRtl={isRtl} lang={lang} t={t} />
        {activeTab === "schedule" && (
          <PlanScheduleTab loadingPlan={loadingPlan} days={days} completedDayNums={completedDayNums}
            questionsEnabled={plan.questions_enabled} totalDays={plan.total_days} />
        {activeTab === "quiz" && (
          <PlanQuizTab questionsEnabled={plan.questions_enabled} loadingPlan={loadingPlan}
            allQuizDays={allQuizDays} t={t} />
        {/* Footer */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 pb-8 text-[10px] text-muted-foreground/70 font-mono">
          <span>{plan.plan_id}</span>
          <span>DB#{plan.plan_db_id}</span>
          <span>{formatDate(plan.plan_created_on, lang)}</span>
          <span className={plan.is_active ? "text-emerald-600" : "text-rose-600"}>
            {plan.is_active ? `● ${t.readingPlan.activeLabel}` : `● ${t.common.inactive}`}
          </span>
    </div>
  );
};
export default PlanDetail;

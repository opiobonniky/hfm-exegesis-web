"use client";

import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { LoadingState } from "@/components/ui/LoadingState";
import { usePlanDetailPage } from "../hooks/usePlanDetailPage";
import { PlanDetailHeader } from "../components/PlanDetailHeader";
import { PlanOverviewTab } from "../components/PlanOverviewTab";
import { PlanAdminTab } from "../components/PlanAdminTab";
import { PlanScheduleTab } from "../components/PlanScheduleTab";
import { PlanQuizTab } from "../components/PlanQuizTab";
import { formatDate } from "../constants";

const PlanDetail = () => {
  const h = usePlanDetailPage();

  if (h.loadingPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message={h.t.readingPlan?.loadingPlan || "Loading plan..."} />
      </div>
    );
  }

  if (!h.plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message={h.t.readingPlan?.planNotFound || "Plan not found"} />
      </div>
    );
  }

  const pct = Math.round(h.plan.completion_percentage ?? 0);
  const displayQuizAccuracy = h.isAdmin && h.adminStats ? h.adminStats.globalQuizAccuracy : Math.round(h.plan.quiz_accuracy_percentage ?? 0);
  const displayAnsweredQuestions = h.isAdmin && h.adminStats ? h.adminStats.totalQuizAnswers : (h.plan.user_answered_questions ?? 0);
  const displayCorrectAnswers = h.isAdmin && h.adminStats ? h.adminStats.totalQuizCorrect : (h.plan.user_correct_answers ?? 0);
  const displayWrongAnswers = (displayAnsweredQuestions as number) - (displayCorrectAnswers as number);

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="View reading plan details.">
      <PageLayout isRtl={h.isRtl} accentColor="primary">
        <PlanDetailHeader
          plan={h.plan} isAdmin={h.isAdmin} isRtl={h.isRtl} lang={h.lang} activeTab={h.activeTab}
          setActiveTab={h.setActiveTab} navigate={h.navigate} t={h.t} pct={pct}
          displayQuizAccuracy={displayQuizAccuracy} displayAnsweredQuestions={displayAnsweredQuestions}
          displayCorrectAnswers={displayCorrectAnswers} displayWrongAnswers={displayWrongAnswers}
          totalReflections={h.totalReflections} configuredDays={h.configuredDays} configuredPct={h.configuredPct}
          totalQuizCount={h.totalQuizCount}
        />

        {h.activeTab === "overview" && (
          <PlanOverviewTab plan={h.plan} lang={h.lang} isAdmin={h.isAdmin} adminStats={h.adminStats}
            displayQuizAccuracy={displayQuizAccuracy} displayAnsweredQuestions={displayAnsweredQuestions}
            displayCorrectAnswers={displayCorrectAnswers} displayWrongAnswers={displayWrongAnswers}
            totalReflections={h.totalReflections} configuredDays={h.configuredDays} t={h.t} />
        )}
        {h.activeTab === "admin" && h.isAdmin && (
          <PlanAdminTab adminStats={h.adminStats} filteredUsers={h.filteredUsers} userSearchTerm={h.userSearchTerm}
            setUserSearchFilter={h.setUserSearchFilter} plan={h.plan} isRtl={h.isRtl} lang={h.lang} t={h.t} />
        )}
        {h.activeTab === "schedule" && (
          <PlanScheduleTab loadingPlan={h.loadingPlan} days={h.days} completedDayNums={h.completedDayNums}
            questionsEnabled={h.plan.questions_enabled} totalDays={h.plan.total_days} />
        )}
        {h.activeTab === "quiz" && (
          <PlanQuizTab questionsEnabled={h.plan.questions_enabled} loadingPlan={h.loadingPlan}
            allQuizDays={h.allQuizDays} t={h.t} />
        )}
      </PageLayout>
    </Gate>
  );
};

export default PlanDetail;

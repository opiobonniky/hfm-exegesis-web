"use client";

import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { usePlanDetailPage } from "../hooks/usePlanDetailPage";
import { PlanDetailHeader } from "../components/PlanDetailHeader";
import { PlanOverviewTab } from "../components/PlanOverviewTab";
import { PlanAdminTab } from "../components/PlanAdminTab";
import { PlanScheduleTab } from "../components/PlanScheduleTab";
import { PlanQuizTab } from "../components/PlanQuizTab";
import { PageLoadingState } from "../components";

const PlanDetail = () => {
  const h = usePlanDetailPage();

  if (h.loadingPlan) {
    return <PageLoadingState message={h.loadingMessage} />;
  }

  if (!h.plan) {
    return <PageLoadingState message={h.planNotFoundMessage} />;
  }


  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="View reading plan details.">
      <PageLayout isRtl={h.isRtl} accentColor="primary">
        <PlanDetailHeader
          plan={h.plan} isAdmin={h.isAdmin} isRtl={h.isRtl} lang={h.lang} activeTab={h.activeTab}
          setActiveTab={h.setActiveTab} navigate={h.navigate} t={h.t} pct={h.pct}
          displayQuizAccuracy={h.displayQuizAccuracy} displayAnsweredQuestions={h.displayAnsweredQuestions}
          displayCorrectAnswers={h.displayCorrectAnswers} displayWrongAnswers={h.displayWrongAnswers}
          totalReflections={h.totalReflections} configuredDays={h.configuredDays} configuredPct={h.configuredPct}
          totalQuizCount={h.totalQuizCount}
        />

        {h.activeTab === "overview" && (
          <PlanOverviewTab plan={h.plan} lang={h.lang} isAdmin={h.isAdmin} adminStats={h.adminStats}
            displayQuizAccuracy={h.displayQuizAccuracy} displayAnsweredQuestions={h.displayAnsweredQuestions}
            displayCorrectAnswers={h.displayCorrectAnswers} displayWrongAnswers={h.displayWrongAnswers}
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
}
;

export default PlanDetail;

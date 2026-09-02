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
  const { data, actions } = usePlanDetailPage();

  if (data.loadingPlan) {
    return <PageLoadingState message={data.loadingMessage} />;
  }

  if (!data.plan) {
    return <PageLoadingState message={data.planNotFoundMessage} />;
  }


  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="View reading plan details.">
      <PageLayout isRtl={data.isRtl} accentColor="primary">
        <PlanDetailHeader
          plan={data.plan} isAdmin={data.isAdmin} isRtl={data.isRtl} lang={data.lang} activeTab={data.activeTab}
          setActiveTab={actions.setActiveTab} navigate={data.navigate} t={data.t} pct={data.pct}
          displayQuizAccuracy={data.displayQuizAccuracy} displayAnsweredQuestions={data.displayAnsweredQuestions}
          displayCorrectAnswers={data.displayCorrectAnswers} displayWrongAnswers={data.displayWrongAnswers}
          totalReflections={data.totalReflections} configuredDays={data.configuredDays} configuredPct={data.configuredPct}
          totalQuizCount={data.totalQuizCount}
        />

        {data.activeTab === "overview" && (
          <PlanOverviewTab plan={data.plan} lang={data.lang} isAdmin={data.isAdmin} adminStats={data.adminStats}
            displayQuizAccuracy={data.displayQuizAccuracy} displayAnsweredQuestions={data.displayAnsweredQuestions}
            displayCorrectAnswers={data.displayCorrectAnswers} displayWrongAnswers={data.displayWrongAnswers}
            totalReflections={data.totalReflections} configuredDays={data.configuredDays} t={data.t} />
        )}
        {data.activeTab === "admin" && data.isAdmin && (
          <PlanAdminTab adminStats={data.adminStats} filteredUsers={data.filteredUsers} userSearchTerm={data.userSearchTerm}
            setUserSearchFilter={actions.setUserSearchFilter} plan={data.plan} isRtl={data.isRtl} lang={data.lang} t={data.t} />
        )}
        {data.activeTab === "schedule" && (
          <PlanScheduleTab loadingPlan={data.loadingPlan} days={data.days} completedDayNums={data.completedDayNums}
            questionsEnabled={data.plan.questions_enabled} totalDays={data.plan.total_days} />
        )}
        {data.activeTab === "quiz" && (
          <PlanQuizTab questionsEnabled={data.plan.questions_enabled} loadingPlan={data.loadingPlan}
            allQuizDays={data.allQuizDays} t={data.t} />
        )}
      </PageLayout>
    </Gate>
  );
};

export default PlanDetail;

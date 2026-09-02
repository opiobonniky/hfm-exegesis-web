

import { Shield } from "lucide-react";
import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatChips } from "@/components/StatChips";
import { TabBar } from "@/components/TabBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { routes } from "@/components/Routes/routes";
import { useBibleReadingPlanPage } from "../hooks/useBibleReadingPlanPage";
import { ReadingPlanProgressTab } from "../components/ReadingPlanProgressTab";
import { ReadingPlanBrowseTab } from "../components/ReadingPlanBrowseTab";
import { StartPlanModal, RemovePlanModal } from "../components/PlanModals";

const BibleReadingPlan = () => {
  const { data, actions } = useBibleReadingPlanPage();

  const stats = {
    total: data.plans.length,
    active: data.activePlans.length,
    withQuiz: data.plans.filter((p) => p.questionsEnabled).length,
  };

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Track your daily Bible reading progress with personalized reading plans.">
      <PageLayout isRtl={data.isRtl} accentColor="teal">
        <PageHeader
          icon={<Shield className="h-5 w-5 text-teal-700" />}
          iconBg="bg-teal-100"
          title={data.t.readingPlan?.readingPlans || "Reading Plans"}
          subtitle={data.t.readingPlan?.buildHabit || "Build a daily Bible habit"}
        />

        <StatChips
          items={[
            { label: data.t.readingPlan?.totalPlans || "Total Plans", value: stats.total, color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-800/40" },
            { label: data.t.readingPlan?.activeLabel || "Active", value: stats.active, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40" },
            { label: data.t.readingPlan?.quizEnabled || "Quiz Enabled", value: stats.withQuiz, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-800/40" },
          ]}
        />

        <TabBar
          tabs={[
            { key: "progress", label: data.t.readingPlan?.tabProgress || "My Progress", badge: data.activePlans.length > 0 ? data.activePlans.length : undefined },
            { key: "browse", label: data.t.readingPlan?.browsePlans || "Browse Plans" },
          ]}
          active={data.activeTab}
          onTabChange={(key) => actions.setActiveTab(key as "progress" | "browse")}
          accentColor="teal"
        />

        {data.loading ? (
          <LoadingState />
        ) : data.activeTab === "progress" ? (
          <ReadingPlanProgressTab
            myPlans={data.myPlans}
            progressMap={data.progressMap}
            getCompletedDays={actions.getCompletedDays}
            navigate={data.navigate}
            setActiveTab={actions.setActiveTab}
            setPlanToRemove={actions.setPlanToRemove}
            setRemovePlanModalVisible={actions.setRemovePlanModalVisible}
            isRtl={data.isRtl}
            routes={routes}
          />
        ) : (
          <ReadingPlanBrowseTab
            plans={data.plans}
            activePlans={data.activePlans}
            userProgress={data.userProgress}
            getCompletedDays={actions.getCompletedDays}
            navigate={data.navigate}
            setPendingPlan={actions.setPendingPlan}
            setStartPlanModalVisible={actions.setStartPlanModalVisible}
            isRtl={data.isRtl}
            routes={routes}
          />
        )}

        <StartPlanModal
          visible={data.startPlanModalVisible}
          plan={data.pendingPlan}
          onStart={(p) => { actions.setStartPlanModalVisible(false); actions.setPendingPlan(null); actions.startPlan(p); }}
          onClose={() => { actions.setStartPlanModalVisible(false); actions.setPendingPlan(null); }}
        />
        <RemovePlanModal
          visible={data.removePlanModalVisible}
          plan={data.planToRemove}
          onRemove={(p) => { actions.setRemovePlanModalVisible(false); actions.setPlanToRemove(null); actions.removePlan(p); }}
          onClose={() => { actions.setRemovePlanModalVisible(false); actions.setPlanToRemove(null); }}
        />
      </PageLayout>
    </Gate>
  );
};

export default BibleReadingPlan;

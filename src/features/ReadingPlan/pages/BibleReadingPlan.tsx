

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

export default function BibleReadingPlan() {
  const { data, actions } = useBibleReadingPlanPage();

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
          items={data.statItems}
        />

        <TabBar
          tabs={data.tabs}
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
}

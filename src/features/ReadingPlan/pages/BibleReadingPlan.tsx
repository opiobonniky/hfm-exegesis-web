"use client";

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
  const h = useBibleReadingPlanPage();

  const stats = {
    total: h.plans.length,
    active: h.activePlans.length,
    withQuiz: h.plans.filter((p) => p.questionsEnabled).length,
  };

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Track your daily Bible reading progress with personalized reading plans.">
      <PageLayout isRtl={h.isRtl} accentColor="teal">
        <PageHeader
          icon={<Shield className="h-5 w-5 text-teal-700" />}
          iconBg="bg-teal-100"
          title={h.t.readingPlan?.readingPlans || "Reading Plans"}
          subtitle={h.t.readingPlan?.buildHabit || "Build a daily Bible habit"}
        />

        <StatChips
          items={[
            { label: h.t.readingPlan?.totalPlans || "Total Plans", value: stats.total, color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-800/40" },
            { label: h.t.readingPlan?.activeLabel || "Active", value: stats.active, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40" },
            { label: h.t.readingPlan?.quizEnabled || "Quiz Enabled", value: stats.withQuiz, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-800/40" },
          ]}
        />

        <TabBar
          tabs={[
            { key: "progress", label: h.t.readingPlan?.tabProgress || "My Progress", badge: h.activePlans.length > 0 ? h.activePlans.length : undefined },
            { key: "browse", label: h.t.readingPlan?.browsePlans || "Browse Plans" },
          ]}
          active={h.activeTab}
          onTabChange={(key) => h.setActiveTab(key as "progress" | "browse")}
          accentColor="teal"
        />

        {h.loading ? (
          <LoadingState />
        ) : h.activeTab === "progress" ? (
          <ReadingPlanProgressTab
            myPlans={h.myPlans}
            progressMap={h.progressMap}
            getCompletedDays={h.getCompletedDays}
            navigate={h.navigate}
            setActiveTab={h.setActiveTab}
            setPlanToRemove={h.setPlanToRemove}
            setRemovePlanModalVisible={h.setRemovePlanModalVisible}
            isRtl={h.isRtl}
            routes={routes}
          />
        ) : (
          <ReadingPlanBrowseTab
            plans={h.plans}
            activePlans={h.activePlans}
            userProgress={h.userProgress}
            getCompletedDays={h.getCompletedDays}
            navigate={h.navigate}
            setPendingPlan={h.setPendingPlan}
            setStartPlanModalVisible={h.setStartPlanModalVisible}
            isRtl={h.isRtl}
            routes={routes}
          />
        )}

        <StartPlanModal
          visible={h.startPlanModalVisible}
          plan={h.pendingPlan}
          onStart={(p) => { h.setStartPlanModalVisible(false); h.setPendingPlan(null); h.startPlan(p); }}
          onClose={() => { h.setStartPlanModalVisible(false); h.setPendingPlan(null); }}
        />
        <RemovePlanModal
          visible={h.removePlanModalVisible}
          plan={h.planToRemove}
          onRemove={(p) => { h.setRemovePlanModalVisible(false); h.setPlanToRemove(null); h.removePlan(p); }}
          onClose={() => { h.setRemovePlanModalVisible(false); h.setPlanToRemove(null); }}
        />
      </PageLayout>
    </Gate>
  );
};

export default BibleReadingPlan;

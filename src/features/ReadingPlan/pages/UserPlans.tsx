import { BookOpen } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { TabBar } from "@/components/TabBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { useUserPlansPage } from "@/features/ReadingPlan";
import UserProgressTab from "../components/UserProgressTab";
import UserBrowseTab from "../components/UserBrowseTab";
import RemovePlanModal from "../components/RemovePlanModal";

export default function UserPlans() {
  const { data, actions } = useUserPlansPage();

  return (
    <PageLayout isRtl={data.isRtl} accentColor="teal">
      <PageHeader
        icon={<BookOpen className="h-5 w-5 text-teal-700" />}
        iconBg="bg-teal-100"
        title={data.t.readingPlan?.readingPlans || "My Reading Plans"}
        subtitle={data.t.readingPlan?.bibleReadingPlan || "Build a daily Bible habit"}
      />

      <TabBar
        tabs={[
          { key: "progress", label: data.t.readingPlan?.progress || "My Progress", badge: data.inProgressCount > 0 ? data.inProgressCount : undefined },
          { key: "browse", label: data.t.readingPlan?.browse || "Browse Plans" },
        ]}
        active={data.activeTab}
        onTabChange={(key) => actions.setActiveTab(key as "progress" | "browse")}
        accentColor="teal"
      />

      {data.loading ? (
        <LoadingState />
      ) : data.activeTab === "progress" ? (
        <UserProgressTab
          userPlans={data.userPlans}
          t={data.t}
          onContinue={(planId) => data.navigate(`/reading-plan/${planId}`)}
          onRemove={actions.setRemoveModal}
          onBrowse={() => actions.setActiveTab("browse")}
        />
      ) : (
        <UserBrowseTab
          plans={data.filteredPlans}
          userPlans={data.userPlans}
          loading={data.loading}
          catFilter={data.catFilter}
          t={data.t}
          onCatFilter={actions.setCatFilter}
          onStartPlan={actions.startPlan}
          onViewDetail={(planId) => data.navigate(`/reading-plan/${planId}`)}
        />
      )}

      <RemovePlanModal
        open={!!data.removeModal}
        t={data.t}
        onConfirm={() => data.removeModal && actions.removePlan(data.removeModal)}
        onCancel={() => actions.setRemoveModal(null)}
      />
    </PageLayout>
  );
}

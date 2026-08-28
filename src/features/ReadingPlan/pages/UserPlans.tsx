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
  const h = useUserPlansPage();
  const {
    t, isRtl, navigate, activeTab, setActiveTab,
    userPlans, loading, catFilter, setCatFilter,
    removeModal, setRemoveModal, startPlan, removePlan, filteredPlans,
  } = h;

  const inProgressCount = userPlans.filter((p) => !p.isCompleted).length;

  return (
    <PageLayout isRtl={isRtl} accentColor="teal">
      <PageHeader
        icon={<BookOpen className="h-5 w-5 text-teal-700" />}
        iconBg="bg-teal-100"
        title={t.readingPlan?.readingPlans || "My Reading Plans"}
        subtitle={t.readingPlan?.bibleReadingPlan || "Build a daily Bible habit"}
      />

      <TabBar
        tabs={[
          { key: "progress", label: t.readingPlan?.progress || "My Progress", badge: inProgressCount > 0 ? inProgressCount : undefined },
          { key: "browse", label: t.readingPlan?.browse || "Browse Plans" },
        ]}
        active={activeTab}
        onTabChange={(key) => setActiveTab(key as "progress" | "browse")}
        accentColor="teal"
      />

      {loading ? (
        <LoadingState />
      ) : activeTab === "progress" ? (
        <UserProgressTab
          userPlans={userPlans}
          t={t}
          onContinue={(planId) => navigate(`/reading-plan/${planId}`)}
          onRemove={setRemoveModal}
          onBrowse={() => setActiveTab("browse")}
        />
      ) : (
        <UserBrowseTab
          plans={filteredPlans}
          userPlans={userPlans}
          loading={loading}
          catFilter={catFilter}
          t={t}
          onCatFilter={setCatFilter}
          onStartPlan={startPlan}
          onViewDetail={(planId) => navigate(`/reading-plan/${planId}`)}
        />
      )}

      <RemovePlanModal
        open={!!removeModal}
        t={t}
        onConfirm={() => removePlan(removeModal!)}
        onCancel={() => setRemoveModal(null)}
      />
    </PageLayout>
  );
}

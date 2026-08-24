import { BookOpen, TrendingUp, LayoutList, Loader2 } from "lucide-react";
import { useUserPlansPage } from "../hooks/useUserPlansPage";
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
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-gradient-to-b from-teal-50/50 dark:from-teal-950/20 to-background p-6 lg:p-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.readingPlan?.readingPlans || "My Reading Plans"}</h1>
            <p className="text-sm text-muted-foreground">{t.readingPlan?.bibleReadingPlan || "Build a daily Bible habit"}</p>
          </div>
        </div>

        <div className="flex border-b border-border">
          <button onClick={() => setActiveTab("progress")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === "progress" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <TrendingUp className="w-4 h-4" />
            {t.readingPlan?.progress || "My Progress"}
            {inProgressCount > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">{inProgressCount}</span>
            )}
          </button>
          <button onClick={() => setActiveTab("browse")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === "browse" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <LayoutList className="w-4 h-4" />
            {t.readingPlan?.browse || "Browse Plans"}
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8 pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeTab === "progress" ? (
          <UserProgressTab userPlans={userPlans} t={t}
            onContinue={(planId) => navigate(`/reading-plan/${planId}`)}
            onRemove={setRemoveModal}
            onBrowse={() => setActiveTab("browse")} />
        ) : (
          <UserBrowseTab plans={filteredPlans} userPlans={userPlans} loading={loading}
            catFilter={catFilter} t={t} onCatFilter={setCatFilter}
            onStartPlan={startPlan}
            onViewDetail={(planId) => navigate(`/reading-plan/${planId}`)} />
        )}
      </div>

      <RemovePlanModal open={!!removeModal} t={t}
        onConfirm={() => removePlan(removeModal!)}
        onCancel={() => setRemoveModal(null)} />
    </div>
  );
}

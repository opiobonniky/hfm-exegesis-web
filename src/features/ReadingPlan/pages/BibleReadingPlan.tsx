"use client";

import { Shield, Loader2, TrendingUp, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Gate } from "@/components/Gate";
import { routes } from "@/components/Routes/routes";
import { useBibleReadingPlanPage } from "../hooks/useBibleReadingPlanPage";
import { ReadingPlanProgressTab } from "../components/ReadingPlanProgressTab";
import { ReadingPlanBrowseTab } from "../components/ReadingPlanBrowseTab";
import { StartPlanModal, RemovePlanModal } from "../components/PlanModals";
const BibleReadingPlan = () => {
  const h = useBibleReadingPlanPage();
  const { t, isRtl, navigate } = h;
  const { loading, activeTab, setActiveTab, plans, myPlans, activePlans, progressMap, userProgress, getCompletedDays,
    startPlan, removePlan, startPlanModalVisible, setStartPlanModalVisible, pendingPlan, setPendingPlan,
    removePlanModalVisible, setRemovePlanModalVisible, planToRemove, setPlanToRemove } = h;
  const stats = { total: plans.length, active: activePlans.length, withQuiz: plans.filter((p) => p.questionsEnabled).length };
  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Track your daily Bible reading progress with personalized reading plans.">
      <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
        <div className={cn("h-1", isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r", "from-teal-400 via-emerald-400 to-cyan-400")} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-7">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center shadow-sm">
                <Shield className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  {t.readingPlan?.readingPlans || "Reading Plans"}
                </h1>
                <p className="text-muted-foreground/70 text-xs mt-0.5 font-medium">{t.readingPlan?.buildHabit || "Build a daily Bible habit"}</p>
            </div>
          </div>
          {/* Stat chips */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t.readingPlan?.totalPlans || "Total Plans", value: stats.total, color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-800/40" },
              { label: t.readingPlan?.activeLabel || "Active", value: stats.active, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40" },
              { label: t.readingPlan?.quizEnabled || "Quiz Enabled", value: stats.withQuiz, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-800/40" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-2xl border p-4 text-center", s.bg)}>
                <p className={cn("text-2xl font-bold", s.color)} style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-semibold">{s.label}</p>
            ))}
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button onClick={() => setActiveTab("progress")} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors", activeTab === "progress" ? "border-teal-500 text-teal-700" : "border-transparent text-muted-foreground hover:text-foreground/80")}>
              <TrendingUp className="w-4 h-4" />{t.readingPlan?.tabProgress || "My Progress"}
              {activePlans.length > 0 && <span className={cn(isRtl ? "mr-1" : "ml-1", "bg-teal-100 text-teal-700 text-xs rounded-full px-1.5 py-0.5")}>{activePlans.length}</span>}
            </button>
            <button onClick={() => setActiveTab("browse")} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors", activeTab === "browse" ? "border-teal-500 text-teal-700" : "border-transparent text-muted-foreground hover:text-foreground/80")}>
              <LayoutList className="w-4 h-4" />{t.readingPlan?.browsePlans || "Browse Plans"}
          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
          ) : activeTab === "progress" ? (
            <ReadingPlanProgressTab
              myPlans={myPlans} progressMap={progressMap} getCompletedDays={getCompletedDays}
              navigate={navigate} setActiveTab={setActiveTab} setPlanToRemove={setPlanToRemove}
              setRemovePlanModalVisible={setRemovePlanModalVisible} isRtl={isRtl} routes={routes}
            />
          ) : (
            <ReadingPlanBrowseTab
              plans={plans} activePlans={activePlans} userProgress={userProgress}
              getCompletedDays={getCompletedDays} navigate={navigate} setPendingPlan={setPendingPlan}
              setStartPlanModalVisible={setStartPlanModalVisible} isRtl={isRtl} routes={routes}
          )}
        </div>
        <StartPlanModal visible={startPlanModalVisible} plan={pendingPlan} onStart={(p) => { setStartPlanModalVisible(false); setPendingPlan(null); startPlan(p); }} onClose={() => { setStartPlanModalVisible(false); setPendingPlan(null); }} />
        <RemovePlanModal visible={removePlanModalVisible} plan={planToRemove} onRemove={(p) => { setRemovePlanModalVisible(false); setPlanToRemove(null); removePlan(p); }} onClose={() => { setRemovePlanModalVisible(false); setPlanToRemove(null); }} />
      </div>
    </Gate>
  );
};
export default BibleReadingPlan;

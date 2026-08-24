import { BookOpen, Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { ActivePlanCard } from "./ActivePlanCard";
import type { ReadingPlan } from "../types";

interface Props {
  myPlans: ReadingPlan[];
  progressMap: Record<string, any>;
  getCompletedDays: (pr: any) => number[];
  navigate: (path: string) => void;
  setActiveTab: (tab: string) => void;
  setPlanToRemove: (p: ReadingPlan | null) => void;
  setRemovePlanModalVisible: (v: boolean) => void;
  isRtl: boolean;
  routes: any;
}
export function ReadingPlanProgressTab({
  myPlans, progressMap, getCompletedDays, navigate, setActiveTab,
  setPlanToRemove, setRemovePlanModalVisible, isRtl, routes,
}: Props) {
  const { t } = useLanguage();
  if (!myPlans.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{t.readingPlan?.noActivePlan || "No active plan yet"}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-xs">
          {t.readingPlan?.startPlanDesc || "Head over to Browse Plans and start your first reading plan."}
        </p>
        <button onClick={() => setActiveTab("browse")} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-all">
          {t.readingPlan?.browsePlans || "Browse Plans"}<ChevronRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
        </button>
      </div>
    );
  }
  const inProgress = myPlans.filter((p) => !progressMap[p.planId]?.isCompleted);
  const completed = myPlans.filter((p) => progressMap[p.planId]?.isCompleted);
  const makeHandlers = (plan: ReadingPlan) => {
    const pr = progressMap[plan.planId];
    const done = pr ? getCompletedDays(pr) : [];
    const pct = Math.round((done.length / (plan.totalDays || plan.total_days || 1)) * 100);
    const streak = pr?.streak || 0;
    const nextDay = done.length > 0 ? Math.min(Math.max(...done) + 1, plan.totalDays || plan.total_days) : 1;
    const lastDay = done.length > 0 ? Math.max(...done) : null;
    const isCompleted = !!progressMap[plan.planId]?.isCompleted;
    return { pct, done: done.length, streak, nextDay, lastDay, isCompleted,
      onRead: () => navigate(routes.dailyReading.path.replace(":planId", plan.planId).replace(":day", String(isCompleted ? "1" : nextDay))),
      onSummary: () => navigate(routes.readingPlanDetail.path.replace(":planId", plan.planId)),
      onRemove: () => { setPlanToRemove(plan); setRemovePlanModalVisible(true); },
    };
  };
  return (
    <div className="space-y-6">
      {inProgress.map((plan) => (
        <ActivePlanCard key={plan.planId} plan={plan} {...makeHandlers(plan)} />
      ))}
      {completed.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-4">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-muted-foreground">{t.readingPlan?.completedPlans || "Completed Plans"}</span>
          </div>
          {completed.map((plan) => (
            <ActivePlanCard key={plan.planId} plan={plan} {...makeHandlers(plan)} />
          ))}
        </>
      )}
    </div>
  );

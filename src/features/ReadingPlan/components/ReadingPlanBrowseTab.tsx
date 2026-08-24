import { useLanguage } from "@/components/languages/languageProvider";
import { BrowsePlanCard } from "./BrowsePlanCard";
import type { ReadingPlan } from "../types";

interface Props {
  plans: ReadingPlan[];
  activePlans: ReadingPlan[];
  userProgress: any[];
  getCompletedDays: (pr: any) => number[];
  navigate: (path: string) => void;
  setPendingPlan: (p: ReadingPlan | null) => void;
  setStartPlanModalVisible: (v: boolean) => void;
  isRtl: boolean;
  routes: any;
}
export function ReadingPlanBrowseTab({
  plans, activePlans, userProgress, getCompletedDays, navigate,
  setPendingPlan, setStartPlanModalVisible, isRtl, routes,
}: Props) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        {t.readingPlan?.choosePlan || "Choose a plan that fits your spiritual journey"}
      </p>
      {plans.map((plan) => {
        const pr = userProgress.find((p: any) => p.planId === plan.planId);
        const hasStarted = !!pr;
        const isCompleted = pr?.isCompleted || false;
        const isActive = activePlans.some((p) => p.planId === plan.planId);
        const done = pr ? getCompletedDays(pr) : [];
        const pct = hasStarted ? Math.round((done.length / (plan.totalDays || plan.total_days || 1)) * 100) : 0;
        return (
          <BrowsePlanCard
            key={plan.planId} plan={plan} isActive={isActive} hasStarted={hasStarted}
            isCompleted={isCompleted} done={done.length} pct={pct}
            onPress={() => {
              if (hasStarted) {
                navigate(routes.readingPlanDetail.path.replace(":planId", plan.planId));
              } else {
                setPendingPlan(plan);
                setStartPlanModalVisible(true);
              }
            }}
          />
        );
      })}
    </div>
  );

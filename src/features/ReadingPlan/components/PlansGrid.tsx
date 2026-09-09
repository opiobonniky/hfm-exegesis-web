// PlansGrid — renders reading plan cards from plans array
import { ReadingPlanCard } from "./ReadingPlanCard";
import type { ReadingPlanListItem } from "../types";

interface PlansGridProps {
  plans: ReadingPlanListItem[];
  isRtl: boolean;
  t: any;
  onPress: (planId: string) => void;
  onDelete: (plan: ReadingPlanListItem) => void;
}

export function PlansGrid({ plans, isRtl, t, onPress, onDelete }: PlansGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <ReadingPlanCard
          key={plan.planId}
          plan={plan}
          isRtl={isRtl}
          t={t}
          onPress={() => onPress(plan.planId)}
          onDelete={() => onDelete(plan)}
        />
      ))}
    </div>
  );
}

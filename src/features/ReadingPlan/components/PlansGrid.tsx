// PlansGrid — renders reading plan cards from plans array
import { ReadingPlanCard } from "./ReadingPlanCard";

interface Plan {
  planId: string;
  [key: string]: unknown;
}

interface PlansGridProps {
  plans: Plan[];
  isRtl: boolean;
  t: Record<string, unknown>;
  onPress: (planId: string) => void;
}

export function PlansGrid({ plans, isRtl, t, onPress }: PlansGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <ReadingPlanCard
          key={plan.planId}
          plan={plan}
          isRtl={isRtl}
          t={t}
          onPress={() => onPress(plan.planId)}
        />
      ))}
    </div>
  );
}

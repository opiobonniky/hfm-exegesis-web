// ReadingPlanGrid — responsive grid of reading plan cards with infinite scroll
import { RefObject } from "react";
import { Loader2 } from "lucide-react";
import { ReadingPlanCard } from "./ReadingPlanCard";
import type { ReadingPlan } from "../hooks/useAdminReadingPlans";

interface ReadingPlanGridProps {
  plans: ReadingPlan[];
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onEdit: (plan: ReadingPlan) => void;
  onDelete: (plan: ReadingPlan) => void;
  onView: (plan: ReadingPlan) => void;
}

export function ReadingPlanGrid({
  plans,
  loadingMore,
  hasMore,
  sentinelRef,
  onEdit,
  onDelete,
  onView,
}: ReadingPlanGridProps) {
  return (
    <>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <ReadingPlanCard
            key={plan.id}
            plan={plan}
            onEdit={() => onEdit(plan)}
            onDelete={() => onDelete(plan)}
            onView={() => onView(plan)}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!hasMore && plans.length > 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-4">
          All items loaded
        </p>
      )}
    </>
  );
}

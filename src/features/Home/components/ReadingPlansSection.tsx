"use client";

import { cn } from "@/lib/utils";
import type { UserDashboardPlan } from "../types";
interface ReadingPlansSectionProps {
  plans: UserDashboardPlan[];
  onSeeAll?: () => void;
  onPressPlan?: (plan: UserDashboardPlan) => void;
}
export default function ReadingPlansSection({ plans, onSeeAll, onPressPlan }: ReadingPlansSectionProps) {
  if (plans.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.12em]">Reading Plans</h2>
        {onSeeAll && (
          <button onClick={onSeeAll} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            See all
          </button>
        )}
      </div>
      <div className="space-y-3">
        {plans.map((plan, idx) => {
          const pct = plan.totalDays > 0 ? Math.round((plan.completedDays / plan.totalDays) * 100) : 0;
          return (
            <button
              key={plan.id || idx}
              onClick={() => onPressPlan?.(plan)}
              className="w-full text-start p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-foreground truncate">{plan.planName || plan.description || "Reading Plan"}</p>
                <span className="text-xs font-bold text-primary">{pct}%</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              <p className="text-[11px] text-muted-foreground/60 mt-1.5">{plan.completedDays}/{plan.totalDays} days</p>
              </div>
            </button>
          );
        })}
            </div>
    </section>
  )}

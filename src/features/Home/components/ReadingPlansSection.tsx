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
              key={plan.planId || idx}
              onClick={() => onPressPlan?.(plan)}
              className="w-full rounded-2xl border border-primary/10 bg-gradient-to-br from-white to-primary/[0.06] p-4 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md dark:from-card dark:to-primary/[0.1]"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-foreground truncate">{plan.planName || plan.description || "Reading Plan"}</p>
                <span className="text-xs font-bold text-primary">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-1.5">{plan.completedDays}/{plan.totalDays} days</p>
            </button>
          );
        })}
            </div>
    </section>
  )}

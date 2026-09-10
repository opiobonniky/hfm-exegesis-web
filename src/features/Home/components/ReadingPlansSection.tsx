"use client";

import { ArrowRight } from "lucide-react";
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
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#946b30] dark:text-[#d9b879]">Keep the rhythm</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#173346] dark:text-[#f5f0e5]">Your reading plans</h2>
        </div>
        {onSeeAll && (
          <button onClick={onSeeAll} className="rounded-full px-3 py-2 text-xs font-semibold text-[#173346] transition-colors hover:bg-[#e8e1d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-[#f5f0e5] dark:hover:bg-white/10">
            See all
          </button>
        )}
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#d8d2c4] bg-[#faf8f2] dark:border-white/10 dark:bg-[#111b24]">
        {plans.map((plan, idx) => {
          const pct = plan.totalDays > 0 ? Math.round((plan.completedDays / plan.totalDays) * 100) : 0;
          return (
            <button
              key={plan.planId || idx}
              onClick={() => onPressPlan?.(plan)}
              className="group w-full border-b border-[#e2ddd2] p-5 text-start transition-colors last:border-b-0 hover:bg-[#f0ece2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary dark:border-white/10 dark:hover:bg-white/5"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{plan.planName || plan.description || "Reading Plan"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Day {plan.completedDays} of {plan.totalDays}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-serif text-xl font-semibold text-[#946b30] dark:text-[#d9b879]">{pct}%</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-[#dfd9cc] dark:bg-white/10">
                <div className="h-full rounded-full bg-[#b88a44] transition-all" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  )}

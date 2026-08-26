import { BookOpen, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/components/Routes/routes";
import { CATEGORY_KEYS, DIFFICULTY_KEYS } from "../constants";
import type { UserPlanReadingPlan, UserPlan } from "../hooks/useUserPlansPage";

interface Props {
  plans: UserPlanReadingPlan[];
  userPlans: UserPlan[];
  loading: boolean;
  catFilter: string;
  t: any;
  onCatFilter: (cat: string) => void;
  onStartPlan: (planId: string) => void;
  onViewDetail: (planId: string) => void;
}

function getProgressPercentage(completed: number, total: number) {
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export default function UserBrowseTab({
  plans, userPlans, loading, catFilter, t, onCatFilter, onStartPlan, onViewDetail,
}: Props) {
  const catLabel = (cat: string) => t.readingPlan?.[CATEGORY_KEYS[cat]] || cat;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(CATEGORY_KEYS).map(([value, key]) => (
          <button
            key={value}
            onClick={() => onCatFilter(value)}
            className={`min-h-[44px] px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors active:scale-[0.97] [touch-action:manipulation] ${
              catFilter === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t.readingPlan?.[key] || key}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-teal-200 dark:border-teal-800/50 bg-teal-50/50 dark:bg-teal-950/20">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-teal-400 dark:text-teal-500" />
            <h3 className="text-xl font-semibold mb-2">No plans found</h3>
            <p className="text-muted-foreground">Check back later for new reading plans.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const userPlan = userPlans.find((up) => up.planId === plan.planId);
            const hasStarted = !!userPlan;
            const isCompleted = userPlan?.isCompleted || false;
            const isActive = hasStarted && !isCompleted;
            const pct = userPlan ? getProgressPercentage(userPlan.completedDays, plan.totalDays) : 0;

            return (
              <Card key={plan.planId} className={`overflow-hidden ${isActive ? "border-primary/50" : isCompleted ? "border-emerald-500/50" : ""}`}>
                {(isActive || isCompleted) && (
                  <div className={`h-1 ${isCompleted ? "bg-emerald-500" : "bg-primary"}`} />
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{plan.title}</CardTitle>
                        {isCompleted && <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full">Done</span>}
                        {isActive && <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">Active</span>}
                      </div>
                      <CardDescription className="mt-1 line-clamp-2">{plan.description}</CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 bg-muted rounded-lg font-medium border">{t.readingPlan?.[DIFFICULTY_KEYS[plan.difficulty]] || plan.difficulty}</span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-lg font-medium">{catLabel(plan.category)}</span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-lg font-medium">{plan.totalDays} days</span>
                    {plan.questionsEnabled && <span className="text-xs px-2 py-1 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-lg font-medium">Q&A</span>}
                  </div>
                  {hasStarted && userPlan && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{userPlan.completedDays}/{plan.totalDays} · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {hasStarted ? (
                      <Button className="flex-1" onClick={() => onViewDetail(plan.planId)}>
                        {isCompleted ? "View Summary" : "Continue Reading"}<ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button className="flex-1" onClick={() => onStartPlan(plan.planId)} disabled={!plan.isActive}>Start Plan</Button>
                    )}
                    <Button variant="outline" onClick={() => onViewDetail(plan.planId)}>Details</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
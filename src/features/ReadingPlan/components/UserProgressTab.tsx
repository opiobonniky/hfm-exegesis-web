import { BookOpen, ChevronRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserPlanCard from "./UserPlanCard";
import CompletedPlanCard from "./CompletedPlanCard";
import type { UserPlan } from "../hooks/useUserPlansPage";

interface Props {
  userPlans: UserPlan[];
  t: any;
  onContinue: (planId: string) => void;
  onRemove: (planId: string) => void;
  onBrowse: () => void;
}

export default function UserProgressTab({ userPlans, t, onContinue, onRemove, onBrowse }: Props) {
  const inProgress = userPlans.filter((p) => !p.isCompleted);
  const completed = userPlans.filter((p) => p.isCompleted);

  if (userPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No active plan yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-xs">
          Head over to Browse Plans and start your first reading plan.
        </p>
        <Button onClick={onBrowse}>
          Browse Plans <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {inProgress.length > 0 && (
        <div className="space-y-4">
          {inProgress.map((plan) => (
            <UserPlanCard key={plan.planId} plan={plan} t={t} onContinue={onContinue} onRemove={onRemove} />
          ))}
        </div>
      )}
      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-muted-foreground">Completed Plans</h3>
          </div>
          <div className="space-y-4">
            {completed.map((plan) => (
              <CompletedPlanCard key={plan.planId} plan={plan} t={t} onView={onContinue} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
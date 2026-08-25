import { Play, Trash2, Flame, CheckCircle2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/components/Routes/routes";
import type { UserPlanItem } from "../types";

interface Props {
  plan: UserPlanItem;
  t: any;
  onContinue: (planId: string) => void;
  onRemove: (planId: string) => void;
}

export default function UserPlanCard({ plan, t, onContinue, onRemove }: Props) {
  const pct = plan.totalDays === 0 ? 0 : Math.round((plan.completedDays / plan.totalDays) * 100);
  const nextDay = plan.completedDays + 1;

  return (
    <Card className="border-l-4 border-l-primary overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{plan.planName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.completedDays} of {plan.totalDays} days done
            </p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/20" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${pct * 1.76} 176`} className="text-primary" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground text-center">{pct}% complete</p>

        <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded-lg p-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Flame className="w-4 h-4" /><span className="font-bold">{plan.streak}d</span>
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="text-center border-l border-border">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
              <CheckCircle2 className="w-4 h-4" /><span className="font-bold">{plan.completedDays}</span>
            </div>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="text-center border-l border-border">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <BookOpen className="w-4 h-4" /><span className="font-bold">Day {Math.min(nextDay, plan.totalDays)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Next</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => onContinue(plan.planId)}>
            <Play className="w-4 h-4 mr-2" />
            {plan.completedDays === 0 ? "Begin Day 1" : `Continue · Day ${nextDay}`}
          </Button>
          <Button variant="outline" size="icon" onClick={() => onRemove(plan.planId)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
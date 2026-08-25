import { Eye, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/components/Routes/routes";
import type { UserPlanItem } from "../types";

interface Props {
  plan: UserPlanItem;
  t: any;
  onView: (planId: string) => void;
}

export default function CompletedPlanCard({ plan, t, onView }: Props) {
  return (
    <Card className="border-l-4 border-l-emerald-500 dark:border-l-emerald-600 overflow-hidden opacity-80">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{plan.planName}</CardTitle>
              <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">Done</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{plan.totalDays} days completed</p>
          </div>
          <div className="w-14 h-14 relative">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-emerald-200 dark:text-emerald-900" />
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="150.8" className="text-emerald-500 dark:text-emerald-400" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400">100%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => onView(plan.planId)}>
          <Eye className="w-4 h-4 mr-2" />Summary
        </Button>
        <Button variant="outline" className="flex-1">
          <Trophy className="w-4 h-4 mr-2" />Revisit
        </Button>
      </CardContent>
    </Card>
  );
}
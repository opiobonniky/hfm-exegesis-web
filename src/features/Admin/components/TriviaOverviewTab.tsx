// Admin trivia overview tab — stat cards + difficulty breakdown
import { Sparkles, BarChart3, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TriviaStatCard, difficultyColor } from "./index";
import type { useAdminTrivia } from "../hooks/useAdminTrivia";

export function TriviaOverviewTab({ h }: { h: ReturnType<typeof useAdminTrivia> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <TriviaStatCard label="Total Participants" value={h.overviewStats?.totalParticipants ?? "—"} icon={Users} color="bg-primary/10 text-primary" />
        <TriviaStatCard label="Total Answers" value={h.overviewStats?.totalAnswers ?? "—"} icon={BarChart3} color="bg-violet-500/10 text-violet-600" />
        <TriviaStatCard label="Avg Score" value={h.overviewStats ? `${h.overviewStats.averageScore}%` : "—"} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" />
        <TriviaStatCard label="Today's Answers" value={h.overviewStats?.todayAnswers ?? "—"} icon={Sparkles} color="bg-amber-500/10 text-amber-600" />
        <TriviaStatCard label="Daily Active" value={h.overviewStats?.dailyActiveParticipants ?? "—"} icon={Users} color="bg-sky-500/10 text-sky-600" />
      </div>
      {h.overviewStats?.difficultyBreakdown && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-sm font-bold">Difficulty Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(h.overviewStats.difficultyBreakdown).map(([diff, stats]) => (
                <div key={diff} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                  <Badge variant="outline" className={cn("mb-2", difficultyColor(diff))}>{diff}</Badge>
                  {["Answered", "Correct", "Rate"].map(label => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={cn("font-medium", label === "Correct" && "text-emerald-600")}>
                        {label === "Answered" ? stats.total : label === "Correct" ? stats.correct : `${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%`}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

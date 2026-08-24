import { Card, CardContent } from "@/components/ui/card";
import { StatBox } from "@/components/ui/StatBox";
import { Users, Calendar, BookOpen, TrendingUp } from "lucide-react";

interface PlanStatsProps {
  totalUsers: number;
  completionRate: number;
  totalDays: number;
  avgProgress: number;
}

export function PlanStats({ totalUsers, completionRate, totalDays, avgProgress }: PlanStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatBox icon={<Users className="w-5 h-5" />} label="Enrolled" value={totalUsers} color="blue" />
      <StatBox icon={<TrendingUp className="w-5 h-5" />} label="Completion" value={`${completionRate}%`} color="green" />
      <StatBox icon={<Calendar className="w-5 h-5" />} label="Duration" value={`${totalDays}d`} color="amber" />
      <StatBox icon={<BookOpen className="w-5 h-5" />} label="Avg Progress" value={`${avgProgress}%`} color="purple" />
    </div>
  );
}

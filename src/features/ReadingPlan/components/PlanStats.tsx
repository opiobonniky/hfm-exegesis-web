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
      <StatBox icon={Users} label="Enrolled" value={totalUsers} color="blue" bg="rgba(59,130,246,0.1)" />
      <StatBox icon={TrendingUp} label="Completion" value={`${completionRate}%`} color="green" bg="rgba(34,197,94,0.1)" />
      <StatBox icon={Calendar} label="Duration" value={`${totalDays}d`} color="amber" bg="rgba(245,158,11,0.1)" />
      <StatBox icon={BookOpen} label="Avg Progress" value={`${avgProgress}%`} color="purple" bg="rgba(168,85,247,0.1)" />
    </div>
  );
}

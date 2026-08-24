// PlanListItem — reusable card for reading plan listings
import { BookOpen, Users, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  id: number;
  title: string;
  description: string;
  duration: number;
  status: string;
  startDate: string;
  endDate: string;
  assignedUsers: number;
  completionRate: number;
  onClick?: () => void;
}
const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-muted text-muted-foreground",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  archived: "bg-stone-50 text-stone-500 border-stone-200",
};
export function PlanListItem({ title, description, duration, status, startDate, assignedUsers, completionRate, onClick }: Props) {
  return (
    <div className={cn("p-4 border border-border/40 rounded-xl bg-card hover:bg-muted/10 hover:border-primary/20 transition-all space-y-2", onClick && "cursor-pointer")} onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            <Badge variant="outline" className={cn("text-[10px]", statusColors[status] || statusColors.draft)}>{status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{duration} days</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{assignedUsers} users</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{completionRate}%</span>
        </div>
      </div>
    </div>
  );

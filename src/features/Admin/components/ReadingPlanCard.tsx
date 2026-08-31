// ReadingPlanCard — single plan card for admin reading plans
import { Edit2, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReadingPlan } from "../hooks/useAdminReadingPlans";

interface Props {
  plan: ReadingPlan;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function ReadingPlanCard({ plan, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm line-clamp-1">{plan.title}</h3>
        <Badge variant={plan.isPublished ? "default" : "secondary"}>
          {plan.isPublished ? "Published" : "Draft"}
        </Badge>
      </div>
      {plan.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {plan.description}
        </p>
      )}
      <div className="flex items-center gap-2 mb-3">
        {plan.category && (
          <Badge variant="outline" className="text-[10px]">
            {plan.category}
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground">
          {plan.durationDays} days
        </span>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onView}
          title="View details"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="gap-1 h-7 text-xs"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="gap-1 h-7 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </Button>
      </div>
    </div>
  );
}

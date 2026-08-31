// ReadingPlanDetailHeader — header with back button and status badge
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReadingPlanDetailHeaderProps {
  planId: string;
  isPublished: boolean;
  onBack: () => void;
}

export function ReadingPlanDetailHeader({
  planId,
  isPublished,
  onBack,
}: ReadingPlanDetailHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Reading Plan
              </h1>
              <p className="text-xs text-muted-foreground">{planId}</p>
            </div>
          </div>
          <Badge variant={isPublished !== false ? "default" : "secondary"}>
            {isPublished !== false ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ReadingPlanInfoCard — plan info card with title, badges, description
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ReadingPlanInfoCardProps {
  title: string;
  category?: string;
  durationDays?: number;
  description?: string;
}

export function ReadingPlanInfoCard({
  title,
  category,
  durationDays,
  description,
}: ReadingPlanInfoCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="flex items-center gap-2 mt-1">
              {category && <Badge variant="outline">{category}</Badge>}
              {durationDays && (
                <Badge variant="secondary">{durationDays} days</Badge>
              )}
            </div>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

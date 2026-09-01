/**
 * DailyDevotionsEmpty — empty state for devotions list.
 */
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  message: string;
  isAdmin?: boolean;
  addLabel?: string;
  onAdd?: () => void;
}

export function DailyDevotionsEmpty({
  message,
  isAdmin,
  addLabel = "Add Devotion",
  onAdd,
}: Props) {
  return (
    <Card className="border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Lightbulb className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
        {isAdmin && onAdd && (
          <Button onClick={onAdd} className="mt-4 gap-2">
            {addLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Check, Play, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingDay {
  day: number;
  reference: string;
  completed: boolean;
  title?: string;
}

interface ReadingDayRowProps {
  reading: ReadingDay;
  onToggleComplete: (day: number) => void;
}

export function ReadingDayRow({ reading, onToggleComplete }: ReadingDayRowProps) {
  return (
    <Card className={cn("bg-card border-border transition-all", reading.completed && "opacity-70")}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          reading.completed ? "bg-green-500 text-white" : "bg-primary/10 text-primary",
        )}>
          {reading.completed ? <Check className="w-5 h-5" /> : reading.day}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{reading.reference}</p>
          {reading.title && <p className="text-sm text-muted-foreground truncate">{reading.title}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <BookOpen className="w-4 h-4" />
          </Button>
          <Button
            variant={reading.completed ? "outline" : "default"}
            size="sm"
            onClick={() => onToggleComplete(reading.day)}
            className={cn(!reading.completed && "bg-primary hover:bg-primary/90")}
          >
            {reading.completed ? "Undo" : "Complete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
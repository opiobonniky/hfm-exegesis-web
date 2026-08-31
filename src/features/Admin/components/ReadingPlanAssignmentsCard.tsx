// ReadingPlanAssignmentsCard — list of daily assignments
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Assignment {
  dayNumber: number;
  title?: string;
  description?: string;
  bookName?: string;
  chapterStart?: number;
  chapterEnd?: number;
}

interface ReadingPlanAssignmentsCardProps {
  assignments: Assignment[];
}

export function ReadingPlanAssignmentsCard({
  assignments,
}: ReadingPlanAssignmentsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Daily Assignments ({assignments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {assignments.map((a) => (
            <div
              key={a.dayNumber}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">
                  {a.dayNumber}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {a.title || `Day ${a.dayNumber}`}
                </p>
                {a.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {a.description}
                  </p>
                )}
                {a.bookName && (
                  <span className="text-[10px] text-muted-foreground mt-1 inline-block">
                    <BookOpen className="w-2.5 h-2.5 inline mr-0.5" />
                    {a.bookName} {a.chapterStart}
                    {a.chapterEnd && a.chapterEnd !== a.chapterStart
                      ? `\u2013${a.chapterEnd}`
                      : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

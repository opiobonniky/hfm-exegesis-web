import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, BookOpen, ChevronRight } from "lucide-react";

interface DevotionCardProps {
  id: string;
  title: string;
  content: string;
  reference?: string;
  date: string;
  status: string;
  onClick: () => void;
}

export function DevotionCard({ title, content, reference, date, status, onClick }: DevotionCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
          <Badge variant={status === "published" ? "success" : "warning"} className="shrink-0 ml-2">{status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{content}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {reference && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {reference}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {new Date(date).toLocaleDateString()}
            </span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  );
}

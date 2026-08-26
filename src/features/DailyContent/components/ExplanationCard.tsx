import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";

interface ExplanationCardProps {
  id: string;
  reference: string;
  title: string;
  content: string;
  status: string;
  date: string;
  onClick: () => void;
}
export function ExplanationCard({ reference, title, content, status, date, onClick }: ExplanationCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{reference}</p>
          </div>
          <Badge variant={status === "published" ? "success" : "warning"}>{status}</Badge>
        </div>
        {title && <p className="font-semibold text-foreground mb-1 line-clamp-1">{title}</p>}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{content}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(date).toLocaleDateString()}
          </span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </CardContent>
    </Card>
  );
}

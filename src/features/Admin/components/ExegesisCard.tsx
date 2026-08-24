// ExegesisCard — card for daily exegesis list items
import { BookOpen, CalendarDays, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  id: number;
  title: string;
  passageReference: string;
  displayDate: string;
  teachingBody: string;
  isPublished: boolean;
  onEdit: () => void;
  onDelete: () => void;
}
export function ExegesisCard({ title, passageReference, displayDate, teachingBody, isPublished, onEdit, onDelete }: Props) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {passageReference}
            </p>
          </div>
          <Badge variant={isPublished ? "default" : "secondary"} className="shrink-0 ml-2">
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {displayDate && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> {new Date(displayDate).toLocaleDateString()}
          </p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{teachingBody}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="gap-1 text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" /> Delete
      </CardContent>
    </Card>
  );

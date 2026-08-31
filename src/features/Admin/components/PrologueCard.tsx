// PrologueCard — single prologue card for the admin list
import { Edit2, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrologueItem {
  id: number;
  bookName: string;
  title: string;
  content: string;
  isPublished: boolean;
}

interface Props {
  item: PrologueItem;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export function PrologueCard({ item, onEdit, onDelete }: Props) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{item.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {item.bookName}
            </p>
          </div>
          <Badge
            variant={item.isPublished ? "default" : "secondary"}
            className="shrink-0 ml-2"
          >
            {item.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {item.content}
        </p>
        <div className="flex items-center gap-2">
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
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="gap-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

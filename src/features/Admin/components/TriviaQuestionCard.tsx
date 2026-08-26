// TriviaQuestionCard — question list item for trivia management
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  id: number;
  question: string;
  difficulty: string;
  category: string;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
}
const difficultyColor = (d: string) => {
  switch (d) {
    case "easy": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40";
    case "medium": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40";
    case "hard": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40";
    default: return "bg-muted text-muted-foreground border-border";
  }
};
export function TriviaQuestionCard({ question, difficulty, category, isActive, onEdit, onDelete }: Props) {
  return (
    <div className="p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm mb-1">{question}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px]", difficultyColor(difficulty))}>{difficulty}</Badge>
            <Badge variant="outline" className="text-[10px] bg-muted">{category?.replace("-", " ")}</Badge>
            {isActive ? (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Inactive</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={onEdit}>
            <Edit2 className="w-4 h-4 text-foreground/60" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-foreground/60" />
          </Button>
        </div>
      </div>
    </div>
  );
}
/** Re-export difficultyColor for use in other trivia components */
export { difficultyColor };

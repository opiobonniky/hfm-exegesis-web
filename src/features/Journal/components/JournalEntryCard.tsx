import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, BookOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "../types";

interface JournalEntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onDelete?: () => void;
}
export function JournalEntryCard({ entry, onClick, onDelete }: JournalEntryCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{entry.title}</h3>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{entry.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(entry.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            {entry.mood && <Badge variant="outline" className="text-xs">{entry.mood}</Badge>}
            {entry.tags?.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
      </CardContent>
    </Card>
  );

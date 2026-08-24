import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, Trash2, Star, Edit2, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JournalListItem } from "../types";
import { CATEGORY_COLORS, MOOD_EMOJIS } from "../constants";

interface JournalListProps {
  entries: JournalListItem[];
  onSelect: (entry: Entry) => void;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  emptyMessage?: string;
}
export function JournalList({ entries, onSelect, onDelete, onToggleFavorite, emptyMessage }: JournalListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground text-sm">{emptyMessage || "No entries found"}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card key={entry.id} className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer group" onClick={() => onSelect(entry)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {entry.mood && <span className="text-lg">{MOOD_EMOJIS[entry.mood] || "📝"}</span>}
                <h3 className="font-semibold text-foreground line-clamp-1">{entry.title || "Untitled Entry"}</h3>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onToggleFavorite(entry.id); }}>
                  <Star className={cn("w-3.5 h-3.5", entry.isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{entry.content}</p>
            <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn("text-[10px]", CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.general)}>
                  {entry.category}
                </Badge>
                {entry.bookName && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {entry.bookName} {entry.chapter}:{entry.verseNumber}
                  </span>
                )}
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(entry.createdOn).toLocaleDateString()}
              </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );

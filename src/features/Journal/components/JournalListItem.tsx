// JournalListItem — reusable card for journal entries
import { BookOpen, Tag, Trash2, Edit2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  tags?: string;
  mood?: string;
  isFavorite: boolean;
  createdAt: string;
  onEdit: () => void;
  onDelete: () => void;
  onClick?: () => void;
}
export function JournalListItem({ title, content, bookName, chapter, verseNumber, tags, mood, isFavorite, createdAt, onEdit, onDelete, onClick }: Props) {
  return (
    <div
      className={cn("p-4 border border-border/40 rounded-xl bg-card hover:bg-muted/10 hover:border-primary/20 transition-all space-y-2", onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{title || "Untitled"}</h3>
            {isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{content}</p>
          {bookName && (
            <p className="text-xs text-muted-foreground mt-1">
              <BookOpen className="w-3 h-3 inline mr-1" />{bookName} {chapter}:{verseNumber}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {tags && tags.split(",").slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]"><Tag className="w-2.5 h-2.5 mr-0.5" />{tag.trim()}</Badge>
            ))}
            {mood && <Badge variant="secondary" className="text-[10px]">{mood}</Badge>}
            <span className="text-[10px] text-muted-foreground/60 ml-auto">{new Date(createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(); }}><Edit2 className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );

// Explanation card — single verse explanation with edit/delete actions
import { BookOpen, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ExplanationPreviewCard from "./ExplanationPreviewCard";

import type { VerseExplanation } from "../types";
interface ExplanationCardProps {
  item: VerseExplanation;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}
export default function ExplanationCard({ item, onEdit, onDelete, isAdmin }: ExplanationCardProps) {
  const ref = `${item.bookName} ${item.chapter}:${item.verseNumber}`;
  return (
    <div className="rounded-xl border border-border hover:border-primary/20 transition-all">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">{ref}</p>
          {item.bibleVersion && <p className="text-[10px] text-muted-foreground mt-0.5">{item.bibleVersion}</p>}
        {item.updatedOn && <span className="text-[10px] text-muted-foreground hidden sm:block">{new Date(item.updatedOn).toLocaleDateString()}</span>}
        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Edit2 className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        )}
      </div>
      {/* Content — always visible */}
      <div className="border-t border-border/30">
        <ExplanationPreviewCard explanation={item.explanation} learnMore={item.learnMore} />
    </div>
  );

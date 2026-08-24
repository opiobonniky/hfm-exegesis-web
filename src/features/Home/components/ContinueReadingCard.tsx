"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
interface ContinueReadingCardProps {
  bookName: string;
  chapter: number;
  lastReadTime?: string;
  onPress?: () => void;
}
export default function ContinueReadingCard({
  bookName,
  chapter,
  lastReadTime,
  onPress,
}: ContinueReadingCardProps) {
  return (
    <div
      onClick={onPress}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 cursor-pointer",
        "hover:shadow-md transition-all duration-200 active:scale-[0.98]",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-primary/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Continue Reading
          </p>
          <p className="text-sm font-semibold text-foreground truncate">
            {bookName} {chapter}
          {lastReadTime && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Last read · {lastReadTime}
            </p>
          )}
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
      </div>
    </div>
  );

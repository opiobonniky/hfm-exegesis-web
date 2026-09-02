import { cn } from "@/lib/utils";
import type { JournalDetailCategoryMeta, JournalDetailMoodInfo } from "../hooks/useJournalDetail";

export interface JournalDetailMetaRowProps {
  category: JournalDetailCategoryMeta;
  categoryLabel: string;
  mood: JournalDetailMoodInfo | null;
  createdOn: string;
  formatDate: (date: string) => string;
}

export default function JournalDetailMetaRow({ category, categoryLabel, mood, createdOn, formatDate }: JournalDetailMetaRowProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
        <div className={cn("w-2 h-2 rounded-full", category.color)} />
        <div className="text-muted-foreground dark:text-muted-foreground/70">{categoryLabel}</div>
      </div>
      {mood && <div className="text-sm leading-none" title={mood.label}>{mood.emoji}</div>}
      <div className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground">{formatDate(createdOn)}</div>
    </div>
  );
}

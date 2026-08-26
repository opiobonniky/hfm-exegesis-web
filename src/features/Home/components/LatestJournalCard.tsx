"use client";

import { PenLine, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
interface LatestJournalCardProps {
  title?: string;
  passageRef?: string;
  reflection?: string;
  createdOn?: string;
  isPublic?: boolean;
  onPress?: () => void;
}
export default function LatestJournalCard({
  title,
  passageRef,
  reflection,
  createdOn,
  isPublic,
  onPress,
}: LatestJournalCardProps) {
  const timeLabel = (() => {
    if (!createdOn) return "";
    const diff = Date.now() - new Date(createdOn).getTime();
    const d = Math.floor(diff / 86400000);
    if (d < 1) return "Today";
    if (d === 1) return "Yesterday";
    return new Date(createdOn).toLocaleDateString();
  })();
  return (
    <div
      onClick={onPress}
      className={cn(
        "rounded-2xl p-4 cursor-pointer transition-all duration-200",
        "hover:shadow-md active:scale-[0.98]",
        "bg-emerald-50 dark:bg-emerald-950/40",
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shrink-0">
          <PenLine className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground line-clamp-1">
            {passageRef || title || "Journal entry"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{timeLabel}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1" />
      </div>
      {reflection && (
        <div className="rounded-xl bg-white/40 dark:bg-emerald-950/20 p-3">
          <p className="text-xs text-foreground/70 italic leading-relaxed line-clamp-2">
            &ldquo;{reflection}&rdquo;
          </p>
        </div>
      )}
      <div className="flex items-center gap-2 mt-3">
        {isPublic && <span className="text-[10px] font-semibold text-emerald-500">Public</span>}
      </div>
    </div>
  );
}

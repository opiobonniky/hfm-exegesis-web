"use client";

import { BookText, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
interface DailyExegesisCardProps {
  title: string;
  passageRef?: string;
  introduction?: string;
  onPress?: () => void;
}
export default function DailyExegesisCard({
  title,
  passageRef,
  introduction,
  onPress,
}: DailyExegesisCardProps) {
  return (
    <div
      onClick={onPress}
      className={cn(
        "rounded-2xl p-4 cursor-pointer transition-all duration-200",
        "hover:shadow-md active:scale-[0.98]",
        "bg-indigo-50 dark:bg-indigo-950/40",
      )}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0">
          <BookText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground line-clamp-1">{title}</p>
          {passageRef && <p className="text-xs text-indigo-500 font-medium mt-0.5">{passageRef}</p>}
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-1" />
      </div>
      {introduction && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic pl-3">
          &ldquo;{introduction}&rdquo;
        </p>
    </div>
  );

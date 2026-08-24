"use client";

import { Trophy, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
interface ChallengeCardProps {
  onPress?: () => void;
}
export default function ChallengeCard({ onPress }: ChallengeCardProps) {
  return (
    <div
      onClick={onPress}
      className={cn(
        "rounded-2xl p-5 cursor-pointer transition-all duration-200",
        "hover:shadow-md active:scale-[0.99]",
        "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
      )}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-rose-950/50 flex items-center justify-center shrink-0">
          <Trophy className="w-4 h-4 text-rose-500" />
        </div>
        <div>
          <p className="font-bold text-sm text-rose-800 dark:text-rose-300">Challenge Yourself</p>
          <p className="text-[10px] text-rose-500 dark:text-rose-400">Bible Trivia Quiz</p>
        <ChevronRight className="w-4 h-4 text-rose-300 dark:text-rose-600 shrink-0 ml-auto" />
      </div>
      <p className="text-xs text-rose-600/70 dark:text-rose-400/70 leading-relaxed mb-3">
        Test your knowledge of the Scriptures with fun trivia questions across all difficulty levels!
      </p>
      <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 dark:from-rose-500 dark:to-rose-600 active:scale-[0.98]">
        Play Trivia <Sparkles className="w-3.5 h-3.5" />
      </button>
    </div>
  );

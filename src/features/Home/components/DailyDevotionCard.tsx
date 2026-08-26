"use client";

import { Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
interface DailyDevotionCardProps {
  title?: string;
  content?: string;
  onPress?: () => void;
}
export default function DailyDevotionCard({
  title,
  content,
  onPress,
}: DailyDevotionCardProps) {
  const { t } = useLanguage();
  return (
    <div
      onClick={onPress}
      className={cn(
        "rounded-2xl border border-border bg-card p-5 cursor-pointer",
        "hover:shadow-md transition-all duration-200",
        "active:scale-[0.98]",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center">
          <Heart className="w-[15px] h-[15px] text-rose-500" />
        </div>
        <p className="text-sm font-bold text-foreground">
          {t?.bible?.dailyDevotionalTitle ||
            t?.home?.dailyDevotionTitle ||
            "Daily Devotion"}
        </p>
      </div>
      {/* Title */}
      {title && (
        <p className="text-sm font-semibold text-foreground mb-2">{title}</p>
      )}
      {/* Content */}
      {content && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {content}
        </p>
      )}
      {/* Action */}
      <div className="flex items-center gap-1 mt-3 text-rose-500">
        <span className="text-xs font-semibold">
          {t?.home?.readDevotion || "Read Devotion"}
        </span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

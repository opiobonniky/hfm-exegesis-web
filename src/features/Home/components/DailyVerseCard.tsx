"use client";

import { Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
interface DailyVerseCardProps {
  reference: string;
  text?: string;
  onPress?: () => void;
}
export default function DailyVerseCard({
  reference,
  text,
  onPress,
}: DailyVerseCardProps) {
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
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Star className="w-[15px] h-[15px] text-primary" />
        </div>
        <p className="text-sm font-bold text-foreground">
          {t?.bible?.dailyVerse || t?.home?.dailyVerseTitle || "Daily Verse"}
        </p>
      </div>
      {/* Reference */}
      <p className="text-sm font-semibold text-primary mb-2">{reference}</p>
      {/* Verse text */}
      {text && (
        <div className="flex gap-2.5">
          <div className="w-0.5 rounded-full bg-primary shrink-0" />
          <p
            className="text-sm text-foreground/80 leading-relaxed italic line-clamp-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            &ldquo;{text}&rdquo;
          </p>
      {/* Action */}
      <div className="flex items-center gap-1 mt-3 text-primary">
        <span className="text-xs font-semibold">
          {t?.home?.readExplanation || "Read Explanation"}
        </span>
        <ArrowRight className="w-3.5 h-3.5" />
    </div>
  );

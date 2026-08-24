"use client";

import { Sun, Moon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
interface GreetingCardProps {
  userName: string;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  onProfilePress?: () => void;
}
export default function GreetingCard({
  userName,
  isDarkMode,
  onThemeToggle,
  onProfilePress,
}: GreetingCardProps) {
  const { t } = useLanguage();
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t?.home?.goodMorning || "Good Morning"
      : hour < 17
        ? t?.home?.goodAfternoon || "Good Afternoon"
        : t?.home?.goodEvening || "Good Evening";
  return (
    <div
      onClick={onProfilePress}
      className={cn(
        "relative rounded-2xl border border-border bg-card p-5 cursor-pointer",
        "hover:shadow-md transition-all duration-200",
        "active:scale-[0.98]",
      )}
    >
      {/* Theme toggle */}
      {onThemeToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onThemeToggle();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-[17px] h-[17px] text-primary" />
          ) : (
            <Moon className="w-[17px] h-[17px] text-primary" />
          )}
        </button>
      {/* Greeting */}
      <div className="pr-12">
        <p className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="text-foreground">{greeting}, </span>
          <span className="text-primary">{userName}</span>
        </p>
      </div>
      {/* Encouragement message */}
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        {t?.home?.greetingMessage ||
          "We encourage you to search the scriptures daily just like Paul told the Bereans. Please jump into the word, get consistent and build daily spiritual disciplines."}
      </p>
    </div>
  );

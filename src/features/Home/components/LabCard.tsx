"use client";

import { FlaskConical, ArrowRight, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
interface LabCardProps {
  onPress?: () => void;
}
export default function LabCard({ onPress }: LabCardProps) {
  const { t } = useLanguage();
  return (
    <div
      onClick={onPress}
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 cursor-pointer",
        "hover:shadow-md transition-all duration-200",
        "active:scale-[0.98]",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            {t?.home?.labCardTitle || "Exegesis Lab"}
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Timer className="w-2.5 h-2.5" />
            {t?.home?.labDurationHint || "5 steps · 30–60 min"}
      </div>
      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {t?.home?.labCardSubtitle ||
          "A guided 5-step journey through any passage — Look, Listen, Learn, Abide, and Apply."}
      </p>
      {/* Action */}
      <div className="flex items-center gap-1 text-primary">
        <span className="text-xs font-semibold">
          {t?.home?.labStartStudy || "Start Study"}
        </span>
        <ArrowRight className="w-3.5 h-3.5" />
    </div>
  );

// Explanation preview card — renders explanation + learn more accordion
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationPreviewCardProps {
  explanation: string;
  learnMore?: string;
}
function renderContent(text: string) {
  const paragraphs = text.replace(/\r/g, "").split(/\n\s*\n/).filter(Boolean);
  return paragraphs.map((para, pi) => {
    const lines = para.split("\n").map((s) => s.trim()).filter(Boolean);
    const isBulletList = lines.some((l) => /^(-|\*|•|\d+\.)\s+/.test(l));
    if (isBulletList) {
      return (
        <div key={pi} className="space-y-2 mb-4">
          {lines.map((line, li) => {
            if (/^(-|\*|•|\d+\.)\s+/.test(line)) {
              return (
                <div key={li} className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-sm text-foreground/80 leading-relaxed">
                    {line.replace(/^(-|\*|•|\d+\.)\s+/, "")}
                  </span>
                </div>
              );
            }
            return <p key={li} className="text-sm text-foreground/80 leading-relaxed">{line}</p>;
          })}
        </div>
      );
    }
    return <p key={pi} className="text-sm text-foreground/80 leading-relaxed mb-4 last:mb-0">{lines.join(" ")}</p>;
  });
export default function ExplanationPreviewCard({ explanation, learnMore }: ExplanationPreviewCardProps) {
  const [showLearnMore, setShowLearnMore] = useState(false);
  return (
    <div className="px-4 pb-4 pt-3 border-t border-border/30 space-y-4 bg-muted/10">
      {/* Explanation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Explanation</span>
        <div className="pl-4">{renderContent(explanation)}</div>
      </div>
      {/* Learn more accordion */}
      {learnMore && (
        <div className="space-y-3">
          <button onClick={() => setShowLearnMore(!showLearnMore)} className="flex items-center gap-2 group">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              Learn More
            </span>
            <ChevronDown className={cn("w-4 h-4 text-amber-500 transition-transform duration-300", showLearnMore && "rotate-180")} />
          </button>
          <div className="grid transition-all duration-300" style={{ gridTemplateRows: showLearnMore ? "1fr" : "0fr" }}>
            <div className="overflow-hidden">
              <div className="pl-4 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-4">
                {renderContent(learnMore)}
              </div>
            </div>
          </div>
      )}
    </div>
  );

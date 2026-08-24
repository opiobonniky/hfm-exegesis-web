// LivePreview — real-time preview panel for verse explanation
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  bookName: string; chapter: number; verseNumber: number;
  bibleVersion: string; explanation: string; learnMore: string;
  t: any;
}
function renderContent(text: string, t: any) {
  const lines = text.replace(/\r/g, "").split("\n").map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return <p className="text-sm text-muted-foreground/50 italic">{t.verseExplanations.nothingToPreview}</p>;
  return lines.map((line, i) => {
    const isBullet = /^(\-|\*|•|\d+\.)\s+/.test(line);
    return isBullet ? (
      <div key={i} className="flex gap-2.5 items-start mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-[7px] shrink-0" />
        <span className="text-sm leading-relaxed text-foreground/80">{line.replace(/^(\-|\*|•|\d+\.)\s+/, "")}</span>
      </div>
    ) : (
      <p key={i} className="text-sm leading-relaxed text-foreground/80 mb-1.5">{line}</p>
    );
  });
export function LivePreview({ bookName, chapter, verseNumber, bibleVersion, explanation, learnMore, t }: Props) {
  const [showLearnMore, setShowLearnMore] = useState(false);
  return (
    <div className="rounded-xl border border-primary/20 overflow-hidden shadow-sm">
      <div className="bg-primary/8 border-b border-primary/15 px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t.verseExplanations.livePreview}</span>
        {bookName && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-primary">{bookName} {chapter}:{verseNumber}</span>
            {bibleVersion && <Badge variant="outline" className="text-xs font-mono">{bibleVersion}</Badge>}
          </div>
        )}
      <div className="p-4 space-y-4 bg-card">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{t.verseExplanations.previewExplanation}</span>
          <div className="pl-3">{renderContent(explanation, t)}</div>
        </div>
        {learnMore && (
          <div>
            <button onClick={() => setShowLearnMore(!showLearnMore)} className="flex items-center gap-2 group mb-2">
              <div className="w-1 h-4 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider group-hover:text-amber-700">{t.verseExplanations.previewLearnMore}</span>
              {showLearnMore ? <ChevronUp className="w-3.5 h-3.5 text-amber-500" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-500" />}
            </button>
            {showLearnMore && (
              <div className="pl-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3">
                {renderContent(learnMore, t)}
              </div>
            )}
    </div>
  );

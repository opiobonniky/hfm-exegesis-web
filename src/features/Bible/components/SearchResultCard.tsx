// Search result card — displays a bible verse search result with actions
import { BookOpen, BookmarkCheck, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchResultCardProps {
  ref_: string;
  headline?: string;
  verseText: string;
  translationAbbr?: string;
  onOpen: () => void;
  onStudy: () => void;
  onSave: () => void;
}
/** Parse <mark> tags in headline into text + highlight segments */
function parseHighlight(html: string): { text: string; highlight: boolean }[] {
  const parts: { text: string; highlight: boolean }[] = [];
  const regex = /<mark>(.*?)<\/mark>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    if (m.index > last) parts.push({ text: html.slice(last, m.index), highlight: false });
    parts.push({ text: m[1], highlight: true });
    last = regex.lastIndex;
  }
  if (last < html.length) parts.push({ text: html.slice(last), highlight: false });
  return parts;
export default function SearchResultCard({
  ref_, headline, verseText, translationAbbr, onOpen, onStudy, onSave,
}: SearchResultCardProps) {
  const parts = headline ? parseHighlight(headline) : null;
  return (
    <div className="group rounded-xl border border-border/40 bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99]">
      {/* Reference */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        <span className="text-xs font-bold text-accent tracking-wide">{ref_}</span>
        {translationAbbr && (
          <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 border-primary/20 text-primary px-1.5 py-0">
            {translationAbbr}
          </Badge>
        )}
      </div>
      {/* Text */}
      {parts ? (
        <p className="text-sm leading-relaxed text-foreground/80 font-serif">
          {parts.map((p, i) =>
            p.highlight ? (
              <span key={i} className="text-accent font-semibold bg-accent/10 px-0.5 rounded">{p.text}</span>
            ) : (
              <span key={i}>{p.text}</span>
            ),
          )}
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-foreground/80 font-serif line-clamp-3">{verseText}</p>
      )}
      {/* Actions */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/20 opacity-75 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 gap-1 hover:bg-accent/10 hover:text-accent" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          <BookOpen className="w-3 h-3" /> Open
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 gap-1 hover:bg-primary/10 hover:text-primary" onClick={(e) => { e.stopPropagation(); onStudy(); }}>
          <BookMarked className="w-3 h-3" /> Study
        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 gap-1 hover:bg-emerald-500/10 hover:text-emerald-600" onClick={(e) => { e.stopPropagation(); onSave(); }}>
          <BookmarkCheck className="w-3 h-3" /> Save
    </div>
  );

// Search result card — displays a bible verse search result with actions
import { BookOpen, BookmarkCheck, BookMarked, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from '@/components/languages/hardcodedTranslate';
import { displayUiText } from '@/services/numberLocale/format';

interface SearchResultCardProps {
  ref_: string;
  headline?: string;
  verseText: string;
  translationAbbr?: string;
  /** Section heading the result's verse falls under (e.g. "The Seventh Day"). */
  sectionHeading?: string;
  onOpen: () => void;
  onStudy: () => void;
  onSave: () => void;
  onAddNote: () => void;
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
}

export default function SearchResultCard({
  ref_, headline, verseText, translationAbbr, sectionHeading, onOpen, onStudy, onSave, onAddNote,
}: SearchResultCardProps) {
  const parts = headline ? parseHighlight(headline) : null;

  return (
    <div className="group rounded-xl border border-border/40 bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99]">
      <button type="button" onClick={onOpen} className="block w-full rounded text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${tt("Open")} ${displayUiText(ref_)}`}>
      {/* Reference */}
       <span className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        <span className="text-xs font-bold text-accent tracking-wide">{displayUiText(ref_)}</span>
        {translationAbbr && (
          <span className="notranslate rounded border text-[10px] font-bold bg-primary/10 border-primary/20 text-primary px-1.5 py-0" translate="no">
            {translationAbbr}
          </span>
        )}
      </span>
      {/* Section context from the reader's heading dataset */}
      {sectionHeading && (
        <span className="block mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          {sectionHeading}
        </span>
      )}
      {/* Text */}
      {parts ? (
        <span className="notranslate block text-sm leading-relaxed text-foreground/80 font-serif" translate="no" dir="auto">
          {parts.map((p, i) =>
            p.highlight ? (
              <span key={i} className="text-accent font-semibold bg-accent/10 px-0.5 rounded">{p.text}</span>
            ) : (
              <span key={i}>{p.text}</span>
            ),
          )}
        </span>
      ) : (
        <span className="notranslate block text-sm leading-relaxed text-foreground/80 font-serif line-clamp-3" translate="no" dir="auto">{verseText}</span>
      )}
      </button>
      {/* Actions */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/20 opacity-75 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 gap-1 hover:bg-accent/10 hover:text-accent" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          <BookOpen className="w-3 h-3" />{tt("Open")}</Button>
        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 gap-1 hover:bg-primary/10 hover:text-primary" onClick={(e) => { e.stopPropagation(); onStudy(); }}>
          <BookMarked className="w-3 h-3" />{tt("Study")}</Button>
        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 gap-1" onClick={onAddNote}>
          <StickyNote className="w-3 h-3" />{tt("Add Note")}</Button>
        <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2.5 gap-1 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400" onClick={(e) => { e.stopPropagation(); onSave(); }}>
          <BookmarkCheck className="w-3 h-3" />{tt("Save")}</Button>
      </div>
    </div>
  );
}

import { BookText, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SEARCH_HINTS } from "../constants";
import { WordResultItem } from "./WordResultItem";
import { LanguageStatsBar } from "./LanguageStatsBar";
import type { StrongsWordEntry } from "@/data/staticData";

interface Props {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  results: StrongsWordEntry[];
  loading: boolean;
  searched: boolean;
  resultTotal: number;
  searchLangCounts: Record<string, number>;
  onWordClick: (strongsId: string) => void;
}

export function LabSearchPanel({ searchQuery, onSearchQueryChange, results, loading, searched, resultTotal, searchLangCounts, onWordClick }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center pt-2 pb-1">
        <h2 className="text-lg font-black text-foreground text-center">Study the Original Words</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">Search for Greek and Hebrew words to see their meaning, usage, and grammar explained in plain English.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by word, transliteration, or meaning... (min 3 characters)" value={searchQuery} onChange={(e) => onSearchQueryChange(e.target.value)} className="pl-9 pr-4 h-11 text-sm rounded-xl border-border/60" />
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
        <span className="font-semibold">Try:</span>
        {SEARCH_HINTS.map((h) => <button key={h} onClick={() => onSearchQueryChange(h)} className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">{h}</button>)}
      </div>
      {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <BookText className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No words found</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">Try a different search term, or switch to Browse by Book</p>
        </div>
      )}
      {!loading && results.length > 0 && (
        <div className="space-y-3 mt-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{resultTotal} word{resultTotal !== 1 ? "s" : ""} found</p>
          <LanguageStatsBar counts={searchLangCounts} label="Language Breakdown" />
          <ScrollArea className="max-h-[55vh] pr-1">
            <div className="space-y-1.5">{results.map((w) => <WordResultItem key={w.strongsId} word={w} onClick={() => onWordClick(w.strongsId)} />)}</div>
          </ScrollArea>
        </div>
      )}
      {!loading && !searched && (
        <div className="flex flex-col items-center py-12 text-center">
          <Search className="w-14 h-14 text-muted-foreground/20 mb-4" />
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">Enter a word above to discover its original Greek or Hebrew meaning, usage across Scripture, and grammatical details.</p>
        </div>
      )}
    </div>
  );
}

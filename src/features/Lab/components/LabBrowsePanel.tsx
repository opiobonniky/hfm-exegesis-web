import { BookText, BookOpen, Loader2, LibraryBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BIBLE_BOOKS } from "@/data/staticData";
import { WordResultItem } from "./WordResultItem";
import { WordFrequencyChart } from "./WordFrequencyChart";
import { LanguageStatsBar } from "./LanguageStatsBar";
import type { StrongsWordEntry } from "@/data/staticData";
import type { LabChartItem, LabChartMode } from "../types";

interface Props {
  selectedBook: string;
  onBookChange: (book: string) => void;
  browseLoading: boolean;
  browseLoaded: boolean;
  browseWords: StrongsWordEntry[];
  browseTotal: number;
  browsePage: number;
  browseHasNext: boolean;
  onLoadMore: () => void;
  chartData: LabChartItem[];
  chartMode: LabChartMode;
  onChartModeChange: (mode: LabChartMode) => void;
  langFilter: string;
  onLangFilterChange: (f: string) => void;
  langCounts: Record<string, number>;
  onWordClick: (strongsId: string) => void;
}

export function LabBrowsePanel({
  selectedBook, onBookChange, browseLoading, browseLoaded,
  browseWords, browseTotal, browsePage, browseHasNext, onLoadMore,
  chartData, chartMode, onChartModeChange, langFilter, onLangFilterChange,
  langCounts, onWordClick,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center pt-2 pb-1">
        <h2 className="text-lg font-black text-foreground text-center">Browse Words by Book</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">Select a book of the Bible to see all the original language words used in it.</p>
      </div>
      <div className="max-w-xs mx-auto w-full">
        <Select value={selectedBook} onValueChange={onBookChange}><SelectTrigger className="h-11 text-sm rounded-xl border-border/60"><SelectValue placeholder="Choose a book..." /></SelectTrigger><SelectContent className="max-h-64">{BIBLE_BOOKS.map((b) => <SelectItem key={b} value={b} className="text-sm">{b}</SelectItem>)}</SelectContent></Select>
      </div>
      {browseLoading && <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      {!browseLoading && browseLoaded && browseWords.length > 0 && (
        <div className="space-y-4 mt-2">
          {chartData.length > 0 && <WordFrequencyChart data={chartData} onWordClick={onWordClick} mode={chartMode} onModeChange={onChartModeChange} langFilter={langFilter} onLangFilterChange={onLangFilterChange} langCounts={langCounts} />}
          <LanguageStatsBar counts={langCounts} label={`${selectedBook} — ${browseTotal} unique book words`} icon={<LibraryBig className="w-3.5 h-3.5 text-primary" />} />
          <div className="flex items-center justify-between"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">All Words ({browseWords.length} of {browseTotal})</p></div>
          <ScrollArea className="max-h-[45vh] pr-1">
            <div className="space-y-1.5">{browseWords.map((w) => <WordResultItem key={w.strongsId} word={w} onClick={() => onWordClick(w.strongsId)} />)}</div>
          </ScrollArea>
          {browseHasNext && (
            <div className="flex items-center justify-center pt-1 pb-2">
              <Button variant="outline" size="sm" onClick={onLoadMore} disabled={browseLoading} className="gap-1.5 text-xs h-8">
                {browseLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />}
                {browseLoading ? "Loading..." : `Show more (${browseWords.length} of ${browseTotal} words)`}
              </Button>
            </div>
          )}
        </div>
      )}
      {!browseLoading && browseLoaded && browseWords.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center"><BookText className="w-12 h-12 text-muted-foreground/30 mb-3" /><p className="text-sm font-semibold text-muted-foreground">No words found</p><p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">No original language word data is available for {selectedBook}.</p></div>
      )}
      {!browseLoading && !browseLoaded && (
        <div className="flex flex-col items-center py-12 text-center"><LibraryBig className="w-14 h-14 text-muted-foreground/20 mb-4" /><p className="text-sm text-muted-foreground max-w-sm leading-relaxed">Select a book from the dropdown to explore all the original Greek and Hebrew words used in that book.</p></div>
      )}
    </div>
  );
}

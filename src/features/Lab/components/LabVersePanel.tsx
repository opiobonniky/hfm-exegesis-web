import { BookText, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BIBLE_BOOKS } from "@/data/staticData";
import { cn } from "@/lib/utils";
import { WordResultItem } from "./WordResultItem";
import type { StrongsWordEntry } from "@/data/staticData";

const INPUT_CLS = "h-10 text-sm rounded-xl border-border/60";

interface Props {
  verseBook: string;
  onVerseBookChange: (v: string) => void;
  verseChapter: number;
  onVerseChapterChange: (v: number) => void;
  verseNum: number;
  onVerseNumChange: (v: number) => void;
  verseWordsLoading: boolean;
  verseWordsLoaded: boolean;
  verseWords: StrongsWordEntry[];
  verseWordsTotal: number;
  onLoadVerseWords: () => void;
  onWordClick: (strongsId: string) => void;
}

export function LabVersePanel({
  verseBook, onVerseBookChange, verseChapter, onVerseChapterChange,
  verseNum, onVerseNumChange, verseWordsLoading, verseWordsLoaded,
  verseWords, verseWordsTotal, onLoadVerseWords, onWordClick,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center pt-2 pb-1">
        <h2 className="text-lg font-black text-foreground text-center">Words in This Verse</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">Explore every original language word used in a specific verse, with definitions and grammar.</p>
      </div>
      <div className="flex flex-wrap items-end gap-2 justify-center">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Book</label>
          <Select value={verseBook} onValueChange={onVerseBookChange}><SelectTrigger className={cn(INPUT_CLS, "w-32")}><SelectValue placeholder="Book" /></SelectTrigger><SelectContent className="max-h-64">{BIBLE_BOOKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chapter</label>
          <Input type="number" min={1} placeholder="Ch." value={verseChapter || ""} onChange={(e) => onVerseChapterChange(parseInt(e.target.value) || 0)} className={cn(INPUT_CLS, "w-20")} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verse</label>
          <Input type="number" min={1} placeholder="V." value={verseNum || ""} onChange={(e) => onVerseNumChange(parseInt(e.target.value) || 0)} className={cn(INPUT_CLS, "w-20")} />
        </div>
        <Button size="sm" onClick={onLoadVerseWords} disabled={verseWordsLoading || !verseBook || !verseChapter || !verseNum} className="h-10 mt-4 gap-1">
          {verseWordsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}Load Words
        </Button>
      </div>
      {verseWordsLoaded && verseBook && verseChapter && verseNum && (
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-sm font-bold px-3 py-1.5 bg-primary/10 border-primary/30 text-primary"><BookText className="w-3.5 h-3.5 mr-1.5" />{verseBook} {verseChapter}:{verseNum}</Badge>
        </div>
      )}
      {verseWordsLoading && <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      {!verseWordsLoading && verseWordsLoaded && verseWords.length > 0 && (
        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted/20 border border-border/40 p-2.5">
            <BookText className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-foreground">{verseBook} {verseChapter}:{verseNum} — {verseWordsTotal} unique word{verseWordsTotal !== 1 ? "s" : ""}</span>
          </div>
          <ScrollArea className="max-h-[55vh] pr-1">
            <div className="space-y-1.5">{verseWords.map((w) => <WordResultItem key={w.strongsId} word={w} onClick={() => onWordClick(w.strongsId)} />)}</div>
          </ScrollArea>
        </div>
      )}
      {!verseWordsLoading && verseWordsLoaded && verseWords.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center"><BookText className="w-12 h-12 text-muted-foreground/30 mb-3" /><p className="text-sm font-semibold text-muted-foreground">No word data for this verse</p></div>
      )}
      {!verseWordsLoading && !verseWordsLoaded && (
        <div className="flex flex-col items-center py-12 text-center"><BookText className="w-14 h-14 text-muted-foreground/20 mb-4" /><p className="text-sm text-muted-foreground max-w-sm leading-relaxed">Enter a book, chapter, and verse above to see all the original language words used in that verse.</p></div>
      )}
    </div>
  );
}

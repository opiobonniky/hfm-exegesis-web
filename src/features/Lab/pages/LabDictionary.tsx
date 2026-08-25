import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookText, Search, Loader2, BookOpen, Languages, ArrowLeft, LibraryBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WordDetailSheet from "@/components/WordDetailSheet";
import WordStudyDialog from "@/components/WordStudyDialog";
import { cn } from "@/lib/utils";
import TierBadge from "@/components/TierBadge";
import Gate from "@/components/Gate";
import { BIBLE_BOOKS } from "@/data/staticData";
import { useLabDictionaryPage } from "../hooks/useLabDictionaryPage";
import { WordResultItem } from "../components/WordResultItem";
import { WordFrequencyChart } from "../components/WordFrequencyChart";
import { LanguageStatsBar } from "../components/LanguageStatsBar";

type Mode = "search" | "browse" | "verse";
const MODE_TABS = [
  { id: "search" as Mode, icon: Search, label: "Search" },
  { id: "browse" as Mode, icon: LibraryBig, label: "Browse by Book" },
  { id: "verse" as Mode, icon: BookText, label: "By Verse" },
];
const SEARCH_HINTS = ["love", "faith", "grace", "word", "light", "logos", "agape"];

export default function LabDictionary() {
  const p = useLabDictionaryPage();
  const { navigate, mode, setMode, searchQuery, setSearchQuery, results, loading, searched, resultTotal, selectedBook, handleBookChange, browseWords, browseLoading, browseLoaded, browseTotal, browsePage, browseHasNext, setBrowsePage, loadBookWords, verseBook, setVerseBook, verseChapter, setVerseChapter, verseNum, setVerseNum, verseWords, verseWordsLoading, verseWordsLoaded, verseWordsTotal, loadVerseWords, chartMode, setChartMode, langFilter, setLangFilter, langCounts, searchLangCounts, chartData, selectedWord, detailOpen, setDetailOpen, openWordDetailById, dialogOpen, setDialogOpen, dialogStrongsId, dialogSurfaceText } = p;
  const inputCls = "h-10 text-sm rounded-xl border-border/60";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="relative w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-all">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none" style={{ fontFamily: "'Cinzel', serif" }}>Dictionary</h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">Original Language Word Study</p>
            </div>
          </div>
          <TierBadge />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-16">
          <Gate featureName="Dictionary" featureDescription="The full word study dictionary with original language analysis is available for Legacy Sower and Covenant Sower subscribers.">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 mb-6 bg-muted/50 rounded-lg p-1 max-w-sm mx-auto">
              {MODE_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setMode(tab.id)}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                      mode === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                    <Icon className="w-3.5 h-3.5" />{tab.label}
                  </button>
                );
              })}
            </div>

            {mode === "search" ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center pt-2 pb-1">
                  <h2 className="text-lg font-black text-foreground text-center">Study the Original Words</h2>
                  <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">Search for Greek and Hebrew words to see their meaning, usage, and grammar explained in plain English.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by word, transliteration, or meaning... (min 3 characters)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 h-11 text-sm rounded-xl border-border/60" />
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="font-semibold">Try:</span>
                  {SEARCH_HINTS.map((h) => <button key={h} onClick={() => setSearchQuery(h)} className="px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">{h}</button>)}
                </div>
                {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                {!loading && searched && results.length === 0 && (
                  <div className="flex flex-col items-center py-16 text-center">
                    <BookText className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-semibold text-muted-foreground">No words found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">Try a different search term, or switch to <button onClick={() => setMode("browse")} className="text-primary underline underline-offset-2">Browse by Book</button></p>
                  </div>
                )}
                {!loading && results.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{resultTotal} word{resultTotal !== 1 ? "s" : ""} found</p>
                    <LanguageStatsBar counts={searchLangCounts} label="Language Breakdown" />
                    <ScrollArea className="max-h-[55vh] pr-1">
                      <div className="space-y-1.5">{results.map((w) => <WordResultItem key={w.strongsId} word={w} onClick={() => openWordDetailById(w.strongsId)} />)}</div>
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
            ) : mode === "verse" ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center pt-2 pb-1">
                  <h2 className="text-lg font-black text-foreground text-center">Words in This Verse</h2>
                  <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">Explore every original language word used in a specific verse, with definitions and grammar.</p>
                </div>
                <div className="flex flex-wrap items-end gap-2 justify-center">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Book</label>
                    <Select value={verseBook} onValueChange={setVerseBook}><SelectTrigger className={cn(inputCls, "w-32")}><SelectValue placeholder="Book" /></SelectTrigger><SelectContent className="max-h-64">{BIBLE_BOOKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chapter</label>
                    <Input type="number" min={1} placeholder="Ch." value={verseChapter || ""} onChange={(e) => setVerseChapter(parseInt(e.target.value) || 0)} className={cn(inputCls, "w-20")} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verse</label>
                    <Input type="number" min={1} placeholder="V." value={verseNum || ""} onChange={(e) => setVerseNum(parseInt(e.target.value) || 0)} className={cn(inputCls, "w-20")} />
                  </div>
                  <Button size="sm" onClick={() => { if (verseBook && verseChapter && verseNum) loadVerseWords(verseBook, verseChapter, verseNum); }} disabled={verseWordsLoading || !verseBook || !verseChapter || !verseNum} className="h-10 mt-4 gap-1">
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
                      <div className="space-y-1.5">{verseWords.map((w) => <WordResultItem key={w.strongsId} word={w} onClick={() => openWordDetailById(w.strongsId)} />)}</div>
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
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center pt-2 pb-1">
                  <h2 className="text-lg font-black text-foreground text-center">Browse Words by Book</h2>
                  <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">Select a book of the Bible to see all the original language words used in it.</p>
                </div>
                <div className="max-w-xs mx-auto w-full">
                  <Select value={selectedBook} onValueChange={handleBookChange}><SelectTrigger className="h-11 text-sm rounded-xl border-border/60"><SelectValue placeholder="Choose a book..." /></SelectTrigger><SelectContent className="max-h-64">{BIBLE_BOOKS.map((b) => <SelectItem key={b} value={b} className="text-sm">{b}</SelectItem>)}</SelectContent></Select>
                </div>
                {browseLoading && <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
                {!browseLoading && browseLoaded && browseWords.length > 0 && (
                  <div className="space-y-4 mt-2">
                    {chartData.length > 0 && <WordFrequencyChart data={chartData as any} onWordClick={openWordDetailById} mode={chartMode} onModeChange={setChartMode} langFilter={langFilter} onLangFilterChange={setLangFilter} langCounts={langCounts} />}
                    <LanguageStatsBar counts={langCounts} label={`${selectedBook} — ${browseTotal} unique book words`} icon={<LibraryBig className="w-3.5 h-3.5 text-primary" />} />
                    <div className="flex items-center justify-between"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">All Words ({browseWords.length} of {browseTotal})</p></div>
                    <ScrollArea className="max-h-[45vh] pr-1">
                      <div className="space-y-1.5">{browseWords.map((w) => <WordResultItem key={w.strongsId} word={w} onClick={() => openWordDetailById(w.strongsId)} />)}</div>
                    </ScrollArea>
                    {browseHasNext && (
                      <div className="flex items-center justify-center pt-1 pb-2">
                        <Button variant="outline" size="sm" onClick={() => loadBookWords(selectedBook, browsePage + 1, true)} disabled={browseLoading} className="gap-1.5 text-xs h-8">
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
            )}
          </Gate>
        </div>
      </div>

      <WordDetailSheet open={detailOpen} onOpenChange={setDetailOpen} wordEntry={selectedWord as any || null} strongsId={selectedWord?.strongsId || null} verseText={undefined} translations={undefined} />
      <WordStudyDialog open={dialogOpen} onOpenChange={setDialogOpen} strongsId={dialogStrongsId} surfaceText={dialogSurfaceText || undefined} />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { Search, Loader2, BookText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { BIBLE_BOOKS } from "@/data/staticData";
import WordCard from "@/components/WordCard";
import WordDetailSheet from "@/components/WordDetailSheet";
import type { useStudyTools } from "../hooks/useStudyTools";

type StudyToolsState = ReturnType<typeof useStudyTools>;

interface WordsTabProps {
  state: StudyToolsState;
}

export function WordsTab({ state }: WordsTabProps) {
  const {
    words, wordsLoading, wordSearch, setWordSearch, searchWords,
    loadVerseWords,
    loadMoreWords, wordsLoadingMore, wordsHasMore,
    verseBook, handleBookChange, verseChapter, handleChapterChange,
    verseNum, setVerseNum, verseChapList, verseNumList, verseText, verseTextLoading,
    detailWord, setDetailWord, detailSheetOpen, setDetailSheetOpen,
  } = state;

  useEffect(() => {
    const query = wordSearch.trim();
    const timer = window.setTimeout(() => {
      if (!verseBook || !verseChapter || !verseNum) void searchWords(query);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchWords, verseBook, verseChapter, verseNum, wordSearch]);

  useEffect(() => {
    if (verseBook && verseChapter) {
      void loadVerseWords(verseBook, verseChapter, verseNum || undefined);
    }
  }, [loadVerseWords, verseBook, verseChapter, verseNum]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && (!verseBook || !verseChapter || !verseNum)) void loadMoreWords();
    }, { rootMargin: "240px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreWords, verseBook, verseChapter, verseNum]);

  return (
    <div className="space-y-5">
      {/* Verse Selector */}
      <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BookText className="w-4 h-4 text-primary" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Browse words by book, chapter, or verse
          </p>
        </div>
        {verseBook && verseChapter && verseNum && (
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <BookText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Selected verse</p>
                <h2 className="mt-1 text-lg font-bold">{verseBook} {verseChapter}:{verseNum}</h2>
                {verseTextLoading ? (
                  <div className="mt-2 h-5 w-72 max-w-full animate-pulse rounded bg-muted" />
                ) : verseText ? (
                  <p className="mt-2 font-serif text-sm italic leading-relaxed text-foreground/80">“{verseText}”</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Showing Strong&apos;s words attached to this verse.</p>
                )}
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  {words.length} {words.length === 1 ? "word" : "words"} available for this verse
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-end gap-2 w-full">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Book</label>
            <Combobox
              options={BIBLE_BOOKS.map((b) => ({ value: b, label: b }))}
              value={verseBook}
              onChange={(v) => { if (v) handleBookChange(v); }}
              placeholder="Select book"
              width="w-full"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chapter</label>
            <Combobox
              options={verseChapList.map((c) => ({ value: String(c), label: `Ch. ${c}` }))}
              value={String(verseChapter)}
              onChange={(v) => { if (v) handleChapterChange(Number(v)); }}
              placeholder="Select ch."
              disabled={verseChapList.length === 0}
              width="w-full"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verse</label>
            <Combobox
              options={verseNumList.map((v) => ({ value: String(v), label: `V. ${v}` }))}
              value={String(verseNum)}
              onChange={(v) => { if (v) setVerseNum(Number(v)); }}
              placeholder="Select v."
              disabled={verseNumList.length === 0}
              width="w-full"
            />
          </div>
        </div>
      </div>
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="            Search all Strong&apos;s words..."
            value={wordSearch}
            onChange={(e) => setWordSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchWords(wordSearch)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Button size="sm" onClick={() => searchWords(wordSearch)} className="h-9 gap-1 text-xs">
          {wordsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          Search
        </Button>
      </div>
      {/* Results */}
      {wordsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-[hsl(var(--skeleton))] animate-pulse" />
          ))}
        </div>
      ) : words.length > 0 ? (
        <div className="space-y-3">
          {verseBook && verseChapter && verseNum && (
            <p className="px-1 text-xs font-medium text-muted-foreground">
              Strong&apos;s entries and verse-specific study notes
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {words.map((w) => (
            <WordCard
              key={`${w.strongsId}-${w.verseNumber ?? "entry"}`}
              word={w}
              onClick={() => { setDetailWord(w); setDetailSheetOpen(true); }}
            />
          ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No words found in the current search or verse.</p>
        </div>
      )}
      <div ref={loadMoreRef} className="flex min-h-10 items-center justify-center">
        {wordsLoadingMore && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        {!wordsLoadingMore && words.length > 0 && !wordsHasMore && <p className="text-xs text-muted-foreground">You&apos;ve reached the end of the word list.</p>}
      </div>
      {/* Detail Sheet */}
      <WordDetailSheet
        word={detailWord}
        wordEntry={detailWord}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </div>
  );
}

export default WordsTab;

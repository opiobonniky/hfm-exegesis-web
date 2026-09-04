"use client";

import { Search, Loader2, Plus, BookText } from "lucide-react";
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
    verseBook, handleBookChange, verseChapter, handleChapterChange,
    verseNum, setVerseNum, verseChapList, verseNumList,
    detailWord, setDetailWord, detailSheetOpen, setDetailSheetOpen,
  } = state;

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
            placeholder="Search Strong's words..."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {words.map((w) => (
            <WordCard
              key={w.strongsNumber}
              word={w}
              onClick={() => { setDetailWord(w); setDetailSheetOpen(true); }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No words found. Search by Strong's number or browse by verse.</p>
        </div>
      )}
      {/* Detail Sheet */}
      <WordDetailSheet
        word={detailWord}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
      />
    </div>
  );
}

export default WordsTab;

import { BookOpen, BookText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { SUGGESTED_PASSAGES, MAX_CHAPTERS } from "../constants";

interface Props {
  bookName: string;
  chapter: string;
  verseStart: string;
  verseEnd: string;
  previewText: string;
  previewLoading: boolean;
  maxChapters: number;
  bookNames: string[];
  onStart: () => void;
  onUpdate: (data: any) => void;
}
export default function LabFlowPassageSelector({
  bookName, chapter, verseStart, verseEnd, previewText, previewLoading,
  maxChapters, bookNames, onStart, onUpdate,
}: Props) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Hero */}
      <div className="flex flex-col items-center pb-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-lg shadow-primary/10 ring-1 ring-primary/10">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground text-center tracking-tight">Choose Your Passage</h2>
        <p className="text-sm text-muted-foreground/70 text-center max-w-sm mt-1.5 leading-relaxed">Select the Scripture you want to study through the 4-step journey.</p>
      </div>
      {/* Book selection */}
      <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm">
        <div className="p-4 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 text-primary/60" /></div>
            <p className="text-xs font-bold text-foreground">Book</p>
          </div>
        <div className="p-4">
          <Combobox options={bookNames.map((b) => ({ value: b, label: b }))} value={bookName || ""} onChange={(value) => onUpdate({ bookName: value, chapter: "", verseStart: "", verseEnd: "" })} placeholder="Select a book..." searchPlaceholder="Search 66 books..." width="w-full" />
          <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">Type to search — OT: 39 books, NT: 27 books</p>
      {/* Chapter selection */}
      {bookName && (
        <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm">
          <div className="p-4 pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center"><BookText className="w-3.5 h-3.5 text-primary/60" /></div>
              <p className="text-xs font-bold text-foreground">Chapter</p>
            </div>
          <div className="p-4">
            <Combobox options={Array.from({ length: maxChapters }, (_, i) => ({ value: String(i + 1), label: `Chapter ${i + 1}` }))} value={chapter || ""} onChange={(value) => onUpdate({ chapter: value, verseStart: "", verseEnd: "" })} placeholder={`Select chapter (1\u2013${maxChapters})...`} searchPlaceholder="Search chapters..." width="w-full" />
            <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">{bookName} has {maxChapters} chapter{maxChapters !== 1 ? "s" : ""}</p>
      )}
      {/* Verse selection */}
      {bookName && chapter && (
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-primary/60" /></div>
              <p className="text-xs font-bold text-foreground">Verse(s)</p>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1.5">Start verse</p>
              <Combobox options={Array.from({ length: 176 }, (_, i) => ({ value: String(i + 1), label: `Verse ${i + 1}` }))} value={verseStart || ""} onChange={(value) => onUpdate({ verseStart: value })} placeholder="Select start verse..." searchPlaceholder="Search..." width="w-full" />
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1.5">End verse (optional)</p>
              <Combobox options={Array.from({ length: 176 }, (_, i) => ({ value: String(i + 1), label: `Verse ${i + 1}` }))} value={verseEnd || ""} onChange={(value) => onUpdate({ verseEnd: value })} placeholder="Select end verse for range..." searchPlaceholder="Search..." width="w-full" />
      {/* Preview */}
      {bookName && chapter && verseStart && (
        <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm p-4">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Preview</p>
          {previewLoading ? <p className="text-xs text-muted-foreground/50">Loading preview...</p> : previewText ? <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">{previewText}</p> : <p className="text-xs text-muted-foreground/50">No preview available</p>}
      {/* Suggested passages */}
      {!bookName && (
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-3">Suggested Passages</p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_PASSAGES.map((p) => {
              const match = p.ref.match(/^(.+?)\s+(\d+):(\d+)$/);
              const book = match?.[1] || "";
              const ch = match?.[2] || "";
              const v = match?.[3] || "";
              return (
                <button key={p.ref} onClick={() => onUpdate({ bookName: book, chapter: ch, verseStart: v, verseEnd: "" })} className="rounded-xl bg-card border border-border p-3 text-left hover:bg-muted/50 hover:border-primary/30 transition-all active:scale-[0.98]">
                  <p className="text-xs font-bold text-foreground">{p.ref}</p>
                  <p className="text-[11px] text-primary font-semibold mt-0.5">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{p.desc}</p>
                </button>
              );
            })}
      <p className="text-[11px] text-muted-foreground/40 text-center leading-relaxed pb-4">Enter a verse number to study a single verse, or add an end verse for a range.</p>
      {/* Start button */}
        <Button onClick={onStart} className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-primary/80">
          Start Study Journey
        </Button>
    </div>
  );

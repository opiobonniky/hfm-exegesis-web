import { useState } from "react";
import { BookOpen, ChevronRight, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_CHAPTERS, SUGGESTED_PASSAGES } from "@/features/Lab/constants";
import { BOOK_NAMES } from "../constants";

interface Props {
  bookName: string;
  chapter: string;
  verseStart: string;
  verseEnd: string;
  loading: boolean;
  previewText: string;
  previewLoading: boolean;
  onSelectBook: (book: string) => void;
  onSelectChapter: (ch: string) => void;
  onSelectVerseStart: (v: string) => void;
  onSelectVerseEnd: (v: string) => void;
  onBeginStudy: () => void;
}

export default function LabPassageSelector({
  bookName, chapter, verseStart, verseEnd, loading, previewText, previewLoading,
  onSelectBook, onSelectChapter, onSelectVerseStart, onSelectVerseEnd, onBeginStudy,
}: Props) {
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"book" | "chapter" | "verse">(bookName ? (chapter ? "verse" : "chapter") : "book");

  const maxCh = bookName ? (MAX_CHAPTERS[bookName] || 31) : 31;
  const maxVerse = chapter ? 50 : 31; // simplified
  const filteredBooks = BOOK_NAMES.filter((b) => b.toLowerCase().includes(search.toLowerCase()));
  const isReady = bookName && chapter && verseStart;

  const handleBookSelect = (book: string) => {
    onSelectBook(book);
    setStep("chapter");
  };

  const handleChapterSelect = (ch: string) => {
    onSelectChapter(ch);
    setStep("verse");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 ring-1 ring-primary/10">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
            Choose Your Passage
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Select a Bible passage to begin your 5-stage study journey
          </p>
        </div>

        {/* Suggested passages */}
        {!bookName && (
          <div className="mb-8">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Suggested Passages</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUGGESTED_PASSAGES.map((sp) => {
                const [book, ch, vs] = sp.ref.replace(/:/g, " ").split(" ");
                return (
                  <button key={sp.ref}
                    onClick={() => { onSelectBook(book); onSelectChapter(ch); onSelectVerseStart(vs); onSelectVerseEnd(vs); setStep("verse"); }}
                    className="group p-3 rounded-xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-sm text-left transition-all">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{sp.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sp.desc}</p>
                    <p className="text-[10px] font-mono text-primary/60 mt-1">{sp.ref}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <span className={cn("font-semibold", step === "book" && "text-primary")}>Book</span>
          <ChevronRight className="w-3 h-3" />
          <span className={cn("font-semibold", step === "chapter" && "text-primary")}>Chapter</span>
          <ChevronRight className="w-3 h-3" />
          <span className={cn("font-semibold", step === "verse" && "text-primary")}>Verse</span>
        </div>

        {/* Book picker */}
        {step === "book" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books..." autoFocus
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40" />
            </div>
            <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-border/40 bg-card divide-y divide-border/20">
              {filteredBooks.map((book) => (
                <button key={book} onClick={() => handleBookSelect(book)}
                  className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors">
                  {book}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chapter picker */}
        {step === "chapter" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{bookName}</span> — Select a chapter
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-[50vh] overflow-y-auto">
              {Array.from({ length: maxCh }, (_, i) => i + 1).map((ch) => (
                <button key={ch} onClick={() => handleChapterSelect(String(ch))}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-medium transition-all",
                    chapter === String(ch) ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border/40 hover:border-primary/30 hover:bg-primary/5"
                  )}>
                  {ch}
                </button>
              ))}
            </div>
            <button onClick={() => setStep("book")} className="text-xs text-muted-foreground hover:text-foreground">
              ← Change book
            </button>
          </div>
        )}

        {/* Verse picker */}
        {step === "verse" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{bookName} {chapter}</span> — Select verse range
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">From Verse</label>
                <select value={verseStart} onChange={(e) => onSelectVerseStart(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select...</option>
                  {Array.from({ length: maxVerse }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To Verse (optional)</label>
                <select value={verseEnd} onChange={(e) => onSelectVerseEnd(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Same verse</option>
                  {Array.from({ length: maxVerse }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview */}
            {verseStart && (
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Passage Preview</p>
                {previewLoading ? (
                  <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-4 bg-[hsl(var(--skeleton))] rounded animate-pulse" />)}</div>
                ) : previewText ? (
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{previewText}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Select a verse to preview</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep("chapter")} className="text-xs text-muted-foreground hover:text-foreground">
                ← Change chapter
              </button>
            </div>
          </div>
        )}

        {/* Begin Study button */}
        {isReady && (
          <div className="mt-8 flex justify-center">
            <button onClick={onBeginStudy} disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50">
              <Sparkles className="w-4 h-4" />
              {loading ? "Starting study..." : "Begin Study"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

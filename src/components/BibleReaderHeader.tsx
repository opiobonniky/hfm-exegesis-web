import { type Dispatch, type SetStateAction } from "react";
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  VolumeX,
  Lightbulb,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { type TranslationOption } from "@/lib/bibleHelpers";
import MobileNavDrawer from "@/components/MobileNavDrawer";

// ── Props ──────────────────────────────────────────────────────────────────────

export interface BibleReaderHeaderProps {
  selectedBook: string;
  displayBook: string;
  displayChapter: number;
  selectedVerse: number | null;
  versionId: string;
  isSpeaking: boolean;
  voiceMode: "chapter" | "selected" | null;
  booksLoading: boolean;
  backendBooks: { bookNumber: number; bookName: string; maxChapter: number }[];
  filteredBooks: string[];
  maxChapterForDisplay: number;
  currentChapterVerseCount: number;
  effectiveTranslations: TranslationOption[];
  filteredTranslations: TranslationOption[];
  translationOpen: boolean;
  translationSearch: string;
  setTranslationOpen: Dispatch<SetStateAction<boolean>>;
  setTranslationSearch: Dispatch<SetStateAction<string>>;
  onBookChange: (book: string) => void;
  onChapterChange: (ch: number) => void;
  onVerseChange: (verseStr: string) => void;
  onVersionChange: (versionId: string) => void;
  onReadChapter: () => void;
  onOpenStudyTools: () => void;
  onOpenSearch: () => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  showBackToQuiz?: boolean;
  onBackToQuiz?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function BibleReaderHeader({
  selectedBook,
  displayBook,
  displayChapter,
  selectedVerse,
  versionId,
  isSpeaking,
  voiceMode,
  booksLoading,
  backendBooks,
  filteredBooks,
  maxChapterForDisplay,
  currentChapterVerseCount,
  effectiveTranslations,
  filteredTranslations,
  translationOpen,
  translationSearch,
  setTranslationOpen,
  setTranslationSearch,
  onBookChange,
  onChapterChange,
  onVerseChange,
  onVersionChange,
  onReadChapter,
  onOpenStudyTools,
  onOpenSearch,
  onPrevChapter,
  onNextChapter,
  showBackToQuiz,
  onBackToQuiz,
}: BibleReaderHeaderProps) {
  const { t, isRtl } = useLanguage();

  const bookNames = backendBooks.map((b) => b.bookName);
  const isAtVeryStart =
    bookNames.length > 0 &&
    bookNames[0] === displayBook &&
    displayChapter === 1;
  const isAtVeryEnd =
    bookNames.length > 0 &&
    bookNames[bookNames.length - 1] === displayBook &&
    displayChapter >= maxChapterForDisplay;

  const currentVersion = (() => {
    const trans = effectiveTranslations.find((tr) => tr.id === versionId);
    return trans
      ? { abbreviation: trans.shortName, name: trans.name }
      : { abbreviation: versionId, name: versionId };
  })();

  return (
    <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      {/* ─── Desktop top bar (hidden on mobile) ─── */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/40">
        {showBackToQuiz && onBackToQuiz ? (
          <button
            onClick={onBackToQuiz}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden lg:inline">Back to Quiz</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1
                className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {t.bibleReader.scripture}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                {t.bibleReader.title}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant={isSpeaking && voiceMode === "chapter" ? "default" : "outline"}
            size="sm"
            onClick={onReadChapter}
            className="h-8 px-3 text-xs gap-1.5"
          >
            {isSpeaking && voiceMode === "chapter" ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                {t.bibleReader.stopReading}
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                {t.bibleReader.readChapter}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenStudyTools}
            className="h-8 px-2.5 text-xs gap-1.5 border-border/50 bg-muted/30"
            title="Study Tools"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">Tools</span>
          </Button>

          <button
            onClick={onOpenSearch}
            className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-xl rounded-xl bg-muted/50 flex items-center justify-center border border-border/40 active:scale-95 transition-all [touch-action:manipulation]"
            title="Search"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          <Popover open={translationOpen} onOpenChange={setTranslationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] h-8 text-xs border-border/50 bg-muted/30 justify-between font-normal"
              >
                <span className="truncate">
                  {effectiveTranslations.find((t2) => t2.id === versionId)
                    ?.name || t.bibleReader.selectVersion}
                </span>
                <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[220px] max-h-[560px] p-0"
              align="start"
            >
              <div className="p-2 border-b border-border/40">
                <Input
                  placeholder={t.bibleReader.searchTranslations}
                  value={translationSearch}
                  onChange={(e) => setTranslationSearch(e.target.value)}
                  className="h-7 text-xs"
                  autoFocus
                />
              </div>
              <ScrollArea className="max-h-[500px]">
                <div className="py-1">
                  {filteredTranslations.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                      {t.bibleReader.noTranslations}
                    </div>
                  ) : (
                    filteredTranslations.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          onVersionChange(v.id);
                          setTranslationSearch("");
                          setTranslationOpen(false);
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-xs text-left hover:bg-muted transition-colors",
                          versionId === v.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground",
                        )}
                      >
                        {v.name}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ─── Desktop book + chapter row (hidden on mobile) ─── */}
      <div className="hidden sm:flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border/40">
        <Select
          value={selectedBook}
          onValueChange={onBookChange}
          disabled={booksLoading || backendBooks.length === 0}
        >
          <SelectTrigger aria-label="Select book" className="w-[175px] h-8 text-xs border-border/50 bg-muted/30">
            <SelectValue
              placeholder={booksLoading ? t.bibleReader.loadingBooks : t.bibleReader.selectBook}
            />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[300px]">
              {filteredBooks.map((book) => (
                <SelectItem key={book} value={book} className="text-xs">
                  {book}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <Select
          value={displayChapter.toString()}
          onValueChange={(val) => onChapterChange(parseInt(val, 10))}
          disabled={booksLoading || backendBooks.length === 0}
        >
          <SelectTrigger aria-label="Select chapter" className="w-[130px] h-8 text-xs border-border/50 bg-muted/30">
            <SelectValue
              placeholder={booksLoading ? t.bibleReader.loadingBooks : t.bibleReader.selectChapter}
            />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {backendBooks.length > 0 ? (
                Array.from(
                  { length: maxChapterForDisplay },
                  (_, i) => i + 1,
                ).map((ch) => (
                  <SelectItem
                    key={ch}
                    value={ch.toString()}
                    className="text-xs"
                  >
                    {t.bibleReader.chapterLabel.replace('{n}', String(ch))}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="1" disabled>
                  {t.bibleReader.loadingBooks}
                </SelectItem>
              )}
            </ScrollArea>
          </SelectContent>
        </Select>

        {/* Verse select */}
        <Select
          value={selectedVerse?.toString() || ""}
          onValueChange={onVerseChange}
          disabled={currentChapterVerseCount === 0}
        >
          <SelectTrigger aria-label="Select verse" className="w-[130px] h-8 text-xs border-border/50 bg-muted/30">
            <SelectValue placeholder={t.bibleReader.selectVerse} />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {currentChapterVerseCount > 0 ? (
                Array.from(
                  { length: currentChapterVerseCount },
                  (_, i) => i + 1,
                ).map((v) => (
                  <SelectItem
                    key={v}
                    value={v.toString()}
                    className="text-xs"
                  >
                    {t.bibleReader.verseNum.replace("{n}", String(v))}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="-" disabled className="text-xs">
                  {t.bibleReader.loadingBooks}
                </SelectItem>
              )}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      {/* ─── Mobile top bar ─── */}
      <div className="flex sm:hidden items-center gap-2 px-3 py-2.5 border-b border-border/40">
        {showBackToQuiz && onBackToQuiz ? (
          <button
            onClick={onBackToQuiz}
            className="flex items-center justify-center w-7 h-7 shrink-0 rounded-lg bg-muted/50 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
          </div>
        )}

        {/* Mobile nav drawer (book + chapter + version) */}
        <div className="flex-1 min-w-0">
          <MobileNavDrawer
            selectedBook={selectedBook}
            selectedChapter={displayChapter}
            selectedVerse={selectedVerse}
            versionId={versionId}
            maxChapter={maxChapterForDisplay}
            onBookChange={onBookChange}
            onChapterChange={onChapterChange}
            onVerseChange={onVerseChange}
            onVersionChange={onVersionChange}
            books={backendBooks.map((b) => b.bookName)}
            availableTranslations={effectiveTranslations}
            verseCount={currentChapterVerseCount}
            onOpenStudyTools={onOpenStudyTools}
          />
        </div>

        {/* Mobile study tools */}
        <button
          onClick={onOpenStudyTools}
          className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-xl rounded-xl bg-muted/50 flex items-center justify-center border border-border/40 active:scale-95 transition-all [touch-action:manipulation]"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        </button>

        {/* Search button */}
        <button
          onClick={onOpenSearch}
          className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-xl rounded-xl bg-muted/50 flex items-center justify-center border border-border/40 active:scale-95 transition-all [touch-action:manipulation]"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Read button — mobile */}
        <button
          onClick={onReadChapter}
          className={cn(
            "relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-xl rounded-xl flex items-center justify-center border transition-all active:scale-95 [touch-action:manipulation]",
            isSpeaking && voiceMode === "chapter"
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-muted/50 border-border/40 text-muted-foreground",
          )}
        >
          {isSpeaking && voiceMode === "chapter" ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* ─── Chapter nav (both mobile + desktop) ─── */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2">
        <button
          onClick={onPrevChapter}
          disabled={isAtVeryStart}
          className="relative flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 before:absolute before:content-[''] before:-inset-2 before:rounded-lg rounded-lg text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 hover:bg-muted/50 transition-all active:scale-95 [touch-action:manipulation]"
        >
          <ChevronLeft className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
          <span className="hidden sm:inline">
            {(() => {
              const bookNames = backendBooks.map((b) => b.bookName);
              const idx = bookNames.indexOf(displayBook);
              return displayChapter > 1
                ? `${t.bibleReader.chShort} ${displayChapter - 1}`
                : idx > 0
                  ? bookNames[idx - 1]
                  : t.bibleReader.prevShort;
            })()}
          </span>
          <span className="sm:hidden text-xs">{t.bibleReader.prevShort}</span>
        </button>

        <div className="text-center">
          <p
            className="text-xs sm:text-sm font-medium text-foreground tracking-wide leading-none"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {displayBook}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
            {t.bibleReader.chOf.replace('{n}', String(displayChapter)).replace('{total}', String(maxChapterForDisplay))}
            <span className="mx-1 opacity-40">·</span>
            <span className="text-primary/80">
              {currentVersion?.abbreviation || versionId}
            </span>
          </p>
        </div>

        <button
          onClick={onNextChapter}
          disabled={isAtVeryEnd}
          className="relative flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 before:absolute before:content-[''] before:-inset-2 before:rounded-lg rounded-lg text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 hover:bg-muted/50 transition-all active:scale-95 [touch-action:manipulation]"
        >
          <span className="hidden sm:inline">
            {(() => {
              const bookNames = backendBooks.map((b) => b.bookName);
              const idx = bookNames.indexOf(displayBook);
              return displayChapter < maxChapterForDisplay
                ? `${t.bibleReader.chShort} ${displayChapter + 1}`
                : idx >= 0 && idx < bookNames.length - 1
                  ? bookNames[idx + 1]
                  : t.bibleReader.endLabel;
            })()}
          </span>
          <span className="sm:hidden text-xs">{t.bibleReader.nextShort}</span>
          <ChevronRight className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
        </button>
      </div>
    </header>
  );
}

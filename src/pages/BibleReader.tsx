import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookOpen,
  Star,
  Highlighter,
  X,
  Copy,
  Share2,
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  BookMarked,
  Menu,
  ChevronUp as ArrowUp,
  PenLine,
  Lightbulb,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest, TOKEN_KEY } from "@/services/api";
import { bibleApi, mapTranslationId, mapFrontendId } from "@/services/bibleApi";
import {
  HighlightPickerModal,
  SearchModal,
  NoteModal,
  RangePickerModal,
} from "@/components/BibleModals";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";

interface Highlight {
  id?: number;
  verseKey: string;
  color: string;
  colorId: number;
  note?: string;
}

interface VerseData {
  verseNumber: number;
  text: string;
}

interface ChapterData {
  book: string;
  chapter: number;
  verses: { key: string; text: string; num: number }[];
}

interface SpeechItem {
  verseKey: string;
  verseNum: number;
  text: string;
}

interface TranslationOption {
  id: string;
  name: string;
  shortName: string;
  year?: string | null;
}

const HIGHLIGHT_COLORS = [
  { id: 1, name: "Red", color: "#F87171" },
  { id: 3, name: "Yellow", color: "#FACC15" },
  { id: 4, name: "Orange", color: "#F97316" },
  { id: 13, name: "Pink", color: "#EC4899" },
  { id: 14, name: "Rose", color: "#FB7185" },
  { id: 15, name: "Amber", color: "#F59E0B" },
  { id: 2, name: "Blue", color: "#3B82F6" },
  { id: 7, name: "Cyan", color: "#06B6D4" },
  { id: 8, name: "Teal", color: "#0D9488" },
  { id: 9, name: "Sky", color: "#38BDF8" },
  { id: 10, name: "Indigo", color: "#6366F1" },
  { id: 5, name: "Green", color: "#22C55E" },
  { id: 6, name: "Purple", color: "#A855F7" },
  { id: 11, name: "Lime", color: "#84CC16" },
  { id: 12, name: "Mint", color: "#2DD4BF" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function renderVerseText(text: string) {
  return text.split("[").map((part, idx) => {
    if (idx === 0) return part;
    const close = part.indexOf("]");
    if (close === -1) return part;
    return (
      <span key={idx} className="italic text-muted-foreground">
        {part.substring(0, close)}
      </span>
    );
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "…";
}

function parseVerseKey(key: string) {
  const match = key.match(/^(.+)\s+(\d+):(\d+)$/);
  if (!match) return null;
  return {
    book: match[1],
    chapter: parseInt(match[2]),
    verse: parseInt(match[3]),
  };
}

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function TextContent({ text }: { text?: string | null }) {
  if (!text) return null;
  const paragraphs = text.replace(/\r/g, "").split(/\n\s*\n/).filter(Boolean);
  return (
    <div className="text-sm sm:text-base leading-relaxed text-foreground/80">
      {paragraphs.map((para, pi) => {
        const lines = para.split("\n").map((s) => s.trim()).filter(Boolean);
        const isBulletList = lines.some((l) => /^(\-|\*|•|\d+\.)\s+/.test(l));
        if (isBulletList) {
          return (
            <div key={pi} className="space-y-2 mb-4">
              {lines.map((line, li) => {
                const isBullet = /^(\-|\*|•|\d+\.)\s+/.test(line);
                if (isBullet) {
                  return (
                    <div key={li} className="flex gap-3 items-start">
                      <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="leading-7 sm:leading-8">
                        {line.replace(/^(\-|\*|•|\d+\.)\s+/, "")}
                      </span>
                    </div>
                  );
                }
                return (
                  <p key={li} className="leading-7 sm:leading-8">
                    {line}
                  </p>
                );
              })}
            </div>
          );
        }
        return (
          <p key={pi} className="leading-7 sm:leading-8 mb-4 last:mb-0">
            {lines.join(" ")}
          </p>
        );
      })}
    </div>
  );
}

// ── Mobile Navigation Drawer ─────────────────────────────────────────────────

function MobileNavDrawer({
  selectedBook,
  selectedChapter,
  selectedVerse,
  versionId,
  maxChapter,
  onBookChange,
  onChapterChange,
  onVerseChange,
  onVersionChange,
  books,
  availableTranslations,
  verseCount,
}: {
  selectedBook: string;
  selectedChapter: number;
  selectedVerse: number | null;
  versionId: string;
  maxChapter: number;
  onBookChange: (b: string) => void;
  onChapterChange: (c: number) => void;
  onVerseChange: (v: string) => void;
  onVersionChange: (v: string) => void;
  books: string[];
  availableTranslations: { id: string; name: string; shortName: string }[];
  verseCount: number;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [bookFilter, setBookFilter] = useState("");
  const [tab, setTab] = useState<"books" | "chapters" | "verses" | "version">("books");

  const filtered = useMemo(
    () =>
      bookFilter
        ? books.filter((b) =>
            b.toLowerCase().includes(bookFilter.toLowerCase()),
          )
        : books,
    [bookFilter, books],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/40 transition-all active:scale-95">
          <Menu className="w-4 h-4 text-muted-foreground" />
          <span
            className="text-sm font-medium text-foreground max-w-[100px] truncate"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {selectedBook}
          </span>
          <span className="text-xs text-muted-foreground">
            {selectedChapter}
          </span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-2xl p-0 flex flex-col"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-4 pb-3 pt-1 border-b border-border/40">
          {(["books", "chapters", "verses", "version"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all",
                tab === tabKey
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {{
                books: t.common.search,
                chapters: t.bibleReader.selectChapter,
                verses: t.bibleReader.selectVerse,
                version: t.bibleReader.translation,
              }[tabKey] || tabKey}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-4 pb-safe">
          {tab === "books" && (
            <div className="flex flex-col h-full gap-3 pt-3">
              <Input
                placeholder={t.bibleReader.filterBooks}
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                className="h-9 text-sm"
              />
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 gap-1.5 pb-6">
                  {filtered.map((book) => (
                    <button
                      key={book}
                      onClick={() => {
                        onBookChange(book);
                        setOpen(false);
                      }}
                      className={cn(
                        "text-left px-3 py-2.5 rounded-xl text-sm transition-all active:scale-95",
                        selectedBook === book
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted/50 hover:bg-muted text-foreground",
                      )}
                    >
                      {book}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {tab === "chapters" && (
            <ScrollArea className="h-full pt-3">
              <div className="grid grid-cols-5 gap-2 pb-6">
                {Array.from({ length: maxChapter }, (_, i) => i + 1).map(
                  (ch) => (
                    <button
                      key={ch}
                      onClick={() => {
                        onChapterChange(ch);
                        setOpen(false);
                      }}
                      className={cn(
                        "aspect-square rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center",
                        selectedChapter === ch
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 hover:bg-muted text-foreground",
                      )}
                    >
                      {ch}
                    </button>
                  ),
                )}
              </div>
            </ScrollArea>
          )}

          {tab === "verses" && (
            <ScrollArea className="h-full pt-3">
              <div className="grid grid-cols-5 gap-2 pb-6">
                {verseCount > 0 ? (
                  Array.from({ length: verseCount }, (_, i) => i + 1).map(
                    (v) => (
                      <button
                        key={v}
                        onClick={() => {
                          onVerseChange(v.toString());
                          setOpen(false);
                        }}
                        className={cn(
                          "aspect-square rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center",
                          selectedVerse === v
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 hover:bg-muted text-foreground",
                        )}
                      >
                        {v}
                      </button>
                    ),
                  )
                ) : (
                  <div className="col-span-5 text-center text-xs text-muted-foreground py-8">
                    {t.bibleReader.loadingBooks}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {tab === "version" && (
            <div className="pt-3 space-y-2">
              {availableTranslations.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    onVersionChange(v.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all active:scale-95",
                    versionId === v.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted text-foreground",
                  )}
                >
                  <span className="font-semibold">{v.shortName}</span>
                  <span
                    className={cn(
                      "text-xs",
                      versionId === v.id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {v.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Toolbar button ────────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  icon,
  label,
  compact,
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-full hover:bg-muted/50 active:bg-muted transition-colors whitespace-nowrap"
    >
      {icon}
      {!compact && <span className="hidden sm:inline">{label}</span>}
      {compact && <span>{label}</span>}
    </button>
  );
}

// ── Voice Player Bar ──────────────────────────────────────────────────────────

function VoicePlayerBar({
  currentItem,
  currentIndex,
  total,
  progress,
  isPaused,
  voiceMode,
  displayBook,
  displayChapter,
  canSkipBack,
  canSkipForward,
  repeatMode,
  afterPlay,
  speechRate,
  sleepTimerRemaining,
  onPauseResume,
  onStop,
  onSkipBack,
  onSkipForward,
  onToggleRepeat,
  onToggleAfterPlay,
  onSpeechRateChange,
  onSleepTimerChange,
}: {
  currentItem: SpeechItem | null;
  currentIndex: number;
  total: number;
  progress: number;
  isPaused: boolean;
  voiceMode: "chapter" | "selected" | null;
  displayBook: string;
  displayChapter: number;
  canSkipBack: boolean;
  canSkipForward: boolean;
  repeatMode: "none" | "one" | "all";
  afterPlay: "continue" | "stop";
  speechRate: number;
  sleepTimerRemaining: number;
  onPauseResume: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleRepeat: () => void;
  onToggleAfterPlay: () => void;
  onSpeechRateChange: (rate: number) => void;
  onSleepTimerChange: (minutes: number | null) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none">
      <div
        className="max-w-2xl mx-auto rounded-2xl border border-border/70 shadow-2xl overflow-hidden pointer-events-auto"
        style={{
          background: "hsl(var(--background) / 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Progress */}
        <div className="h-[3px] w-full bg-muted/50">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5">
          {/* Left Section: Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
            <div
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                isPaused ? "bg-muted" : "bg-primary/10",
              )}
            >
              {isPaused ? (
                <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1 truncate">
                {voiceMode === "chapter"
                  ? `${displayBook} · ${t.bibleReader.chShort} ${displayChapter}`
                  : t.bibleReader.selectedVerses}
              </p>
              <div className="flex items-center gap-2 overflow-hidden">
                <p
                  className="text-sm sm:text-base font-semibold text-foreground truncate leading-tight"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {currentItem ? t.bibleReader.verseNum.replace('{n}', String(currentItem.verseNum)) : "—"}
                </p>
                <button
                  onClick={onToggleAfterPlay}
                  className={cn(
                    "flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter transition-colors",
                    afterPlay === "continue"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground border border-transparent",
                  )}
                >
                  {afterPlay === "continue" ? t.bibleReader.continueOn : t.bibleReader.autoStop}
                </button>
              </div>
            </div>

            {/* Counter */}
            <div className="flex-shrink-0 tabular-nums text-xs text-muted-foreground min-w-[40px] text-center bg-muted/30 py-1 px-2 rounded-lg">
              <span className="font-medium text-foreground">
                {currentIndex + 1}
              </span>
              <span className="opacity-40 mx-0.5">/</span>
              {total}
            </div>
          </div>

          {/* Right Section: Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={onToggleRepeat}
                title={t.bibleReader.repeatModeLabel.replace('{mode}', repeatMode)}
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-95",
                  repeatMode !== "none"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
                {repeatMode === "all" && (
                  <span className="absolute text-[8px] font-bold mt-3">
                    {t.bibleReader.repeatAll}
                  </span>
                )}
              </button>

              {/* Speed Control */}
              <button
                onClick={() => {
                  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
                  const currentIdx = speeds.indexOf(speechRate);
                  const nextIdx = (currentIdx + 1) % speeds.length;
                  onSpeechRateChange(speeds[nextIdx]);
                }}
                title={`${t.bibleReader.speedX.replace('{rate}', String(speechRate))}`}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all font-bold text-xs"
              >
                {t.bibleReader.speedX.replace('{rate}', String(speechRate))}
              </button>

              {/* Sleep Timer */}
              <button
                onClick={() => {
                  const options: (number | null)[] = [null, 5, 15, 30, 60];
                  const currentIdx =
                    sleepTimerRemaining > 0
                      ? options.findIndex(
                          (o) => o !== null && o * 60 === sleepTimerRemaining,
                        )
                      : 0;
                  const nextIdx =
                    currentIdx === -1 ? 1 : (currentIdx + 1) % options.length;
                  onSleepTimerChange(options[nextIdx]);
                }}
                title={
                  sleepTimerRemaining > 0
                    ? `${t.bibleReader.setSleepTimer}: ${Math.floor(sleepTimerRemaining / 60)}m ${sleepTimerRemaining % 60}s`
                    : t.bibleReader.setSleepTimer
                }
                className={cn(
                  "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center active:scale-95 transition-all font-bold text-xs",
                  sleepTimerRemaining > 0
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {sleepTimerRemaining > 0 ? (
                  <span>{t.bibleReader.sleepMins.replace('{n}', String(Math.ceil(sleepTimerRemaining / 60)))}</span>
                ) : (
                  <span>💤</span>
                )}
              </button>

              <button
                onClick={onSkipBack}
                disabled={!canSkipBack}
                title={t.bibleReader.previousVerse}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onPauseResume}
                title={isPaused ? t.bibleReader.resumeAudio : t.bibleReader.pauseAudio}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20 transition-all mx-0.5"
              >
                {isPaused ? (
                  <Play className="w-4.5 h-4.5 ml-0.5" />
                ) : (
                  <Pause className="w-4.5 h-4.5" />
                )}
              </button>

              <button
                onClick={onSkipForward}
                disabled={!canSkipForward && afterPlay !== "continue"}
                title={t.bibleReader.nextVerse}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-5 bg-border/50 mx-1 hidden sm:block" />

            <button
              onClick={onStop}
              title={t.bibleReader.stopAudio}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BibleReader() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);
  const [searchParams] = useSearchParams();

  const urlBook = searchParams.get("book");
  const urlChapter = searchParams.get("chapter");

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Cinzel:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // ── State ──
  const [selectedBook, setSelectedBook] = useState(urlBook || "Genesis");
  const [selectedChapter, setSelectedChapter] = useState(
    urlChapter ? parseInt(urlChapter, 10) : 1,
  );
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [versionId, setVersionId] = useState("Berean");
  const [bookFilter, setBookFilter] = useState("");
  const [displayBook, setDisplayBook] = useState(urlBook || "Genesis");
  const [displayChapter, setDisplayChapter] = useState(
    urlChapter ? parseInt(urlChapter, 10) : 1,
  );
  const [availableTranslations, setAvailableTranslations] = useState<
    TranslationOption[]
  >([]);
  const [backendBooks, setBackendBooks] = useState<
    { bookNumber: number; bookName: string; maxChapter: number }[]
  >([]);
  const [booksLoading, setBooksLoading] = useState(false);

  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<string, HTMLDivElement>>({});
  const verseRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const isNavigatingRef = useRef(false);
  const loadingRef = useRef(false);
  const scrollObserverRef = useRef<IntersectionObserver | null>(null);

  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<Record<string, Highlight>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>({});

  const [verseExplanationMap, setVerseExplanationMap] = useState<
    Record<string, { explanation: string; learnMore?: string; promptIds?: number[] }>
  >({});
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(
    null,
  );
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [expandedFullExplanation, setExpandedFullExplanation] = useState<
    Set<string>
  >(new Set());

  const [verseExplanationPrompts, setVerseExplanationPrompts] = useState<
    Record<string, { id: number; prompt: string; category: string }[]>
  >({});

  const [chapterPrompts, setChapterPrompts] = useState<
    Record<string, { id: number; prompt: string; category: string }[]>
  >({});

  const [allPromptsLoaded, setAllPromptsLoaded] = useState(false);
  const [allPrompts, setAllPrompts] = useState<
    {
      id: number;
      prompt: string;
      category: string;
      bookName: string | null;
      chapter: number | null;
      verseNumber: number | null;
    }[]
  >([]);

  const [voiceMode, setVoiceMode] = useState<"chapter" | "selected" | null>(
    null,
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSpeechIdx, setCurrentSpeechIdx] = useState(0);
  const [speechItems, setSpeechItems] = useState<SpeechItem[]>([]);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");
  const [afterPlay, setAfterPlay] = useState<"continue" | "stop">("continue");
  const [speechRate, setSpeechRate] = useState<number>(0.92);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);

  const speechItemsRef = useRef<SpeechItem[]>([]);
  const currentIdxRef = useRef(0);
  const isReadingRef = useRef(false);
  const isPausedRef = useRef(false);
  const skipRef = useRef<(() => void) | null>(null);
  const repeatModeRef = useRef<"none" | "one" | "all">("none");
  const afterPlayRef = useRef<"continue" | "stop">("continue");
  const voiceModeRef = useRef<"chapter" | "selected" | null>(null);
  const speechRateRef = useRef(0.92);
  const displayBookRef = useRef(displayBook);
  const displayChapterRef = useRef(displayChapter);
  const isSpeedChangingRef = useRef(false);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    afterPlayRef.current = afterPlay;
  }, [afterPlay]);

  useEffect(() => {
    voiceModeRef.current = voiceMode;
  }, [voiceMode]);

  useEffect(() => {
    displayBookRef.current = displayBook;
  }, [displayBook]);

  useEffect(() => {
    displayChapterRef.current = displayChapter;
  }, [displayChapter]);

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  // Sleep timer countdown effect
  useEffect(() => {
    if (sleepTimer && sleepTimer > 0) {
      const interval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev <= 1) {
            // Timer expired - stop speaking
            window.speechSynthesis.cancel();
            isReadingRef.current = false;
            setIsSpeaking(false);
            setIsPaused(false);
            setSleepTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sleepTimer]);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Desktop-only book filter
  const [desktopBookFilter, setDesktopBookFilter] = useState("");

  // Translation search
  const [translationSearch, setTranslationSearch] = useState("");
  const [translationOpen, setTranslationOpen] = useState(false);

  const filteredTranslations = useMemo(() => {
    if (!translationSearch.trim()) return availableTranslations;
    const search = translationSearch.toLowerCase();
    return availableTranslations.filter(
      (tr) =>
        tr.name.toLowerCase().includes(search) ||
        tr.shortName.toLowerCase().includes(search),
    );
  }, [translationSearch, availableTranslations]);

  const currentVersion = useMemo(() => {
    const trans = availableTranslations.find((tr) => tr.id === versionId);
    return trans
      ? { abbreviation: trans.shortName, name: trans.name }
      : { abbreviation: versionId, name: versionId };
  }, [versionId, availableTranslations]);

  const getMaxChapter = (bookName: string): number => {
    const book = backendBooks.find((b) => b.bookName === bookName);
    return book?.maxChapter ?? 1;
  };

  const maxChapterForDisplay = getMaxChapter(displayBook);
  const currentChapterVerseCount = useMemo(
    () =>
      chapters.find(
        (c) => c.book === displayBook && c.chapter === displayChapter,
      )?.verses.length || 0,
    [chapters, displayBook, displayChapter],
  );

  const filteredBooks = useMemo(() => {
    if (backendBooks.length === 0) return [];
    if (!desktopBookFilter) return backendBooks.map((b) => b.bookName);
    return backendBooks
      .map((b) => b.bookName)
      .filter((b) => b.toLowerCase().includes(desktopBookFilter.toLowerCase()));
  }, [desktopBookFilter, backendBooks]);

  // Load available translations and books on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load translations
        const translations = await bibleApi.getTranslations();
        const sorted = [...translations].sort((a, b) => {
          const popular = [
            "Berean",
            "KJV",
            "NIV",
            "ESV",
            "NASB",
            "NLT",
            "BSB",
            "CSB",
          ];
          const aIdx = popular.indexOf(a.id);
          const bIdx = popular.indexOf(b.id);
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
          if (aIdx !== -1) return -1;
          if (bIdx !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
        const options = sorted.map((t) => ({
          id: t.id,
          name: t.year ? `${t.name} (${t.year})` : t.name,
          shortName: t.shortName,
          year: t.year,
        }));
        setAvailableTranslations(options);

        // Load books from Berean translation
        setBooksLoading(true);
        try {
          const backendId = mapTranslationId("Berean");
          const books = await bibleApi.getBooksWithMaxChapters(backendId);
          setBackendBooks(
            books.map((b) => ({
              bookNumber: b.bookNumber,
              bookName: b.bookName,
              maxChapter: b.maxChapter,
            })),
          );
        } catch (err) {
          console.error("Failed to load books:", err);
        } finally {
          setBooksLoading(false);
        }
      } catch (err) {
        console.error("Failed to load translations:", err);
      }
    };
    loadData();
  }, []);

  // ── Data loading ──
  const loadChapters = useCallback(
    async (book: string, startChapter: number, count: number) => {
      if (loadingRef.current) return;
      if (backendBooks.length === 0) return; // Wait for books to load first

      loadingRef.current = true;
      setLoading(true);
      try {
        const translationId = mapTranslationId(versionId);
        const maxChapter = getMaxChapter(book);

        // Determine which chapters to fetch
        const chaptersToFetch: number[] = [];
        for (let i = 0; i < count; i++) {
          const ch = startChapter + i;
          if (ch > maxChapter) break;
          chaptersToFetch.push(ch);
        }

        let loaded: ChapterData[];

        if (chaptersToFetch.length > 1) {
          // Use batch endpoint for multiple chapters — single HTTP round trip
          const batchData = await bibleApi.getVersesBatch(translationId, book, chaptersToFetch);
          loaded = batchData.map((cd) => ({
            book,
            chapter: cd.chapterNumber,
            verses: cd.verses.map((v) => ({
              key: `${book} ${cd.chapterNumber}:${v.verseNumber}`,
              text: v.text,
              num: v.verseNumber,
            })),
          }));
        } else if (chaptersToFetch.length === 1) {
          const ch = chaptersToFetch[0];
          const verseData = await bibleApi.getVerses(translationId, book, ch);
          loaded = [{
            book,
            chapter: ch,
            verses: verseData.verses.map((v) => ({
              key: `${book} ${ch}:${v.verseNumber}`,
              text: v.text,
              num: v.verseNumber,
            })),
          }];
        } else {
          loaded = [];
        }

        setChapters((prev) => {
          const ex = new Set(prev.map((c) => `${c.book}-${c.chapter}`));
          return [
            ...prev,
            ...loaded.filter((c) => !ex.has(`${c.book}-${c.chapter}`)),
          ];
        });
        setHasMore(loaded.length === chaptersToFetch.length);
      } catch (err) {
        console.error("Failed to load chapters:", err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [versionId, backendBooks],
  );

  const loadHighlights = useCallback(
    async (book: string, chapter: number) => {
      if (!isAuthenticated) return;
      try {
        const res = await sendPostRequest("bible", "get-highlights", {
          bookName: book,
          chapter,
        });
        if (res.returnCode === 200 && res.returnData?.highlights) {
          const map: Record<string, Highlight> = {};
          res.returnData.highlights.forEach((h: any) => {
            const key = `${h.bookName} ${h.chapter}:${h.verseNumber}`;
            const col = HIGHLIGHT_COLORS.find((c) => c.id === h.colorId);
            if (col)
              map[key] = {
                id: h.id,
                verseKey: key,
                color: col.color,
                colorId: h.colorId,
                note: h.note,
              };
          });
          setHighlights((prev) => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [isAuthenticated],
  );

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await sendPostRequest("bible", "get-favorites", {});
      if (res.returnCode === 200 && res.returnData?.favorites) {
        setFavorites(
          new Set(
            res.returnData.favorites.map(
              (i: any) => `${i.bookName} ${i.chapter}:${i.verseNumber}`,
            ),
          ),
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, [isAuthenticated]);

  const loadNotes = useCallback(
    async (book: string, chapter: number) => {
      if (!isAuthenticated) return;
      try {
        const res = await sendPostRequest("bible", "get-verse-note", {
          bookName: book,
          chapter,
        });
        if (res.returnCode === 200 && res.returnData) {
          const notes = Array.isArray(res.returnData)
            ? res.returnData
            : res.returnData.notes || [];
          const map: Record<string, string> = {};
          notes.forEach((n: any) => {
            map[`${n.bookName} ${n.chapter}:${n.verseNumber}`] = n.note;
          });
          setVerseNotes((prev) => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [isAuthenticated],
  );

  const loadChapterPrompts = useCallback(
    async (book: string, chapter: number) => {
      const key = `${book}-${chapter}`;
      if (chapterPrompts[key]) return;

      let promptsToUse = allPrompts;

      if (!allPromptsLoaded) {
        try {
          const res = await sendPostRequest("journal", "prompts/get-all", {
            isActive: true,
          });
          if (res.returnCode === 200 && res.returnData) {
            promptsToUse = res.returnData;
            setAllPrompts(res.returnData);
            setAllPromptsLoaded(true);
          }
        } catch (e) {
          console.error(e);
          return;
        }
      }

      const chapterPromptsForChapter = promptsToUse.filter(
        (p: any) =>
          p.bookName === book && p.chapter === chapter && !p.verseNumber,
      );
      setChapterPrompts((prev) => ({
        ...prev,
        [key]: chapterPromptsForChapter,
      }));
    },
    [allPrompts, allPromptsLoaded, chapterPrompts],
  );

  // ── Effects ──
  useEffect(() => {
    chapterRefs.current = {};
    verseRefs.current = {};
    setChapters([]);
    setHasMore(true);
    setDisplayBook(selectedBook);
    setDisplayChapter(selectedChapter);
    loadChapters(selectedBook, selectedChapter, 8);
    if (isAuthenticated) {
      loadHighlights(selectedBook, selectedChapter);
      loadFavorites();
      loadNotes(selectedBook, selectedChapter);
    }
    loadChapterPrompts(selectedBook, selectedChapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, versionId]);

  // Load chapters when backendBooks becomes available (after initial load)
  useEffect(() => {
    if (backendBooks.length > 0 && chapters.length === 0) {
      loadChapters(selectedBook, selectedChapter, 8);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendBooks.length]);

  useEffect(() => {
    const key = `${selectedBook}-${selectedChapter}`;
    const el = chapterRefs.current[key];
    if (el) {
      isNavigatingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    }
    if (isAuthenticated) {
      loadHighlights(selectedBook, selectedChapter);
      loadNotes(selectedBook, selectedChapter);
    }
    loadChapterPrompts(selectedBook, selectedChapter);
  }, [
    selectedChapter,
    selectedBook,
    isAuthenticated,
    loadHighlights,
    loadNotes,
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Infinite scroll: load more chapters when last chapter is visible
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            hasMore &&
            !loadingRef.current &&
            chapters.length > 0
          ) {
            const lastChapter = chapters[chapters.length - 1];
            const nextChapter = lastChapter.chapter + 1;
            const maxChapter = getMaxChapter(lastChapter.book);
            if (nextChapter <= maxChapter) {
              loadChapters(lastChapter.book, nextChapter, 3);
            }
          }
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadChapters, chapters]);

  // Stable observer — created once, never disconnects, so intersection state is never lost.
  useEffect(() => {
    scrollObserverRef.current = new IntersectionObserver(
      (entries) => {
        if (isNavigatingRef.current) return;
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            (!best || entry.intersectionRatio > best.intersectionRatio)
          )
            best = entry;
        }
        if (best) {
          const ck = best.target.getAttribute("data-chapter-key");
          if (!ck) return;
          const ld = ck.lastIndexOf("-");
          const book = ck.substring(0, ld);
          const ch = parseInt(ck.substring(ld + 1), 10);
          if (!book || isNaN(ch)) return;
          setDisplayBook(book);
          setDisplayChapter(ch);
          // NOT updating selectedChapter — prevents scroll fighting
        }
      },
      {
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      },
    );
    return () => {
      scrollObserverRef.current?.disconnect();
      scrollObserverRef.current = null;
    };
  }, []);

  // Observe new chapter elements as they render — doesn't disconnect existing observer.
  useEffect(() => {
    if (chapters.length === 0 || !scrollObserverRef.current) return;
    Object.values(chapterRefs.current).forEach((el) => {
      if (el) scrollObserverRef.current?.observe(el);
    });
  }, [chapters]);

  useEffect(() => {
    if (!isSpeaking || speechItems.length === 0) return;
    const item = speechItems[currentSpeechIdx];
    if (!item) return;
    verseRefs.current[item.verseKey]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentSpeechIdx, isSpeaking, speechItems]);

  // ── Derived ──
  const bookNames = backendBooks.map((b) => b.bookName);
  const isAtVeryStart =
    bookNames.length > 0 &&
    bookNames[0] === displayBook &&
    displayChapter === 1;
  const isAtVeryEnd =
    bookNames.length > 0 &&
    bookNames[bookNames.length - 1] === displayBook &&
    displayChapter >= maxChapterForDisplay;

  // ── Speech ──
  // activeUtteranceRef holds the in-flight utterance so skip/stop can cancel it.
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakOne = (text: string): Promise<void> =>
    new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      const u = new SpeechSynthesisUtterance(text);
      u.rate = speechRateRef.current;
      u.pitch = 1.0;
      activeUtteranceRef.current = u;

      skipRef.current = () => {
        activeUtteranceRef.current = null;
        resolve();
      };

      u.onend = () => {
        activeUtteranceRef.current = null;
        skipRef.current = null;
        resolve();
      };

      u.onerror = (e) => {
        // "interrupted" fires when we cancel() for skip/stop — already resolved via skipRef.
        if (e.error === "interrupted") return;
        activeUtteranceRef.current = null;
        skipRef.current = null;
        resolve();
      };

      window.speechSynthesis.speak(u);
    });

  const advanceToNextChapter = async (): Promise<boolean> => {
    const bookNames = backendBooks.map((b) => b.bookName);
    const currentBookIdx = bookNames.indexOf(displayBookRef.current);
    let nextBook = displayBookRef.current;
    let nextChapter = displayChapterRef.current + 1;

    if (nextChapter > getMaxChapter(displayBookRef.current)) {
      if (currentBookIdx >= 0 && currentBookIdx < bookNames.length - 1) {
        nextBook = bookNames[currentBookIdx + 1];
        nextChapter = 1;
      } else {
        return false;
      }
    }

    try {
      const translationId = mapTranslationId(versionId);
      const verseData = await bibleApi.getVerses(
        translationId,
        nextBook,
        nextChapter,
      );
      const verses = verseData.verses.map((v) => ({
        key: `${nextBook} ${nextChapter}:${v.verseNumber}`,
        text: v.text,
        num: v.verseNumber,
      }));
      const nextChapterData = { book: nextBook, chapter: nextChapter, verses };
      const nextItems = buildChapterItems(nextChapterData);
      speechItemsRef.current = nextItems;
      setSpeechItems(nextItems);
      currentIdxRef.current = 0;
      setDisplayBook(nextBook);
      setDisplayChapter(nextChapter);
      setSelectedBook(nextBook);
      setSelectedChapter(nextChapter);
      setChapters((prev) => {
        const ex = new Set(prev.map((c) => `${c.book}-${c.chapter}`));
        if (ex.has(`${nextBook}-${nextChapter}`)) return prev;
        return [...prev, nextChapterData];
      });
      return true;
    } catch (err) {
      console.error("Failed to load next chapter for audio:", err);
      return false;
    }
  };

  const runLoop = async () => {
    while (isReadingRef.current) {
      const i = currentIdxRef.current;

      if (i >= speechItemsRef.current.length) {
        if (
          afterPlayRef.current === "continue" &&
          voiceModeRef.current === "chapter"
        ) {
          const advanced = await advanceToNextChapter();
          if (!advanced) break;
          continue;
        }
        break;
      }

      setCurrentSpeechIdx(i);
      await speakOne(speechItemsRef.current[i].text);

      // Speed change: re-speak same verse from the beginning at the new rate.
      if (isSpeedChangingRef.current) {
        isSpeedChangingRef.current = false;
        continue;
      }

      // Advance to next verse (unless a skip already changed the index).
      if (currentIdxRef.current === i) {
        if (repeatModeRef.current !== "one") {
          currentIdxRef.current = i + 1;
        }
      }
    }

    if (isReadingRef.current) {
      isReadingRef.current = false;
      isPausedRef.current = false;
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentSpeechIdx(0);
      setVoiceMode(null);
    }
  };

  const buildChapterItems = (cd: ChapterData): SpeechItem[] =>
    cd.verses.map((v) => ({
      verseKey: v.key,
      verseNum: v.num,
      text: `Verse ${v.num}. ${cleanTextForSpeech(v.text)}`,
    }));

  const buildSelectionItems = (keys: string[]): SpeechItem[] => {
    const sorted = [...keys].sort((a, b) => {
      const am = a.match(/(\d+):(\d+)$/)!,
        bm = b.match(/(\d+):(\d+)$/)!;
      if (!am || !bm) return 0;
      const cd = parseInt(am[1]) - parseInt(bm[1]);
      return cd !== 0 ? cd : parseInt(am[2]) - parseInt(bm[2]);
    });
    return sorted.map((key) => {
      const p = parseVerseKey(key);
      let text = key;
      if (p) {
        const ch = chapters.find(
          (c) => c.book === p.book && c.chapter === p.chapter,
        );
        const v = ch?.verses.find((vv) => vv.num === p.verse);
        if (v) text = `Verse ${p.verse}. ${cleanTextForSpeech(v.text)}`;
      }
      return { verseKey: key, verseNum: p?.verse ?? 0, text };
    });
  };

  const startSpeech = (
    items: SpeechItem[],
    mode: "chapter" | "selected",
    startIdx = 0,
  ) => {
    window.speechSynthesis.cancel();
    speechItemsRef.current = items;
    currentIdxRef.current = startIdx;
    isReadingRef.current = true;
    isPausedRef.current = false;
    setSpeechItems(items);
    setCurrentSpeechIdx(startIdx);
    setIsSpeaking(true);
    setIsPaused(false);
    setVoiceMode(mode);
    runLoop();
  };

  const stopSpeaking = useCallback(() => {
    isReadingRef.current = false;
    isPausedRef.current = false;
    // Must resume before cancel — browser ignores cancel() while paused.
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    skipRef.current?.();
    skipRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSpeechIdx(0);
    setSpeechItems([]);
    setVoiceMode(null);
  }, []);

  const pauseResume = () => {
    if (isPausedRef.current) {
      // Resume — native browser resumes exactly where audio was suspended.
      isPausedRef.current = false;
      setIsPaused(false);
      window.speechSynthesis.resume();
    } else {
      // Pause — native browser suspends audio mid-word; no position tracking needed.
      isPausedRef.current = true;
      setIsPaused(true);
      window.speechSynthesis.pause();
    }
  };

  const toggleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === "none") return "one";
      if (prev === "one") return "all";
      return "none";
    });
  };

  const toggleAfterPlay = () => {
    setAfterPlay((prev) => (prev === "continue" ? "stop" : "continue"));
  };

  const setSleepTimerMinutes = (minutes: number | null) => {
    if (minutes === null) {
      // Cancel timer
      setSleepTimer(null);
      setSleepTimerRemaining(0);
    } else {
      const seconds = minutes * 60;
      setSleepTimer(seconds);
      setSleepTimerRemaining(seconds);
    }
  };

  const handleSpeedChange = (newRate: number) => {
    setSpeechRate(newRate);
    speechRateRef.current = newRate;
    if (!isReadingRef.current) return;

    // Signal the loop to re-speak the current verse at the new rate.
    isSpeedChangingRef.current = true;

    if (isPausedRef.current) {
      // Must resume before cancel — browser ignores cancel() while paused.
      isPausedRef.current = false;
      setIsPaused(false);
      window.speechSynthesis.resume();
    }

    // Cancel current utterance — onerror("interrupted") is swallowed in speakOne,
    // and skipRef resolves the promise so the runLoop re-speaks immediately.
    window.speechSynthesis.cancel();
    skipRef.current?.();
    skipRef.current = null;
  };

  const skipForward = () => {
    if (isPausedRef.current) {
      isPausedRef.current = false;
      setIsPaused(false);
      window.speechSynthesis.resume();
    }
    const next = currentIdxRef.current + 1;
    if (next >= speechItemsRef.current.length) {
      if (afterPlay === "continue" && voiceMode === "chapter") {
        // Handled by runLoop's continue logic
        currentIdxRef.current = next;
        window.speechSynthesis.cancel();
        skipRef.current?.();
        skipRef.current = null;
      } else {
        stopSpeaking();
      }
      return;
    }
    currentIdxRef.current = next;
    window.speechSynthesis.cancel();
    skipRef.current?.();
    skipRef.current = null;
  };

  const skipBack = () => {
    if (isPausedRef.current) {
      isPausedRef.current = false;
      setIsPaused(false);
      window.speechSynthesis.resume();
    }
    const prev = Math.max(0, currentIdxRef.current - 1);
    currentIdxRef.current = prev;
    window.speechSynthesis.cancel();
    skipRef.current?.();
    skipRef.current = null;
  };

  const readChapter = () => {
    if (isSpeaking && voiceMode === "chapter") {
      stopSpeaking();
      return;
    }
    if (isSpeaking) stopSpeaking();
    const cd = chapters.find(
      (c) => c.book === displayBook && c.chapter === displayChapter,
    );
    if (!cd) {
      toast({
        title: t.bibleReader.chapterNotLoaded,
        description: t.bibleReader.scrollToChapter,
        variant: "destructive",
      });
      return;
    }
    if (isAuthenticated) {
      for (const v of cd.verses) {
        const p = parseVerseKey(v.key);
        if (p)
          sendPostRequest("bible", "add-read-history", {
            bookName: p.book,
            chapter: p.chapter,
            verseNumber: p.verse,
          }).catch(console.error);
      }
    }
    const items = buildChapterItems(cd);
    if (items.length === 0) return;
    startSpeech(items, "chapter", 0);
  };

  const readSelectedVerses = () => {
    if (selectedVerses.length === 0) return;
    if (isSpeaking && voiceMode === "selected") {
      stopSpeaking();
      return;
    }
    if (isSpeaking) stopSpeaking();
    if (isAuthenticated) {
      for (const vk of selectedVerses) {
        const p = parseVerseKey(vk);
        if (p)
          sendPostRequest("bible", "add-read-history", {
            bookName: p.book,
            chapter: p.chapter,
            verseNumber: p.verse,
          }).catch(console.error);
      }
    }
    const items = buildSelectionItems(selectedVerses);
    startSpeech(items, "selected", 0);
  };

  // ── Selection helpers ──
  const trackReadHistory = async (verseKey: string) => {
    if (!isAuthenticated) return;
    const p = parseVerseKey(verseKey);
    if (!p) return;
    try {
      await sendPostRequest("bible", "add-read-history", {
        bookName: p.book,
        chapter: p.chapter,
        verseNumber: p.verse,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleVerseSelection = (verseKey: string) => {
    if (selectedVerses.includes(verseKey) && expandedExplanation === verseKey) {
      setExpandedExplanation(null);
      setExpandedFullExplanation((prev) => {
        const n = new Set(prev);
        n.delete(verseKey);
        return n;
      });
    }
    if (expandedExplanation && expandedExplanation !== verseKey)
      setExpandedExplanation(null);
    setSelectedVerses((prev) =>
      prev.includes(verseKey)
        ? prev.filter((v) => v !== verseKey)
        : [...prev, verseKey],
    );
    trackReadHistory(verseKey);
  };

  const clearSelection = useCallback(() => {
    setSelectedVerses([]);
    setExpandedExplanation(null);
    setExpandedFullExplanation(new Set());
  }, []);

  const getSelectionGroups = useCallback(() => {
    const groups = new Map<
      string,
      { book: string; chapter: number; verses: number[] }
    >();
    for (const key of selectedVerses) {
      const p = parseVerseKey(key);
      if (!p) continue;
      const gk = `${p.book}|${p.chapter}`;
      if (!groups.has(gk))
        groups.set(gk, { book: p.book, chapter: p.chapter, verses: [] });
      groups.get(gk)!.verses.push(p.verse);
    }
    return [...groups.values()];
  }, [selectedVerses]);

  const isSingleChapterSelection = useCallback(() => {
    if (selectedVerses.length === 0) return true;
    return getSelectionGroups().length === 1;
  }, [selectedVerses, getSelectionGroups]);

  const isConsecutiveSelection = useCallback(() => {
    const groups = getSelectionGroups();
    if (groups.length !== 1) return false;
    const verses = [...groups[0].verses].sort((a, b) => a - b);
    for (let i = 1; i < verses.length; i++) {
      if (verses[i] !== verses[i - 1] + 1) return false;
    }
    return true;
  }, [selectedVerses, getSelectionGroups]);

  // ── Annotation helpers ──
  const isHighlighted = (vk: string) => highlights[vk]?.color;
  const isFavorite = (vk: string) => favorites.has(vk);
  const getVerseNote = (vk: string) => verseNotes[vk] || null;
  const getVerseExplanation = (vk: string) =>
    verseExplanationMap[vk]?.explanation || null;
  const getVerseLearnMore = (vk: string) =>
    verseExplanationMap[vk]?.learnMore || null;
  const getVerseExplanationPrompts = (vk: string) =>
    verseExplanationPrompts[vk] || [];

  const toggleExplanation = async (verseKey: string) => {
    if (expandedExplanation === verseKey) {
      setExpandedExplanation(null);
      setExpandedFullExplanation((prev) => {
        const n = new Set(prev);
        n.delete(verseKey);
        return n;
      });
      requestAnimationFrame(() =>
        verseRefs.current[verseKey]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      );
      return;
    }
    if (verseExplanationMap[verseKey]) {
      setExpandedExplanation(verseKey);
      return;
    }
    const p = parseVerseKey(verseKey);
    if (!p) return;
    setExplanationLoading(true);

    let promptsToUse = allPrompts;
    if (!allPromptsLoaded) {
      try {
        const promptsRes = await sendPostRequest("journal", "prompts/get-all", {
          isActive: true,
        });
        if (promptsRes.returnCode === 200 && promptsRes.returnData) {
          promptsToUse = promptsRes.returnData;
          setAllPrompts(promptsRes.returnData);
          setAllPromptsLoaded(true);
        }
      } catch (e) {
        console.error("Error loading prompts:", e);
      }
    }

    try {
      const versePrompts = promptsToUse.filter(
        (prompt: any) =>
          prompt.bookName === p.book &&
          prompt.chapter === p.chapter &&
          prompt.verseNumber === p.verse,
      );

      const res = await sendPostRequest("bible", "get-verse-explanation", {
        bookName: p.book,
        chapter: p.chapter,
        verseNumber: p.verse,
      });

      if (res?.returnCode === 404) {
        setExplanationLoading(false);
        toast({
          title: t.bibleReader.noExplanationTitle,
          description: res.returnMessage || t.bibleReader.noExplanationFound,
        });
        return;
      }

      if (res?.returnCode === 200 && res.returnData?.explanation) {
        const data = res.returnData;
        let promptIds: number[] = [];
        if (data.promptIds) {
          try {
            const parsed = JSON.parse(data.promptIds);
            if (Array.isArray(parsed)) {
              promptIds = parsed.map(Number);
            }
          } catch (e) {
            console.error("Error parsing promptIds:", e);
          }
        }

        let allVersePrompts = [...versePrompts];
        if (promptIds.length > 0) {
          const additionalPrompts = promptsToUse.filter((prompt: any) =>
            promptIds.includes(prompt.id),
          );
          allVersePrompts = [...allVersePrompts, ...additionalPrompts];
        }

        setVerseExplanationMap((prev) => ({
          ...prev,
          [verseKey]: { explanation: data.explanation, learnMore: data.learnMore, promptIds },
        }));

        if (allVersePrompts.length > 0) {
          setVerseExplanationPrompts((prev) => ({
            ...prev,
            [verseKey]: allVersePrompts,
          }));
        }
        setExpandedExplanation(verseKey);
      } else if (versePrompts.length > 0) {
        setVerseExplanationPrompts((prev) => ({
          ...prev,
          [verseKey]: versePrompts,
        }));
        setExpandedExplanation(verseKey);
      } else {
        toast({
          title: t.bibleReader.noExplanationTitle,
          description: t.bibleReader.noExplanationFound,
        });
      }
    } catch {
      toast({
        title: t.common.error,
        description: t.bibleReader.failedToLoadExplanation,
        variant: "destructive",
      });
    } finally {
      setExplanationLoading(false);
    }
  };

  // ── Navigation ──
  const handleBookChange = (book: string) => {
    if (book === selectedBook) return;
    if (isSpeaking) stopSpeaking();
    clearSelection();
    setSelectedVerse(null);
    chapterRefs.current = {};
    verseRefs.current = {};
    setSelectedBook(book);
    setSelectedChapter(1);
    setDisplayBook(book);
    setDisplayChapter(1);
    setChapters([]);
    setHasMore(true);
    loadChapters(book, 1, 8);
    if (isAuthenticated) {
      loadHighlights(book, 1);
      loadFavorites();
      loadNotes(book, 1);
    }
  };

  const handleChapterChange = (ch: number) => {
    if (isSpeaking) stopSpeaking();
    clearSelection();
    setSelectedVerse(null);
    setSelectedChapter(ch);
    const key = `${selectedBook}-${ch}`;
    if (chapterRefs.current[key]) {
      isNavigatingRef.current = true;
      chapterRefs.current[key].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setDisplayBook(selectedBook);
      setDisplayChapter(ch);
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    } else {
      chapterRefs.current = {};
      verseRefs.current = {};
      setChapters([]);
      setHasMore(true);
      setDisplayBook(selectedBook);
      setDisplayChapter(ch);
      loadChapters(selectedBook, ch, 8);
      if (isAuthenticated) {
        loadHighlights(selectedBook, ch);
        loadNotes(selectedBook, ch);
      }
    }
  };

  const goToPrevChapter = () => {
    if (displayChapter > 1) {
      handleChapterChange(displayChapter - 1);
    } else {
      const bookNames = backendBooks.map((b) => b.bookName);
      const idx = bookNames.indexOf(displayBook);
      if (idx > 0) {
        const prevBook = bookNames[idx - 1];
        const lastCh = getMaxChapter(prevBook);
        if (isSpeaking) stopSpeaking();
        clearSelection();
        chapterRefs.current = {};
        verseRefs.current = {};
        setSelectedBook(prevBook);
        setSelectedChapter(lastCh);
        setDisplayBook(prevBook);
        setDisplayChapter(lastCh);
        setChapters([]);
        setHasMore(true);
        loadChapters(prevBook, lastCh, 8);
        if (isAuthenticated) {
          loadHighlights(prevBook, lastCh);
          loadFavorites();
          loadNotes(prevBook, lastCh);
        }
      }
    }
  };

  const goToNextChapter = () => {
    if (displayChapter < maxChapterForDisplay) {
      handleChapterChange(displayChapter + 1);
    } else {
      const bookNames = backendBooks.map((b) => b.bookName);
      const idx = bookNames.indexOf(displayBook);
      if (idx >= 0 && idx < bookNames.length - 1) {
        handleBookChange(bookNames[idx + 1]);
      }
    }
  };

  const handleVerseChange = (verseStr: string) => {
    const verseNum = parseInt(verseStr, 10);
    if (isNaN(verseNum)) return;
    setSelectedVerse(verseNum);
    const verseKey = `${displayBook} ${displayChapter}:${verseNum}`;
    const el = verseRefs.current[verseKey];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ── Actions ──
  const addFavorite = async (rangeStart?: number, rangeEnd?: number) => {
    if (!isAuthenticated) {
      toast({
        title: t.bibleReader.signInRequired,
        description: t.bibleReader.signInToFavorite,
        variant: "destructive",
      });
      return;
    }
    if (selectedVerses.length === 0 && (!rangeStart || !rangeEnd)) return;
    try {
      if (rangeStart && rangeEnd) {
        const verses = [];
        for (let v = rangeStart; v <= rangeEnd; v++) verses.push(v);
        await sendPostRequest("bible", "add-favorite", {
          bookName: displayBook,
          chapter: displayChapter,
          verseNumbers: verses,
        });
      } else {
        await Promise.all(
          getSelectionGroups().map(({ book, chapter, verses }) =>
            sendPostRequest("bible", "add-favorite", {
              bookName: book,
              chapter,
              verseNumbers: verses,
            }),
          ),
        );
      }
      toast({ title: t.bibleReader.addedToFavorites });
      loadFavorites();
    } catch {
      toast({
        title: t.common.error,
        description: t.bibleReader.failedToAddFavorite,
        variant: "destructive",
      });
    }
    clearSelection();
  };

  const highlightVerses = async (
    colorId: number,
    color: string,
    rangeStart?: number,
    rangeEnd?: number,
  ) => {
    if (!isAuthenticated) {
      toast({
        title: t.bibleReader.signInRequired,
        description: t.bibleReader.signInToHighlight,
        variant: "destructive",
      });
      return;
    }
    try {
      if (rangeStart && rangeEnd) {
        const verses = [];
        for (let v = rangeStart; v <= rangeEnd; v++) verses.push(v);
        await Promise.all(
          verses.map((vn) =>
            sendPostRequest("bible", "add-highlight", {
              bookName: displayBook,
              chapter: displayChapter,
              verseNumber: vn,
              colorId,
              note: "",
            }),
          ),
        );
        for (let v = rangeStart; v <= rangeEnd; v++) {
          const key = `${displayBook} ${displayChapter}:${v}`;
          setHighlights((prev) => ({
            ...prev,
            [key]: { verseKey: key, color, colorId },
          }));
        }
        loadHighlights(displayBook, displayChapter);
      } else {
        const groups = getSelectionGroups();
        if (groups.length === 0) return;
        await Promise.all(
          groups.map(({ book, chapter, verses }) =>
            sendPostRequest("bible", "add-highlight", {
              bookName: book,
              chapter,
              verseNumbers: verses,
              colorId,
              note: "",
            }),
          ),
        );
        selectedVerses.forEach((key) => {
          setHighlights((prev) => ({
            ...prev,
            [key]: { verseKey: key, color, colorId },
          }));
        });
        groups.forEach(({ book, chapter }) => loadHighlights(book, chapter));
      }
    } catch {
      toast({
        title: t.common.error,
        description: t.bibleReader.failedToHighlight,
        variant: "destructive",
      });
    }
    clearSelection();
  };

  const versesToText = (keys: string[]) => {
    const sorted = [...keys].sort((a, b) => {
      const am = a.match(/(\d+):(\d+)$/)!,
        bm = b.match(/(\d+):(\d+)$/)!;
      if (!am || !bm) return 0;
      const cd = parseInt(am[1]) - parseInt(bm[1]);
      return cd !== 0 ? cd : parseInt(am[2]) - parseInt(bm[2]);
    });
    return sorted
      .map((key) => {
        const p = parseVerseKey(key);
        if (!p) return key;
        const v = chapters
          .find((c) => c.book === p.book && c.chapter === p.chapter)
          ?.verses.find((vn) => vn.num === p.verse);
        return v ? `${key}\n${v.text}` : key;
      })
      .join("\n\n");
  };

  const copyVerses = () => {
    if (selectedVerses.length === 0) return;
    navigator.clipboard.writeText(versesToText(selectedVerses));
    toast({ title: t.bibleReader.copiedLabel, description: t.bibleReader.versesCopied });
    clearSelection();
  };

  const copyVersesRange = (rangeStart?: number, rangeEnd?: number) => {
    if (rangeStart !== undefined && rangeEnd !== undefined) {
      const verses: string[] = [];
      for (let v = rangeStart; v <= rangeEnd; v++)
        verses.push(`${displayBook} ${displayChapter}:${v}`);
      navigator.clipboard.writeText(versesToText(verses));
      toast({
        title: t.bibleReader.copiedLabel,
        description: `Verses ${rangeStart}-${rangeEnd} copied.`,
      });
    } else {
      navigator.clipboard.writeText(versesToText(selectedVerses));
      const groups = getSelectionGroups();
      if (groups.length === 1) {
        const g = groups[0];
        toast({
          title: t.bibleReader.copiedLabel,
          description: `${g.book} ${g.chapter}:${Math.min(...g.verses)}-${Math.max(...g.verses)}`,
        });
      } else {
        toast({
          title: t.bibleReader.copiedLabel,
          description: `${selectedVerses.length} verses copied.`,
        });
      }
    }
  };

  const shareVerses = async () => {
    if (selectedVerses.length === 0) return;
    try {
      await navigator.share({ text: versesToText(selectedVerses) });
    } catch (e) {
      console.error(e);
    }
    clearSelection();
  };

  const shareVersesRange = async (rangeStart?: number, rangeEnd?: number) => {
    if (rangeStart !== undefined && rangeEnd !== undefined) {
      const verses: string[] = [];
      for (let v = rangeStart; v <= rangeEnd; v++)
        verses.push(`${displayBook} ${displayChapter}:${v}`);
      try {
        await navigator.share({ text: versesToText(verses) });
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await navigator.share({ text: versesToText(selectedVerses) });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const saveNote = async (rangeStart?: number, rangeEnd?: number) => {
    if (!noteText.trim()) {
      toast({
        title: t.bibleReader.emptyNote,
        description: t.bibleReader.pleaseEnterNote,
        variant: "destructive",
      });
      return;
    }
    setNoteSaving(true);
    try {
      if (rangeStart && rangeEnd) {
        const verses = [];
        for (let v = rangeStart; v <= rangeEnd; v++) verses.push(v);
        await sendPostRequest("bible", "add-verse-note", {
          bookName: displayBook,
          chapter: displayChapter,
          verseNumbers: verses,
          note: noteText.trim(),
        });
      } else {
        await Promise.all(
          getSelectionGroups().map(({ book, chapter, verses }) =>
            sendPostRequest("bible", "add-verse-note", {
              bookName: book,
              chapter,
              verseNumbers: verses,
              note: noteText.trim(),
            }),
          ),
        );
      }
      toast({ title: t.bibleReader.noteSaved });
      loadNotes(displayBook, displayChapter);
    } catch {
      toast({
        title: t.common.error,
        description: t.bibleReader.failedToSaveNote,
        variant: "destructive",
      });
    }
    setNoteText("");
    setShowNoteModal(false);
    clearSelection();
    setNoteSaving(false);
  };

  // ── Search ──
  const goToVerse = (book: string, chapterNum: number) => {
    handleBookChange(book);
    setTimeout(() => handleChapterChange(chapterNum), 100);
    setShowSearchModal(false);
    setSearchQuery("");
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 2) {
      setSearchLoading(true);
      try {
        const translationId = mapTranslationId(versionId);
        const result = await bibleApi.search(translationId, query, 50);
        const results = result.data.map((r) => ({
          book: r.bookName,
          chapter: r.chapter,
          verse: r.verse,
        }));
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearchLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  // ── Player derived ──
  const currentItem = speechItems[currentSpeechIdx] ?? null;
  const progressPct =
    speechItems.length > 0
      ? ((currentSpeechIdx + 1) / speechItems.length) * 100
      : 0;
  const canSkipBack = currentSpeechIdx > 0;
  const canSkipForward = currentSpeechIdx < speechItems.length - 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ══════════════════ HEADER ══════════════════ */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        {/* ─── Desktop top bar (hidden on mobile) ─── */}
        <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/40">
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

          <div className="flex items-center gap-2">
            <Button
              variant={
                isSpeaking && voiceMode === "chapter" ? "default" : "outline"
              }
              size="sm"
              onClick={readChapter}
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

            <Popover open={translationOpen} onOpenChange={setTranslationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] h-8 text-xs border-border/50 bg-muted/30 justify-between font-normal"
                >
                  <span className="truncate">
                    {availableTranslations.find((t2) => t2.id === versionId)
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
                <ScrollArea className="h-[500px]">
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
                            setVersionId(v.id);
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
          <div className="relative flex-1 max-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder={t.bibleReader.filterBooks}
              value={desktopBookFilter}
              onChange={(e) => setDesktopBookFilter(e.target.value)}
              className="pl-8 h-8 text-xs border-border/50 bg-muted/30"
            />
          </div>
          <Select
            value={selectedBook}
            onValueChange={handleBookChange}
            disabled={booksLoading || backendBooks.length === 0}
          >
            <SelectTrigger className="w-[175px] h-8 text-xs border-border/50 bg-muted/30">
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
            onValueChange={(val) => handleChapterChange(parseInt(val, 10))}
            disabled={booksLoading || backendBooks.length === 0}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs border-border/50 bg-muted/30">
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
            onValueChange={handleVerseChange}
            disabled={currentChapterVerseCount === 0}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs border-border/50 bg-muted/30">
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
          {/* Logo */}
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
          </div>

          {/* Mobile nav drawer (book + chapter + version) */}
          <div className="flex-1 min-w-0">
            <MobileNavDrawer
              selectedBook={selectedBook}
              selectedChapter={displayChapter}
              selectedVerse={selectedVerse}
              versionId={versionId}
              maxChapter={maxChapterForDisplay}
              onBookChange={handleBookChange}
              onChapterChange={handleChapterChange}
              onVerseChange={handleVerseChange}
              onVersionChange={setVersionId}
              books={backendBooks.map((b) => b.bookName)}
              availableTranslations={availableTranslations}
              verseCount={currentChapterVerseCount}
            />
          </div>

          {/* Search button */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center border border-border/40 active:scale-95 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Read button — mobile */}
          <button
            onClick={readChapter}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95",
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
            onClick={goToPrevChapter}
            disabled={isAtVeryStart}
            className="flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-lg hover:bg-muted/50 transition-all active:scale-95"
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
            <span className="sm:hidden text-[11px]">{t.bibleReader.prevShort}</span>
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
            onClick={goToNextChapter}
            disabled={isAtVeryEnd}
            className="flex items-center gap-1 sm:gap-1.5 h-8 px-2 sm:px-3 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-lg hover:bg-muted/50 transition-all active:scale-95"
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
            <span className="sm:hidden text-[11px]">{t.bibleReader.nextShort}</span>
            <ChevronRight className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
          </button>
        </div>
      </header>

      {/* ══════════════════ SELECTION TOOLBAR ══════════════════ */}
      {selectedVerses.length > 0 && (
        <div className="sticky top-0 z-40 flex justify-center px-3 sm:px-4 pt-2 pb-1 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-0.5 sm:gap-1 bg-background/95 backdrop-blur border border-border/60 rounded-full px-2 sm:px-3 py-1.5 shadow-lg overflow-x-auto max-w-full">
            {/* Count + clear */}
            <button
              onClick={clearSelection}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-full hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="w-3 h-3" />
              <span>{selectedVerses.length}</span>
            </button>

            <div className="w-px h-4 bg-border/60 mx-0.5 sm:mx-1 shrink-0" />

            {/* Listen */}
            <button
              onClick={readSelectedVerses}
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors whitespace-nowrap shrink-0",
                isSpeaking && voiceMode === "selected"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {isSpeaking && voiceMode === "selected" ? (
                <>
                  <VolumeX className="w-3 h-3" />
                  <span className="hidden sm:inline">{t.bibleReader.stop}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3" />
                  <span className="hidden sm:inline">{t.bibleReader.listen}</span>
                </>
              )}
            </button>

            <ToolbarBtn
              onClick={() => setShowHighlightPicker(true)}
              icon={<Highlighter className="w-3 h-3" />}
              label={t.bibleReader.highlight}
            />
            <ToolbarBtn
              onClick={() => setShowNoteModal(true)}
              icon={<BookMarked className="w-3 h-3" />}
              label={t.bibleReader.addNote}
            />
            <ToolbarBtn
              onClick={() => {
                if (selectedVerses.length > 0 && !isConsecutiveSelection()) {
                  addFavorite();
                } else {
                  setShowFavoriteModal(true);
                }
              }}
              icon={<Star className="w-3 h-3" />}
              label={t.bibleReader.fav}
              compact
            />
            <ToolbarBtn
              onClick={() => {
                if (selectedVerses.length > 0 && !isConsecutiveSelection()) {
                  copyVersesRange();
                } else {
                  setShowCopyModal(true);
                }
              }}
              icon={<Copy className="w-3 h-3" />}
              label={t.common.copy}
              compact
            />
            <ToolbarBtn
              onClick={() => {
                let verseNum = "1";
                if (selectedVerses.length > 0) {
                  const parts = selectedVerses[0].split(":");
                  if (parts.length > 1) verseNum = parts[1];
                }
                window.open(
                  `/journal/new?book=${selectedBook}&chapter=${selectedChapter}&verse=${verseNum}`,
                  "_blank",
                );
              }}
              icon={<PenLine className="w-3 h-3" />}
              label={t.bibleReader.journal}
              compact
            />
            <ToolbarBtn
              onClick={() => {
                if (selectedVerses.length > 0 && !isConsecutiveSelection()) {
                  shareVersesRange();
                } else {
                  setShowShareModal(true);
                }
              }}
              icon={<Share2 className="w-3 h-3" />}
              label={t.common.share}
              compact
            />
          </div>
        </div>
      )}

      {/* ══════════════════ READING AREA ══════════════════ */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div
            ref={contentRef}
            className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12"
            style={{ paddingBottom: isSpeaking ? "8rem" : "3rem" }}
          >
            {chapters.length === 0 && loading ? (
              <div className="space-y-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-36 mx-auto" />
                    <Skeleton className="h-3 w-20 mx-auto mb-6" />
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {chapters.map((chapter) => {
                  const chapterKey = `${chapter.book}-${chapter.chapter}`;
                  return (
                    <div
                      key={chapterKey}
                      data-chapter-key={chapterKey}
                      ref={(el) => {
                        if (el) chapterRefs.current[chapterKey] = el;
                      }}
                      className="mb-16 sm:mb-20"
                    >
                      {/* Chapter heading */}
                      <div className="mb-8 sm:mb-10 text-center">
                        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                          <div className={cn("h-px flex-1", isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r", "from-transparent to-border/60")} />
                          <h2
                            className="text-xl sm:text-2xl font-medium tracking-widest text-foreground uppercase"
                            style={{
                              fontFamily: "'Cinzel', serif",
                              letterSpacing: "0.12em",
                            }}
                          >
                            {chapter.book}
                          </h2>
                          <div className={cn("h-px flex-1", isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l", "from-transparent to-border/60")} />
                        </div>
                        <p
                          className="text-xs sm:text-sm text-muted-foreground tracking-widest uppercase"
                          style={{
                            fontFamily: "'Cinzel', serif",
                            letterSpacing: "0.2em",
                          }}
                        >
                          {t.bibleReader.chapterLabel.replace('{n}', String(chapter.chapter))}
                        </p>
                      </div>

                      {/* Verses */}
                      <div
                        className="text-[1.05rem] sm:text-[1.15rem] md:text-[1.2rem] leading-[2.0] sm:leading-[2.15] text-foreground/90"
                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                      >
                        {chapter.verses.map((verse) => {
                          const highlightColor = isHighlighted(verse.key);
                          const isSelected = selectedVerses.includes(verse.key);
                          const isFav = isFavorite(verse.key);
                          const vNote = getVerseNote(verse.key);
                          const vExplanation = getVerseExplanation(verse.key);
                          const vLearnMore = getVerseLearnMore(verse.key);
                          const vExplanationPrompts =
                            getVerseExplanationPrompts(verse.key);
                          const isExplanationExpanded =
                            expandedExplanation === verse.key;
                          const isCurrentlyReading =
                            isSpeaking && currentItem?.verseKey === verse.key;
                          const isVerseTargeted =
                            selectedVerse !== null && selectedVerse === verse.num;

                          return (
                            <span key={verse.key}>
                              <span
                                ref={(el) => {
                                  verseRefs.current[verse.key] = el;
                                }}
                                onClick={() => toggleVerseSelection(verse.key)}
                                className={cn(
                                  "inline cursor-pointer rounded transition-all duration-200",
                                  isSelected
                                    ? "bg-primary/15 ring-1 ring-primary/30 -mx-0.5 px-0.5"
                                    : "",
                                  isCurrentlyReading && !isSelected
                                    ? "bg-primary/10 ring-1 ring-primary/20 -mx-0.5 px-0.5"
                                    : "",
                                  highlightColor &&
                                    !isSelected &&
                                    !isCurrentlyReading &&
                                    !isVerseTargeted
                                    ? "-mx-0.5 px-0.5"
                                    : "",
                                  isVerseTargeted &&
                                    !isSelected &&
                                    !isCurrentlyReading
                                    ? "ring-2 ring-primary/40 bg-primary/5 -mx-0.5 px-0.5"
                                    : "",
                                )}
                                style={
                                  highlightColor &&
                                  !isSelected &&
                                  !isCurrentlyReading
                                    ? {
                                        backgroundColor: `${highlightColor}28`,
                                        borderBottom: `2px solid ${highlightColor}60`,
                                      }
                                    : undefined
                                }
                              >
                                <sup
                                  className="text-primary font-semibold mr-1 not-italic select-none"
                                  style={{
                                    fontFamily: "'Cinzel', serif",
                                    fontSize: "0.55rem",
                                    letterSpacing: "0.05em",
                                    verticalAlign: "super",
                                    lineHeight: 0,
                                  }}
                                >
                                  {verse.num}
                                </sup>
                                {renderVerseText(verse.text)}
                                {!isSelected && (
                                  <>
                                    {isFav && (
                                      <Star
                                        className="inline w-3 h-3 ml-1 text-amber-400 fill-amber-400"
                                        style={{ verticalAlign: "middle" }}
                                      />
                                    )}
                                    {vNote && !isFav && (
                                      <span className="text-xs text-muted-foreground ml-1 not-italic">
                                        📝
                                      </span>
                                    )}
                                  </>
                                )}{" "}
                                {isSelected && selectedVerses.length === 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExplanation(verse.key);
                                    }}
                                    disabled={explanationLoading}
                                    className={cn(
                                      "inline-flex items-center gap-1 ml-1.5 text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all duration-150",
                                      isExplanationExpanded
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "bg-primary/10 text-primary/80 hover:bg-primary/20 hover:text-primary",
                                    )}
                                  >
                                    {explanationLoading &&
                                    expandedExplanation === verse.key ? (
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    ) : isExplanationExpanded ? (
                                      <>
                                        <ChevronUp className="w-2.5 h-2.5" />
                                        {t.bibleReader.closeExplanation}
                                      </>
                                    ) : (
                                      <>
                                        <Lightbulb className="w-2.5 h-2.5" />
                                        {t.bibleReader.explain}
                                      </>
                                    )}
                                  </button>
                                )}{" "}
                              </span>

                              <AnimatePresence>
                              {isExplanationExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="mt-2 mb-3 ml-2 sm:ml-3 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 overflow-hidden"
                                >
                                  <div className="p-4 sm:p-5">
                                    {vExplanation ? (
                                      <div>
                                        {/* Explanation header */}
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                            {t.bibleReader.explanation}
                                          </span>
                                        </div>
                                        {/* Full explanation text */}
                                        <TextContent text={vExplanation} />
                                        {/* Read more — reveals Learn More */}
                                        {vLearnMore && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setExpandedFullExplanation((prev) => {
                                                const n = new Set(prev);
                                                n.has(verse.key)
                                                  ? n.delete(verse.key)
                                                  : n.add(verse.key);
                                                return n;
                                              });
                                            }}
                                            className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-all duration-200"
                                          >
                                            <ChevronDown
                                              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                                                expandedFullExplanation.has(verse.key) ? "rotate-180" : ""
                                              }`}
                                            />
                                            {expandedFullExplanation.has(verse.key)
                                              ? (t.verseExplanations?.learnMoreTitle || "Learn More")
                                              : t.bibleReader.readMore}
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-muted-foreground italic flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        {t.bibleReader.loadingExplanation}
                                      </span>
                                    )}
                                  </div>

                                  {/* Learn More — smooth accordion */}
                                  <div
                                    className="grid transition-all duration-300 ease-in-out"
                                    style={{
                                      gridTemplateRows: vLearnMore && expandedFullExplanation.has(verse.key) ? "1fr" : "0fr",
                                    }}
                                  >
                                    <div className="overflow-hidden">
                                      {vLearnMore && (
                                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-primary/10">
                                          <div className="pt-3">
                                            <div className="flex items-center gap-2 mb-3">
                                              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                              <span className="text-xs font-semibold text-primary/60 uppercase tracking-wider">
                                                {t.verseExplanations?.learnMoreTitle || "Learn More"}
                                              </span>
                                            </div>
                                            <TextContent text={vLearnMore} />
                                            {/* Close — collapses the entire panel */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExplanation(verse.key);
                                              }}
                                              className="mt-4 flex items-center gap-1.5 text-sm font-medium text-destructive/70 hover:text-destructive transition-colors duration-200"
                                            >
                                              <ChevronUp className="w-4 h-4" />
                                              {t.bibleReader.closeExplanation}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Journal Prompts */}
                                  {vExplanationPrompts.length > 0 && (
                                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-amber-200/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                                          {t.bibleReader.journalPrompts}
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        {vExplanationPrompts.map((prompt) => (
                                          <div
                                            key={prompt.id}
                                            className="text-sm leading-relaxed text-foreground/70 bg-amber-50/70 dark:bg-amber-950/30 rounded-md p-3 border border-amber-100/40 dark:border-amber-900/40"
                                          >
                                            <span className="text-amber-600/80 mr-1">
                                              "
                                            </span>
                                            {prompt.prompt}
                                            <span className="text-amber-600/80 ml-1">
                                              "
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                              </AnimatePresence>
                            </span>
                          );
                        })}
                      </div>

                      {/* Bottom chapter nav — mobile only */}
                      <div className="flex sm:hidden items-center justify-between mt-10 pt-6 border-t border-border/30">
                        <button
                          onClick={goToPrevChapter}
                          disabled={
                            isAtVeryStart && chapter.chapter === displayChapter
                          }
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-3 py-2 rounded-xl bg-muted/50 active:scale-95 transition-all"
                        >
                          <ChevronLeft className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
                          {t.bibleReader.prevShort}
                        </button>
                        <span
                          className="text-xs text-muted-foreground"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          {t.bibleReader.chShort} {chapter.chapter}
                        </span>
                        <button
                          onClick={goToNextChapter}
                          disabled={
                            isAtVeryEnd && chapter.chapter === displayChapter
                          }
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 px-3 py-2 rounded-xl bg-muted/50 active:scale-95 transition-all"
                        >
                          {t.bibleReader.nextShort}
                          <ChevronRight className={cn("w-3.5 h-3.5", isRtl && "rotate-180")} />
                        </button>
                      </div>

                      {/* Chapter Prompts */}
                      {chapterPrompts[`${chapter.book}-${chapter.chapter}`]
                        ?.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-border/20">
                          <div className="rounded-lg border border-amber-200/40 bg-amber-50/30 dark:bg-amber-950/20 p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-4">
                              <Lightbulb className="w-4 h-4 text-amber-500" />
                              <span
                                className="text-sm font-semibold text-amber-600 uppercase tracking-wider"
                                style={{ fontFamily: "'Cinzel', serif" }}
                              >
                                {t.bibleReader.chapterReflections}
                              </span>
                            </div>
                            <div className="space-y-3">
                              {chapterPrompts[
                                `${chapter.book}-${chapter.chapter}`
                              ].map((prompt, idx) => (
                                <div
                                  key={prompt.id}
                                  className="flex items-start gap-3"
                                >
                                  <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                      {idx + 1}
                                    </span>
                                  </div>
                                  <div className="text-sm leading-relaxed text-foreground/80 bg-white/50 dark:bg-black/20 rounded-md p-2.5 flex-1 border border-amber-100/30 dark:border-amber-900/30">
                                    <span className="text-amber-500 mr-1">
                                      "
                                    </span>
                                    {prompt.prompt}
                                    <span className="text-amber-500 ml-1">
                                      "
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Infinite scroll sentinel */}
                <div
                  ref={loadMoreRef}
                  className="py-10 sm:py-12 flex justify-center"
                >
                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground tracking-widest uppercase">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span style={{ fontFamily: "'Cinzel', serif" }}>
                        Loading…
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        onSelectResult={goToVerse}
        loading={searchLoading}
      />
      <HighlightPickerModal
        visible={showHighlightPicker}
        onClose={() => setShowHighlightPicker(false)}
        onSelectColor={(colorId, color, rangeStart, rangeEnd) => {
          setShowHighlightPicker(false);
          highlightVerses(colorId, color, rangeStart, rangeEnd);
        }}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        currentBook={displayBook}
        currentChapter={displayChapter}
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
      />
      <NoteModal
        visible={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        onSave={(rangeStart, rangeEnd) => saveNote(rangeStart, rangeEnd)}
        noteText={noteText}
        onNoteChange={setNoteText}
        saving={noteSaving}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        currentBook={displayBook}
        currentChapter={displayChapter}
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
      />
      <RangePickerModal
        visible={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        title="Add to Favorites"
        description={`${displayBook} ${displayChapter}`}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
        actionLabel="Add Favorite"
        onConfirm={(rangeStart, rangeEnd) => {
          setShowFavoriteModal(false);
          addFavorite(rangeStart, rangeEnd);
        }}
      />
      <RangePickerModal
        visible={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        title="Copy Verses"
        description={`${displayBook} ${displayChapter}`}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
        actionLabel="Copy"
        onConfirm={(rangeStart, rangeEnd) => {
          setShowCopyModal(false);
          copyVersesRange(rangeStart, rangeEnd);
        }}
      />
      <RangePickerModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Verses"
        description={`${displayBook} ${displayChapter}`}
        totalVerses={
          currentChapterVerseCount || getMaxChapter(displayBook) || 1
        }
        selectedVerses={selectedVerses}
        allowRange={isConsecutiveSelection()}
        actionLabel="Share"
        onConfirm={(rangeStart, rangeEnd) => {
          setShowShareModal(false);
          shareVersesRange(rangeStart, rangeEnd);
        }}
      />

      {/* ══════════════════ VOICE PLAYER ══════════════════ */}
      {isSpeaking && (
        <VoicePlayerBar
          currentItem={currentItem}
          currentIndex={currentSpeechIdx}
          total={speechItems.length}
          progress={progressPct}
          isPaused={isPaused}
          voiceMode={voiceMode}
          displayBook={displayBook}
          displayChapter={displayChapter}
          canSkipBack={canSkipBack}
          canSkipForward={canSkipForward}
          repeatMode={repeatMode}
          afterPlay={afterPlay}
          onPauseResume={pauseResume}
          onStop={stopSpeaking}
          onSkipBack={skipBack}
          onSkipForward={skipForward}
          onToggleRepeat={toggleRepeatMode}
          onToggleAfterPlay={toggleAfterPlay}
          speechRate={speechRate}
          onSpeechRateChange={handleSpeedChange}
          sleepTimerRemaining={sleepTimerRemaining}
          onSleepTimerChange={setSleepTimerMinutes}
        />
      )}
    </div>
  );
}

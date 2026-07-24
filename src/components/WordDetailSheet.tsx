import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookText,
  Languages,
  Hash,
  BookOpen,
  Info,
  Edit2,
  Loader2,
  ExternalLink,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { getStrongsEntry } from "@/services/strongsApi";
import type { StrongsEntry } from "@/services/strongsApi";
import type { StrongsWordEntry, VerseRef } from "@/data/staticData";
import { BIBLE_BOOKS, getLangColor, getLangLetter, getLangScript } from "@/data/staticData";
import { getChaptersForBook, getVersesCountForChapter, getVerseText } from "@/utilities/bibleUtils";
import { getVersionById } from "@/assets/bibleVersion/json/bibleVersions";

// ── Types ──

export interface WordDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fetch word details by Strong's ID */
  strongsId?: string | null;
  /** Or pass a pre-fetched word entry (includes adminExplanation and verseReferences) */
  wordEntry?: StrongsWordEntry | null;
  /** The word as it appears in the verse text (e.g., "love") */
  surfaceText?: string;
  /** Verse reference (e.g., "John 3:16") */
  verseRef?: string;
  /** Full verse text for context display */
  verseText?: string;
  /** Optional translation badge (e.g., "BSB") */
  translationBadge?: string;
  /** Full translations list for the verse selector combobox (AdminStudyTools passes its list) */
  translations?: { value: string; label: string }[];
  /** Admin edit callback — shows an Edit button if provided */
  onEdit?: () => void;
  /** Verse attachments for this word (overrides anything from wordEntry) */
  verseAttachments?: VerseRef[];
}

// ── Helpers ──

const languageLabel = (lang: string) => {
  switch (lang?.toLowerCase()) {
    case "greek": return "Greek";
    case "hebrew": return "Hebrew";
    case "aramaic": return "Aramaic";
    default: return lang || "Greek";
  }
};

const parseRef = (ref: string) => {
  const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (match) {
    return {
      book: match[1],
      chapter: Number(match[2]),
      verse: Number(match[3]),
    };
  }
  return null;
};

// ── Component ──

export default function WordDetailSheet({
  open,
  onOpenChange,
  strongsId,
  wordEntry,
  surfaceText,
  verseRef,
  verseText,
  translationBadge,
  translations,
  onEdit,
  verseAttachments,
}: WordDetailSheetProps) {
  const navigate = useNavigate();
  const [fetchedEntry, setFetchedEntry] = useState<StrongsEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // ── Verse selector state ──
  const [wsBook, setWsBook] = useState("");
  const [wsChapter, setWsChapter] = useState(0);
  const [wsVerse, setWsVerse] = useState(0);
  const [wsChapList, setWsChapList] = useState<number[]>([]);
  const [wsVerList, setWsVerList] = useState<number[]>([]);
  const [wsTransl, setWsTransl] = useState("");
  const [wsPreview, setWsPreview] = useState<string | null>(null);

  // Parse verseRef on open to initialize the verse selector
  // Also auto-populate from first verseReferences entry if no verseRef but word has attachments
  useEffect(() => {
    if (!open) return;

    // Priority 1: use verseRef prop
    if (verseRef) {
      const parsed = parseRef(verseRef);
      if (parsed) {
        setWsBook(parsed.book);
        setWsChapter(parsed.chapter);
        setWsVerse(parsed.verse);
      } else {
        setWsBook("");
        setWsChapter(0);
        setWsVerse(0);
      }
      setWsTransl(translationBadge || "BSB");
      return;
    }

    // Priority 2: auto-populate from first verseReferences (from wordEntry, fetchedEntry, or verseAttachments)
    const effectiveEntry = wordEntry ?? fetchedEntry;
    const refs = effectiveEntry?.verseReferences || verseAttachments;
    if (refs && refs.length > 0) {
      const first = refs[0];
      setWsBook(first.bookName || "");
      setWsChapter(first.chapter || 0);
      setWsVerse(first.verse || 0);
      setWsTransl(first.translation || translationBadge || "BSB");
    }
  }, [open, verseRef, translationBadge, wordEntry, fetchedEntry, verseAttachments]);

  // Use pre-fetched entry if provided, otherwise fetch by strongsId
  const entry: (StrongsEntry & { adminExplanation?: string | null; verseCount?: number; verseReferences?: VerseRef[] | null }) | null =
    wordEntry ?? fetchedEntry;

  useEffect(() => {
    if (!open || !strongsId || wordEntry) return;

    let cancelled = false;
    setLoading(true);
    setError(false);
    setFetchedEntry(null);

    getStrongsEntry(strongsId)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setFetchedEntry(result);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, strongsId, wordEntry]);

  // ── Verse selector effects ──
  useEffect(() => {
    if (!wsBook) {
      setWsChapList([]);
      setWsVerList([]);
      setWsChapter(0);
      setWsVerse(0);
      setWsPreview(null);
      return;
    }
    const chs = getChaptersForBook(wsBook);
    setWsChapList(chs);
    setWsVerList([]);
    setWsChapter(0);
    setWsVerse(0);
    setWsPreview(null);
  }, [wsBook]);

  useEffect(() => {
    if (wsBook && wsChapter && wsChapter > 0) {
      setWsVerse(1);
      setWsPreview(null);
      const vCount = getVersesCountForChapter(wsBook, wsChapter);
      setWsVerList(Array.from({ length: vCount }, (_, i) => i + 1));
    } else {
      setWsVerList([]);
      setWsVerse(0);
    }
  }, [wsBook, wsChapter]);

  useEffect(() => {
    if (wsBook && wsChapter > 0 && wsVerse > 0 && wsTransl) {
      const version = getVersionById(wsTransl);
      const bibleData = version?.data;
      const text = bibleData
        ? getVerseText(wsBook, wsChapter, wsVerse, bibleData)
        : getVerseText(wsBook, wsChapter, wsVerse);
      setWsPreview(text);
    } else {
      setWsPreview(null);
    }
  }, [wsBook, wsChapter, wsVerse, wsTransl]);

  // Derive display values
  const displayTitle =
    entry?.shortDefinition || entry?.originalWord || surfaceText || "Word Study";
  const displayWord = entry?.originalWord || "";
  const displayTransliteration = entry?.transliteration || "";
  const displayLanguage = entry?.language || "";
  const displayShortDef = entry?.shortDefinition || "";
  const displayFullDef = entry?.fullDefinition || "";
  const displayPartOfSpeech = entry?.partOfSpeech || "";
  const displayGrammaticalCase = entry?.grammaticalCase || "";
  const displayGender = entry?.gender || "";
  const displayNumber = entry?.number || "";
  const displayUsageCount = entry?.usageCount;
  const displayCrossReferences = entry?.crossReferences || "";
  const displayAdminExplanation = entry?.adminExplanation || "";
  const displayStrongsId = entry?.strongsId || strongsId || "";
  const displayVerseCount = entry?.verseCount || verseAttachments?.length || 0;
  const displayVerseReferences: VerseRef[] = entry?.verseReferences || verseAttachments || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <BookText className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold">
              {displayTitle}
            </span>
          </SheetTitle>
          <SheetDescription>
            {/* Show English word prominently as the main description */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground/80">
                English: {displayTitle}
              </p>
              {(displayWord || displayTransliteration) && (
                <p className="text-xs text-foreground/60">
                  {displayWord && (
                    <span
                      className="font-semibold"
                      style={{ fontFamily: getLangScript(displayLanguage) }}
                    >
                      {displayWord}
                    </span>
                  )}
                  {displayTransliteration && (
                    <span>
                      {" "}· {displayTransliteration}
                    </span>
                  )}
                  {displayLanguage && (
                    <span>
                      {" "}· {languageLabel(displayLanguage)}
                    </span>
                  )}
                </p>
              )}
              {!displayWord && !displayTransliteration && surfaceText && (
                <p className="text-xs italic text-foreground/60">
                  {verseRef && `${verseRef} · `}
                  {surfaceText}
                </p>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* Loading state */}
          {loading && !wordEntry && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error state */}
          {error && !wordEntry && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Could not load word details for{" "}
                <span className="font-semibold">{surfaceText || strongsId}</span>.
              </p>
            </div>
          )}

          {/* Word entry */}
          {entry && (
            <>
              {/* Language + usage badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {displayLanguage && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold gap-1"
                  >
                    <Languages className="w-3 h-3" />
                    {languageLabel(displayLanguage)}
                  </Badge>
                )}
                {displayUsageCount != null && (
                  <Badge variant="outline" className="text-[10px] font-bold gap-1">
                    <Hash className="w-3 h-3" />
                    {displayUsageCount}× in Scripture
                  </Badge>
                )}
                {displayStrongsId && (
                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                    {displayStrongsId}
                  </Badge>
                )}
              </div>

              {/* ── Verse selector (interactive) ── */}
              {(verseRef || wsBook) && (
                <div className="rounded-lg bg-muted/20 border border-border/50 p-3 space-y-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Verse Context
                    </span>
                    {(wsBook && wsChapter > 0 && wsVerse > 0) && (
                      <Badge variant="outline" className="text-[8px] font-mono px-1.5 py-0 ml-auto">
                        {wsBook} {wsChapter}:{wsVerse}
                      </Badge>
                    )}
                  </div>

                  {/* Book / Chapter / Verse / Translation comboboxes */}
                  <div className="flex flex-wrap items-end gap-1.5">
                    <div className="flex-1 min-w-[100px]">
                      <label className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider">Book</label>
                      <Combobox
                        options={BIBLE_BOOKS.map((b) => ({ value: b, label: b }))}
                        value={wsBook}
                        onChange={(v) => { if (v) setWsBook(v); }}
                        placeholder="Book"
                        searchPlaceholder="Search..."
                        width="w-full"
                      />
                    </div>
                    <div className="w-[80px]">
                      <label className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider">Ch</label>
                      <Combobox
                        options={wsChapList.map((c) => ({ value: String(c), label: String(c) }))}
                        value={String(wsChapter)}
                        onChange={(v) => { if (v) setWsChapter(Number(v)); }}
                        placeholder="-"
                        searchPlaceholder="Find..."
                        disabled={wsChapList.length === 0}
                        width="w-full"
                      />
                    </div>
                    <div className="w-[80px]">
                      <label className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider">Vs</label>
                      <Combobox
                        options={wsVerList.map((v) => ({ value: String(v), label: String(v) }))}
                        value={String(wsVerse)}
                        onChange={(v) => { if (v) setWsVerse(Number(v)); }}
                        placeholder="-"
                        searchPlaceholder="Find..."
                        disabled={wsVerList.length === 0}
                        width="w-full"
                      />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                      <label className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider">Transl</label>
                      <Combobox
                        options={translations?.length ? translations : (translationBadge ? [{ value: translationBadge, label: translationBadge }] : [{ value: "BSB", label: "BSB" }])}
                        value={wsTransl}
                        onChange={(v) => { if (v) setWsTransl(v); }}
                        placeholder="-"
                        searchPlaceholder="Search..."
                        width="w-full"
                      />
                    </div>
                  </div>

                  {/* Verse text preview — use verseText prop if provided, otherwise fall back to local lookup */}
                  {(() => {
                    // If the caller passed verseText, use it directly (avoids "Select a verse to preview")
                    const displayText = verseText || wsPreview;
                    return displayText ? (
                      <div className="rounded-md bg-background/50 border border-border/30 px-2.5 py-1.5">
                        <p className="text-[11px] leading-relaxed text-foreground/70 italic">
                          "{displayText.slice(0, 250)}{displayText.length > 250 ? "…" : ""}"
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/40 italic">
                        Select a verse to preview.
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* Language avatar + original word hero */}
              {displayWord && (
                <div className="flex items-center gap-3 rounded-lg bg-card border border-border/50 p-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: `${getLangColor(displayLanguage)}15`,
                      color: getLangColor(displayLanguage),
                    }}
                  >
                    {getLangLetter(displayLanguage)}
                  </div>
                  <div>
                    <p
                      className="text-lg font-bold text-foreground leading-tight"
                      style={{ fontFamily: getLangScript(displayLanguage) }}
                    >
                      {displayWord}
                    </p>
                    {displayTransliteration && (
                      <p className="text-xs italic text-muted-foreground mt-0.5">
                        {displayTransliteration}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Explanation (shortDefinition) */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  What It Means
                </p>
                <p className="text-sm font-medium text-foreground leading-6">
                  {displayShortDef}
                </p>
              </div>

              {/* Full definition */}
              {displayFullDef && (
                <div className="rounded-lg bg-card border border-border/50 p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    More Detail
                  </p>
                  <p className="text-sm text-foreground/80 leading-6">
                    {displayFullDef}
                  </p>
                </div>
              )}

              {/* Grammar info */}
              {(displayPartOfSpeech || displayGrammaticalCase || displayGender || displayNumber) && (
                <div className="rounded-lg bg-card border border-border/50 p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Grammar
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {displayPartOfSpeech && (
                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-500/5 border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        {displayPartOfSpeech}
                      </Badge>
                    )}
                    {displayGrammaticalCase && (
                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5">
                        {displayGrammaticalCase} case
                      </Badge>
                    )}
                    {displayGender && (
                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5">
                        {displayGender}
                      </Badge>
                    )}
                    {displayNumber && (
                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5">
                        {displayNumber}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Cross References */}
              {displayCrossReferences && (
                <div className="rounded-lg bg-card border border-border/50 p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Cross References
                  </p>
                  <div className="space-y-2">
                    {displayCrossReferences.split(",").map((ref, i) => {
                      const trimmed = ref.trim();
                      const parsed = parseRef(trimmed);
                      return (
                        <div key={i} className="border-l-2 border-primary/20 pl-3 py-0.5">
                          <span className="text-xs font-bold text-primary">
                            {trimmed}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Attached Verses (verse references from verse_word_studies) ── */}
              {displayVerseReferences.length > 0 && (
                <div className="rounded-lg bg-card border border-border/50 p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Bookmark className="w-3 h-3" />
                    Attached Verses
                    <Badge variant="outline" className="text-[8px] font-mono px-1 py-0 ml-auto">
                      {displayVerseReferences.length}
                    </Badge>
                  </p>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {displayVerseReferences.map((ref, i) => {
                      const refStr = ref.verse
                        ? `${ref.bookName} ${ref.chapter}:${ref.verse}`
                        : `${ref.bookName} ${ref.chapter}`;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            onOpenChange(false);
                            navigate(
                              `/lab/dictionary?book=${encodeURIComponent(ref.bookName)}&chapter=${ref.chapter}${ref.verse ? `&verse=${ref.verse}` : ""}`,
                            );
                          }}
                          className="w-full text-left flex items-center gap-2 border-l-2 border-emerald-300 dark:border-emerald-700 pl-3 py-1 hover:bg-muted/30 rounded-r-md transition-colors group"
                        >
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                            {refStr}
                          </span>
                          {ref.surfaceText && (
                            <span className="text-[10px] text-muted-foreground/60 italic">
                              — {ref.surfaceText}
                            </span>
                          )}
                          {ref.adminExplanation && (
                            <span className="text-[9px] text-muted-foreground/40 ml-auto truncate max-w-[120px]">
                              {ref.adminExplanation}
                            </span>
                          )}
                          <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-muted-foreground/50 shrink-0 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin Explanation (study note) */}
              {displayAdminExplanation && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/30 p-3">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                    Study Note
                  </p>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    {displayAdminExplanation}
                  </p>
                </div>
              )}

              {/* Edit button (admin only) */}
              {onEdit && (
                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={onEdit}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Entry
                  </Button>
                </div>
              )}

              {/* View all words in verse — navigates to LabDictionary */}
              {verseRef && (() => {
                const parsed = parseRef(verseRef);
                if (!parsed) return null;
                return (
                  <div className="pt-3 border-t border-border/40">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full gap-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        onOpenChange(false);
                        navigate(
                          `/lab/dictionary?book=${encodeURIComponent(parsed.book)}&chapter=${parsed.chapter}&verse=${parsed.verse}`,
                        );
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View all words in {verseRef}
                    </Button>
                  </div>
                );
              })()}
            </>
          )}

          {/* No data fallback */}
          {!entry && !loading && !error && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {surfaceText
                ? `No study data available for "${surfaceText}".`
                : "No word details available."}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Eye,
  Ear,
  Heart,
  BookText,
  CheckCircle2,
  Sparkles,
  Loader2,
  BookMarked as BookMarkedIcon,
  Check,
  Timer,
  Share2,
  Copy,
  Printer,
  Keyboard,
  Command,
  X,
} from "lucide-react";
import Gate from "@/components/Gate";
import LockedFeatureBadge from "@/components/LockedFeatureBadge";
import TierBadge from "@/components/TierBadge";
import { useSubscription } from "@/hooks/useSubscription";

import { useLanguage } from "@/components/languages/languageProvider";
import { useLabFlow, STAGE_ORDER, LISTEN_OPTIONS, LOOK_PROMPTS } from "@/hooks/useLabFlow";
import { getVerseWords, getStrongsEntry } from "@/services/strongsApi";
import type { StrongsWordData, StrongsEntry as StrongsEntryType } from "@/services/strongsApi";
import { getBookPrologue } from "@/services/bookProloguesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import { getVerseResources, getTranslationComparison } from "@/services/verseResourcesApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";
import { bibleApi } from "@/services/bibleApi";
import type { Verse } from "@/services/bibleApi";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import WordDetailSheet from "@/components/WordDetailSheet";
import LookStage from "./LookStage";
import ListenStage from "./ListenStage";
import LearnStage from "./LearnStage";
import AbideStage from "./AbideStage";

const STAGE_ICONS: Record<string, any> = {
  look: Eye,
  listen: Ear,
  learn: Brain,
  abide: Heart,
};

const STAGE_LABELS: Record<string, string> = {
  look: "What does the text say?",
  listen: "Be still and dwell in the Word",
  learn: "What does this mean?",
  abide: "Record what the Lord has shown you",
};

const STAGE_TIME: Record<string, string> = {
  look: "8–12 min",
  listen: "5–15 min",
  learn: "15–25 min",
  abide: "8–12 min",
};

const STAGE_DESC: Record<string, string> = {
  look: "Observe the passage carefully",
  listen: "Meditate through repetition",
  learn: "Understand the deeper meaning",
  abide: "Apply what you've learned",
};

const STAGE_PURPOSE: Record<string, string> = {
  look: "Look closely at the text. What do you notice? Observation comes before interpretation — train your eyes to see what the text actually says.",
  listen: "Hear the Word repeatedly. Let Scripture sink past your defenses into your heart. This ancient practice of lectio divina opens you to God's voice.",
  learn: "Now dig deeper. Original languages, cross-references, commentaries, and historical context reveal what the passage meant to its first hearers.",
  abide: "The goal of study is transformation. Record what God has shown you, respond in prayer, and commit to one practical step of application.",
};

const SUGGESTED_PASSAGES = [
  { ref: "John 3:16", label: "God's Love", desc: "The Gospel in one verse" },
  { ref: "Psalm 23:1", label: "The Shepherd", desc: "Trust and provision" },
  { ref: "Philippians 4:13", label: "Strength", desc: "Contentment in Christ" },
  { ref: "Romans 8:28", label: "God's Purpose", desc: "Hope in all things" },
  { ref: "Matthew 5:3", label: "Beatitudes", desc: "Kingdom living" },
] as const;

export default function LabFlowPage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const lab = useLabFlow();
  const { isFree } = useSubscription();

  const [passageVerses, setPassageVerses] = useState<Verse[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);
  const [previewText, setPreviewText] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (lab.stage === "look" && lab.bookName && lab.chapter && lab.verseStart) {
      setVersesLoading(true);
      const ch = parseInt(lab.chapter, 10);
      const startV = parseInt(lab.verseStart, 10);
      const endV = lab.verseEnd ? parseInt(lab.verseEnd, 10) : startV;

      bibleApi
        .getVerses("Berean", lab.bookName, ch)
        .then((data) => {
          if (cancelled) return;
          const filtered = data.verses.filter(
            (v) => v.verseNumber >= startV && v.verseNumber <= endV,
          );
          setPassageVerses(filtered);
          setVersesLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setPassageVerses([]);
          setVersesLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [lab.stage, lab.bookName, lab.chapter, lab.verseStart, lab.verseEnd]);

  // ── Passage preview (shown during passage selection) ──
  useEffect(() => {
    let cancelled = false;

    if (lab.bookName && lab.chapter && lab.verseStart) {
      setPreviewLoading(true);
      setPreviewText('');
      const ch = parseInt(lab.chapter, 10);
      const startV = parseInt(lab.verseStart, 10);
      const endV = lab.verseEnd ? parseInt(lab.verseEnd, 10) : Math.min(startV + 2, 176);

      bibleApi
        .getVerses("Berean", lab.bookName, ch)
        .then((data) => {
          if (cancelled) return;
          const filtered = data.verses.filter(
            (v) => v.verseNumber >= startV && v.verseNumber <= endV,
          );
          const combined = filtered.map((v) => `${v.text}`).join(' ');
          setPreviewText(combined);
          setPreviewLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setPreviewText('');
          setPreviewLoading(false);
        });
    } else {
      setPreviewText('');
    }

    return () => {
      cancelled = true;
    };
  }, [lab.bookName, lab.chapter, lab.verseStart, lab.verseEnd]);

  const [verseWords, setVerseWords] = useState<StrongsWordData[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<StrongsEntryType | null>(null);
  const [wordLoadingDetail, setWordLoadingDetail] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (lab.stage === "look" && lab.bookName && lab.chapter) {
      setWordsLoading(true);
      getVerseWords(lab.bookName, Number(lab.chapter), lab.verseStart ? Number(lab.verseStart) : undefined)
        .then((words) => {
          if (cancelled) return;
          setVerseWords(words);
          setWordsLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setWordsLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [lab.stage, lab.bookName, lab.chapter, lab.verseStart]);

  useEffect(() => {
    let cancelled = false;

    if (lab.stage === "learn" && lab.learnTab === "language" && lab.bookName && lab.chapter) {
      setWordsLoading(true);
      getVerseWords(lab.bookName, Number(lab.chapter), lab.verseStart ? Number(lab.verseStart) : undefined)
        .then((words) => {
          if (cancelled) return;
          setVerseWords(words);
          setWordsLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setWordsLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [lab.stage, lab.learnTab, lab.bookName, lab.chapter, lab.verseStart]);

  const [verseResources, setVerseResources] = useState<VerseResourceData | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [translations, setTranslations] = useState<TranslationComparisonEntry[] | null>(null);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [translationsError, setTranslationsError] = useState(false);

  useEffect(() => {
    if (lab.stage === "learn" && lab.learnTab === "history" && lab.bookName && lab.chapter) {
      setResourcesLoading(true);
      getVerseResources(lab.bookName, Number(lab.chapter), lab.verseStart ? Number(lab.verseStart) : 1)
        .then((resources) => {
          setVerseResources(resources);
          setResourcesLoading(false);
        })
        .catch(() => setResourcesLoading(false));

      setTranslationsLoading(true);
      setTranslationsError(false);
      getTranslationComparison(lab.bookName, Number(lab.chapter), lab.verseStart ? Number(lab.verseStart) : 1)
        .then((result) => {
          setTranslations(result);
          setTranslationsLoading(false);
          if (!result) setTranslationsError(true);
        })
        .catch(() => {
          setTranslationsLoading(false);
          setTranslationsError(true);
        });
    }
  }, [lab.stage, lab.learnTab, lab.bookName, lab.chapter, lab.verseStart]);

  const [bookPrologue, setBookPrologue] = useState<BookPrologue | null>(null);
  const [prologueLoading, setPrologueLoading] = useState(false);

  useEffect(() => {
    if (lab.stage === "learn" && lab.learnTab === "prologue" && lab.bookName) {
      setPrologueLoading(true);
      getBookPrologue(lab.bookName)
        .then((prologue) => {
          setBookPrologue(prologue);
          setPrologueLoading(false);
        })
        .catch(() => setPrologueLoading(false));
    }
  }, [lab.stage, lab.learnTab, lab.bookName]);

  const handleWordTap = useCallback(async (strongsId: string) => {
    if (!strongsId) return;
    setWordLoadingDetail(true);
    setWordModalOpen(true);
    try {
      const entry = await getStrongsEntry(strongsId);
      setSelectedWord(entry);
    } catch {
      setSelectedWord(null);
    } finally {
      setWordLoadingDetail(false);
    }
  }, []);



  const maxChapters = useMemo(() => {
    const map: Record<string, number> = {
      Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
      Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
      "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
      Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150,
      Proverbs: 31, Ecclesiastes: 12, "Song of Solomon": 8, Isaiah: 66,
      Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14,
      Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3,
      Habakkuk: 3, Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
      Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
      Romans: 16, "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6,
      Ephesians: 6, Philippians: 4, Colossians: 4, "1 Thessalonians": 5,
      "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, Titus: 3,
      Philemon: 1, Hebrews: 13, James: 5, "1 Peter": 5, "2 Peter": 3,
      "1 John": 5, "2 John": 1, "3 John": 1, Jude: 1, Revelation: 22,
    };
    return map[lab.bookName] || 50;
  }, [lab.bookName]);

  const currentStageIdx = STAGE_ORDER.indexOf(lab.stage as any);

  const overallProgress = currentStageIdx >= 0 ? Math.round((currentStageIdx / (STAGE_ORDER.length - 1)) * 100) : 0;

  const renderStageProgress = () => (
    <div className="px-4 sm:px-6 py-3 bg-muted/20 border-b border-border/30" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto">
        {/* Overall progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
              {overallProgress}% complete
            </span>
            <span className="text-muted-foreground/20">|</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-muted-foreground/50">
              <Timer className="w-2.5 h-2.5" />
              {STAGE_TIME[lab.stage] || ""}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
        {STAGE_ORDER.map((s, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const IconComp = STAGE_ICONS[s];

          return (
            <button
              key={s}
              onClick={() => { if (isDone) lab.goToStage(s); }}
              className={cn(
                "flex items-center gap-2 transition-all [touch-action:manipulation]",
                isDone && "cursor-pointer hover:opacity-80",
                isCurrent && "cursor-default",
                !isDone && !isCurrent && "cursor-default opacity-35",
              )}
              disabled={!isDone && !isCurrent}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm",
                  isDone && "bg-green-500 text-white shadow-green-500/20",
                  isCurrent && "bg-primary text-primary-foreground shadow-primary/20 ring-2 ring-primary/30",
                  !isDone && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <IconComp className="w-4 h-4" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-wider leading-none",
                  isDone && "text-green-600",
                  isCurrent && "text-primary",
                  !isDone && !isCurrent && "text-muted-foreground",
                )}>
                  {s}
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5 leading-none">
                  {STAGE_DESC[s]}
                </p>
              </div>
              {idx < STAGE_ORDER.length - 1 && (
                <div className={cn(
                  "hidden sm:block w-8 h-px mx-1",
                  isDone ? "bg-green-300" : "bg-border/50",
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  </div>
  );

  const renderPassageSelection = () => (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col items-center pb-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-lg shadow-primary/10 ring-1 ring-primary/10">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground text-center tracking-tight">
          Choose Your Passage
        </h2>
        <p className="text-sm text-muted-foreground/70 text-center max-w-sm mt-1.5 leading-relaxed">
          Select the Scripture you want to study through the 4-step journey.
        </p>
      </div>

      {/* Book selection — searchable combobox */}
      <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm">
        <div className="p-4 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary/60" />
            </div>
            <p className="text-xs font-bold text-foreground">Book</p>
          </div>
        </div>
        <div className="p-4">
          <Combobox
            options={lab.BOOK_NAMES.map((b) => ({ value: b, label: b }))}
            value={lab.bookName || ""}
            onChange={(value) =>
              lab.update({ bookName: value, chapter: "", verseStart: "", verseEnd: "" })
            }
            placeholder="Select a book..."
            searchPlaceholder="Search 66 books..."
            width="w-full"
          />
          <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
            Type to search — OT: 39 books, NT: 27 books
          </p>
        </div>
      </div>

      {/* Chapter selection — searchable combobox */}
      {lab.bookName && (
        <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm">
          <div className="p-4 pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                <BookText className="w-3.5 h-3.5 text-primary/60" />
              </div>
              <p className="text-xs font-bold text-foreground">Chapter</p>
            </div>
          </div>
          <div className="p-4">
            <Combobox
              options={Array.from({ length: maxChapters }, (_, i) => ({
                value: String(i + 1),
                label: `Chapter ${i + 1}`,
              }))}
              value={lab.chapter || ""}
              onChange={(value) =>
                lab.update({ chapter: value, verseStart: "", verseEnd: "" })
              }
              placeholder={`Select chapter (1–${maxChapters})...`}
              searchPlaceholder="Search chapters..."
              width="w-full"
            />
            <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
              {lab.bookName} has {maxChapters} chapter{maxChapters !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Verse selection — searchable comboboxes */}
      {lab.bookName && lab.chapter && (
        <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm">
          <div className="p-4 pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary/60" />
              </div>
              <p className="text-xs font-bold text-foreground">Verse(s)</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-muted-foreground/60 mb-1 block">From</label>
                <Combobox
                  options={Array.from({ length: 176 }, (_, i) => ({
                    value: String(i + 1),
                    label: `Verse ${i + 1}`,
                  }))}
                  value={lab.verseStart || ""}
                  onChange={(value) =>
                    lab.update({
                      verseStart: value,
                      verseEnd: lab.verseEnd && value ? "" : lab.verseEnd,
                    })
                  }
                  placeholder="Select start verse..."
                  searchPlaceholder="Search verses..."
                  width="w-full"
                />
              </div>
              <div className="flex items-center pt-7">
                <div className="w-4 h-px bg-border/40" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-muted-foreground/60 mb-1 block">To (optional)</label>
                <Combobox
                  options={Array.from({ length: 176 }, (_, i) => ({
                    value: String(i + 1),
                    label: `Verse ${i + 1}`,
                  }))}
                  value={lab.verseEnd || ""}
                  onChange={(value) => lab.update({ verseEnd: value })}
                  placeholder="–"
                  searchPlaceholder="Search verses..."
                  width="w-full"
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/50 text-center">
              Leave &ldquo;To&rdquo; empty for a single verse, or select an end verse for a range.
            </p>
          </div>
        </div>
      )}

      {lab.error && (
        <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4 text-center">
          <p className="text-xs font-semibold text-destructive">{lab.error}</p>
        </div>
      )}

      {/* Passage Preview — shown when a passage is selected */}
      {lab.bookName && lab.chapter && lab.verseStart && (
        <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 bg-muted/15">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-primary/60" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Passage Preview</p>
                <p className="text-[9px] text-muted-foreground/60">
                  {lab.bookName} {lab.chapter}:{lab.verseStart}{lab.verseEnd ? `–${lab.verseEnd}` : ''}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {previewLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground/50 italic">Loading passage...</span>
              </div>
            ) : previewText ? (
              <p className="text-sm text-foreground/80 leading-6 font-serif italic tracking-wide">
                &ldquo;{previewText.length > 350 ? previewText.slice(0, 350) + '...' : previewText}&rdquo;
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/40 italic">Could not load preview.</p>
            )}
          </div>
          {previewText.length >= 120 && (
            <div className="px-4 py-1.5 bg-muted/10 border-t border-border/20">
              <p className="text-[9px] text-muted-foreground/50 text-center">
                Full passage will be displayed in the <strong className="text-foreground/60">Look</strong> stage
              </p>
            </div>
          )}
        </div>
      )}

      {/* Begin Study */}
      {isFree && lab.bookName && lab.chapter && lab.verseStart ? (
        <LockedFeatureBadge
          compact
          featureName="Exegesis Lab"
          featureDescription="The 4-stage study journey is available for Legacy Sower and Covenant Sower subscribers."
        />
      ) : (
        <button
          onClick={lab.startSession}
          disabled={lab.loading || !lab.bookName || !lab.chapter || !lab.verseStart}
          className={cn(
            "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-primary-foreground font-extrabold text-sm transition-all",
            lab.loading || !lab.bookName || !lab.chapter || !lab.verseStart
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/30",
          )}
        >
          {lab.loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {lab.loading ? "Starting..." : "Begin Study Journey"}
        </button>
      )}

      {/* Passage suggestions — shown when no passage is selected yet */}
      {!lab.bookName && (
        <div className="-mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
            <p className="text-xs font-bold text-foreground">Not sure where to start?</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_PASSAGES.map((p) => {
              const match = p.ref.match(/^(.+?)\s+(\d+):(\d+)$/);
              const book = match?.[1] || "";
              const chapter = match?.[2] || "";
              const verse = match?.[3] || "";
              return (
                <button
                  key={p.ref}
                  onClick={() =>
                    lab.update({
                      bookName: book,
                      chapter,
                      verseStart: verse,
                      verseEnd: "",
                    })
                  }
                  className="rounded-xl bg-card border border-border p-3 text-left hover:bg-muted/50 hover:border-primary/30 transition-all active:scale-[0.98] [touch-action:manipulation]"
                >
                  <p className="text-xs font-bold text-foreground">
                    {p.ref}
                  </p>
                  <p className="text-[11px] text-primary font-semibold mt-0.5">
                    {p.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/40 text-center leading-relaxed pb-4">
        Enter a verse number to study a single verse, or add an end verse for a range.
      </p>
    </div>
  );



  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcutHint, setShortcutHint] = useState<string | null>(null);
  const shortcutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Format study as shareable text ──
  const formatStudyAsText = () => {
    const lines: string[] = [];
    lines.push(`📖 Bible Study: ${lab.passageRef || `${lab.bookName} ${lab.chapter}:${lab.verseStart}${lab.verseEnd ? `-${lab.verseEnd}` : ''}`}`);
    lines.push(`─`.repeat(50));
    lines.push('');

    if (lab.lookNotes) {
      lines.push('🔍 LOOK — Observations');
      try {
        const parsed = JSON.parse(lab.lookNotes);
        if (typeof parsed === 'object' && parsed !== null) {
          const entries = Object.entries(parsed).filter(([_, v]) => (v as string).trim());
          entries.forEach(([key, val]) => { lines.push(`${Number(key) + 1}. ${val}`); });
        }
      } catch { lines.push(lab.lookNotes); }
      lines.push('');
    }

    if (lab.learnNotes) {
      lines.push('📚 LEARN — Study Notes');
      lines.push(lab.learnNotes);
      lines.push('');
    }

    if (lab.reflection) { lines.push('💭 REFLECTION'); lines.push(lab.reflection); lines.push(''); }
    if (lab.prayer) { lines.push('🙏 PRAYER'); lines.push(lab.prayer); lines.push(''); }
    if (lab.appText) { lines.push('✨ APPLICATION — Practical Step'); lines.push(lab.appText); lines.push(''); }

    if (lab.tags) {
      const tagList = lab.tags.split(/\s+/).filter(Boolean);
      if (tagList.length > 0) { lines.push(`🏷️ Tags: ${tagList.join(' ')}`); lines.push(''); }
    }

    lines.push(`─`.repeat(50));
    lines.push('Created with Exegesis Bible App');
    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatStudyAsText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard not available
    }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Bible Study: ${lab.passageRef || `${lab.bookName} ${lab.chapter}:${lab.verseStart}`}`,
          text: formatStudyAsText(),
        });
      } else {
        // Fallback: copy to clipboard (without touching copy button state)
        await navigator.clipboard.writeText(formatStudyAsText());
      }
    } catch {
      // User cancelled or share failed
    } finally {
      setSharing(false);
    }
  };

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const isActiveStage = lab.stage && STAGE_ORDER.includes(lab.stage as any);
    const currentIdx = isActiveStage ? STAGE_ORDER.indexOf(lab.stage as any) : -1;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) return;

      const isMeta = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + Enter → advance to next stage
      if (isMeta && e.key === 'Enter') {
        e.preventDefault();
        if (lab.stage === 'look' && !lab.saving) {
          lab.advanceLook();
          showHint('→ Listen stage');
        } else if (lab.stage === 'listen') {
          lab.advanceListen();
          showHint('→ Learn stage');
        } else if (lab.stage === 'learn' && !lab.saving) {
          lab.advanceLearn();
          showHint('→ Abide stage');
        } else if (lab.stage === 'abide' && !lab.saving) {
          lab.saveAbide();
          showHint('→ Complete!');
        }
        return;
      }

      // Ctrl/Cmd + S → save progress
      if (isMeta && e.key === 's') {
        e.preventDefault();
        lab.saveCurrentProgress();
        showHint('Progress saved');
        return;
      }

      // ? → toggle keyboard shortcuts help
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      // Escape → go back
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        // Let default browser behavior handle escape
        return;
      }

      // 1–4 → jump to completed stages
      const stageIndex = parseInt(e.key, 10) - 1;
      if (
        !isMeta &&
        stageIndex >= 0 &&
        stageIndex < STAGE_ORDER.length &&
        stageIndex < currentIdx
      ) {
        const targetStage = STAGE_ORDER[stageIndex];
        lab.goToStage(targetStage);
        showHint(`Jump to ${targetStage}`);
        return;
      }

      // r → reset (only on completed stage)
      if (e.key === 'r' && lab.stage === 'completed') {
        lab.resetAll();
        showHint('New study');
        return;
      }
    };

    const showHint = (msg: string) => {
      setShortcutHint(msg);
      if (shortcutTimeoutRef.current) clearTimeout(shortcutTimeoutRef.current);
      shortcutTimeoutRef.current = setTimeout(() => setShortcutHint(null), 2000);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (shortcutTimeoutRef.current) clearTimeout(shortcutTimeoutRef.current);
    };
  }, [lab.stage, lab.saving, showShortcuts]);

  const handlePrintPdf = async () => {
    setPrinting(true);
    try {
      const passageTitle = lab.passageRef || `${lab.bookName} ${lab.chapter}:${lab.verseStart}${lab.verseEnd ? `-${lab.verseEnd}` : ''}`;

      // HTML-escape user content to prevent XSS in the print window
      const esc = (s: string) => s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const nl2br = (s: string) => esc(s).replace(/\n/g, '<br/>');

      // Format look notes — parse JSON or handle as plain text
      const formatLookHtml = (raw: string): string => {
        try {
          const parsed = JSON.parse(raw);
          if (typeof parsed === 'object' && parsed !== null) {
            const entries = Object.entries(parsed).filter(([_, v]) => (v as string).trim());
            return entries.map(([key, val]) => `<b>Prompt ${Number(key) + 1}:</b><br/>${esc(val as string)}`).join('<br/><br/>');
          }
        } catch {}
        return nl2br(raw);
      };

      const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const dateStr = esc(now);
      const passageEsc = esc(passageTitle);

      const sections = [
        lab.lookNotes && `<h2>🔍 Look — Observations</h2><div class="section content">${formatLookHtml(lab.lookNotes)}</div>`,
        lab.learnNotes && `<h2>📚 Learn — Study Notes</h2><div class="section content">${nl2br(lab.learnNotes)}</div>`,
        lab.reflection && `<h2>💭 Reflection</h2><div class="section content">${nl2br(lab.reflection)}</div>`,
        lab.prayer && `<h2>🙏 Prayer</h2><div class="section content">${nl2br(lab.prayer)}</div>`,
        lab.appText && `<h2>✨ Application</h2><div class="section content">${nl2br(lab.appText)}</div>`,
        lab.tags && `<h2>🏷️ Tags</h2><div class="section">${lab.tags.split(/\s+/).filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}</div>`,
      ].filter(Boolean).join('\n');

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bible Study: ${passageEsc}</title>
  <style>
    @page { margin: 1.5cm; }
    * { box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { font-size: 22pt; font-weight: 700; text-align: center; color: #1a1a1a; margin-bottom: 4px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
    .subtitle { text-align: center; font-size: 10pt; color: #6b7280; margin-bottom: 24px; }
    h2 { font-size: 14pt; font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 20px; margin-bottom: 8px; }
    .section { margin-bottom: 16px; padding-left: 4px; }
    .content { font-size: 11pt; color: #374151; line-height: 1.7; }
    .tag { display: inline-block; font-size: 9pt; color: #6b7280; border: 1px solid #d1d5db; border-radius: 4px; padding: 1px 8px; margin: 2px 3px; }
    .footer { margin-top: 32px; text-align: center; font-size: 9pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>📖 Bible Study: ${passageEsc}</h1>
  <p class="subtitle">Created with Exegesis Bible App · ${dateStr}</p>

  ${sections}

  <div class="footer">Created with Exegesis Bible App · ${dateStr}</div>

  <script>
    window.onload = function() { window.print(); };
    window.onafterprint = function() { window.close(); };
    setTimeout(function() { window.close(); }, 30000);
  <\/script>
</body>
</html>`;

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
    } catch {
      // Print window blocked or failed
    } finally {
      setTimeout(() => setPrinting(false), 1000);
    }
  };

  const renderCompletedStage = () => (
    <div className="flex flex-col items-center pt-12 gap-5">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center shadow-xl shadow-green-500/10 ring-1 ring-green-500/20">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Study Complete!</h2>
        <p className="text-sm text-muted-foreground/70 mt-2 max-w-sm leading-relaxed">
          Your exegesis has been saved to the Legacy Ledger. Export, share, or start a new study.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs mt-1">
        <Button
          onClick={handlePrintPdf}
          variant="outline"
          disabled={printing}
          className="gap-1.5 h-10 rounded-xl text-[11px] font-semibold border-border/60"
          title="Save as PDF"
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF</span>
        </Button>
        <Button
          onClick={handleCopy}
          variant="outline"
          className={cn(
            "gap-1.5 h-10 rounded-xl text-[11px] font-semibold border-border/60 transition-all",
            copied && "border-green-400 bg-green-50 dark:bg-green-950/20 text-green-600",
          )}
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Copied</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Copy</span></>
          )}
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          disabled={sharing}
          className="gap-1.5 h-10 rounded-xl text-[11px] font-semibold border-border/60"
        >
          {sharing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Share2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{sharing ? '' : 'Share'}</span>
        </Button>
      </div>

      <div className="border-t border-border/30 pt-4 flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={() => navigate(routes.journal.path)}
          className="gap-2 h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20"
        >
          <BookMarkedIcon className="w-4 h-4" />
          Open Legacy Ledger
        </Button>
        <Button
          variant="outline"
          onClick={lab.resetAll}
          className="gap-2 h-11 rounded-xl border-border/60 text-sm font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          Start Another Study
        </Button>
      </div>
    </div>
  );

  const stageTitle = lab.stage === "passage"
    ? "Select Passage"
    : lab.stage === "look"
      ? "Look"
      : lab.stage === "listen"
        ? "Listen"
        : lab.stage === "learn"
          ? "Learn"
          : lab.stage === "abide"
            ? "Abide"
            : "Complete";

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <header className="flex-shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (lab.stage !== "passage" && lab.completed !== undefined) {
                  lab.saveCurrentProgress(true);
                }
                navigate(-1);
              }}
              className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-xl bg-muted/30 flex items-center justify-center hover:bg-muted/50 active:scale-[0.93] transition-all [touch-action:manipulation]"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1
                className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Exegesis Lab
              </h1>
              <p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase leading-none mt-0.5">
                {stageTitle}
              </p>
            </div>
          </div>
          <TierBadge />
        </div>
      </header>

      {lab.stage !== "passage" && lab.stage !== "completed" && renderStageProgress()}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
          {lab.loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Loading...</p>
            </div>
          ) : lab.stage === "passage" ? (
            renderPassageSelection()
          ) : (
            <Gate
              featureName="Exegesis Lab"
              featureDescription="The full 4-stage Scripture study journey (Look, Listen, Learn, Abide) is available for Legacy Sower and Covenant Sower subscribers."
            >
              {/* Why This Stage — teaching card */}
              {lab.stage && lab.stage !== "completed" && (
                <div className="rounded-xl bg-gradient-to-br from-primary/[0.03] to-primary/[0.01] border border-primary/10 p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-0.5">
                        Why This Stage Matters
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {STAGE_PURPOSE[lab.stage]}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border/30 shrink-0">
                      <Timer className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-[9px] font-bold text-muted-foreground/70">{STAGE_TIME[lab.stage]}</span>
                    </div>
                  </div>
                </div>
              )}

              {lab.stage === "look" && (
                <LookStage
                  lookNotes={lab.lookNotes}
                  currentPromptIdx={lab.currentPromptIdx}
                  passageRef={lab.passageRef}
                  passageVerses={passageVerses}
                  versesLoading={versesLoading}
                  verseWords={verseWords}
                  wordsLoading={wordsLoading}
                  onWordTap={handleWordTap}
                  saving={lab.saving}
                  onUpdate={lab.update}
                  onAdvance={lab.advanceLook}
                  onSaveProgress={() => lab.saveCurrentProgress()}
                  stageLabel={STAGE_LABELS.look}
                  lookPrompts={LOOK_PROMPTS}
                />
              )}
              {lab.stage === "listen" && (
                <ListenStage
                  selectedRepeats={lab.selectedRepeats}
                  repeatCount={lab.repeatCount}
                  listenComplete={lab.listenComplete}
                  passageRef={lab.passageRef}
                  bookName={lab.bookName}
                  chapter={lab.chapter}
                  verseStart={lab.verseStart}
                  verseEnd={lab.verseEnd}
                  passageVerses={passageVerses.map((v) => ({ text: v.text }))}
                  onUpdate={lab.update}
                  onStartListening={lab.startListening}
                  onResetListening={lab.resetListening}
                  onAdvance={lab.advanceListen}
                  onIncrementRepeat={lab.incrementRepeat}
                  stageLabel={STAGE_LABELS.listen}
                  listenOptions={LISTEN_OPTIONS}
                />
              )}
              {lab.stage === "learn" && (
                <LearnStage
                  learnNotes={lab.learnNotes}
                  bookName={lab.bookName}
                  chapter={lab.chapter}
                  verseStart={lab.verseStart}
                  passageRef={lab.passageRef}
                  saving={lab.saving}
                  verseWords={verseWords}
                  wordsLoading={wordsLoading}
                  bookPrologue={bookPrologue}
                  prologueLoading={prologueLoading}
                  verseResources={verseResources}
                  resourcesLoading={resourcesLoading}
                  translations={translations}
                  translationsLoading={translationsLoading}
                  translationsError={translationsError}
                  isPublic={lab.isPublic}
                  onUpdate={lab.update}
                  onAdvance={lab.advanceLearn}
                  onSaveProgress={() => lab.saveCurrentProgress()}
                  onWordTap={handleWordTap}
                  stageLabel={STAGE_LABELS.learn}
                />
              )}
              {lab.stage === "abide" && (
                <AbideStage
                  reflection={lab.reflection}
                  prayer={lab.prayer}
                  appText={lab.appText}
                  tags={lab.tags}
                  isPublic={lab.isPublic}
                  passageRef={lab.passageRef}
                  saving={lab.saving}
                  onUpdate={lab.update}
                  onSaveAbide={lab.saveAbide}
                  onSaveProgress={() => lab.saveCurrentProgress()}
                  stageLabel={STAGE_LABELS.abide}
                />
              )}
              {lab.stage === "completed" && renderCompletedStage()}
            </Gate>
          )}
        </div>
      </div>

      <WordDetailSheet
        open={wordModalOpen}
        onOpenChange={setWordModalOpen}
        strongsId={selectedWord?.strongsId || null}
        wordEntry={selectedWord as any || null}
        verseRef={lab.passageRef || (lab.bookName && lab.verseStart ? `${lab.bookName} ${lab.chapter}:${lab.verseStart}` : undefined)}
        translationBadge="BSB"
      />

      {/* ── Floating keyboard shortcut hint toast ── */}
      {shortcutHint && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/10 backdrop-blur-md border border-border/40 shadow-lg">
            <Command className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span className="text-xs font-semibold text-foreground/80">{shortcutHint}</span>
          </div>
        </div>
      )}

      {/* ── Floating keyboard shortcut toggle button ── */}
      <button
        onClick={() => setShowShortcuts((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-9 h-9 rounded-xl bg-background/80 backdrop-blur-md border border-border/40 shadow-md flex items-center justify-center hover:bg-muted/50 active:scale-[0.93] transition-all"
        title="Keyboard shortcuts (?)"
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4 text-muted-foreground/70" />
      </button>

      {/* ── Keyboard shortcuts help modal ── */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-card border border-border/60 shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShortcuts(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/60 active:scale-[0.93] transition-all"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground/60" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Keyboard Shortcuts</h3>
            </div>

            <div className="space-y-3">
              <ShortcutRow
                keys={['Ctrl', 'Enter']}
                label="Advance to next stage"
                available={
                  (lab.stage === 'look' ||
                    lab.stage === 'listen' ||
                    lab.stage === 'learn' ||
                    lab.stage === 'abide') &&
                  !lab.saving
                }
              />
              <ShortcutRow
                keys={['Ctrl', 'S']}
                label="Save current progress"
                available={
                  lab.stage !== 'passage' && lab.stage !== 'completed'
                }
              />
              <ShortcutRow
                keys={['?']}
                label="Toggle keyboard shortcuts"
                available={true}
              />
              <Divider />
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">
                Jump to stage
              </p>
              {STAGE_ORDER.map((s, idx) => {
                const currentIdx = STAGE_ORDER.indexOf(lab.stage as any);
                const unlocked = idx < currentIdx;
                return (
                  <ShortcutRow
                    key={s}
                    keys={[String(idx + 1)]}
                    label={`Go to ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                    available={unlocked}
                  />
                );
              })}
              <Divider />
              <ShortcutRow
                keys={['R']}
                label="Start a new study"
                available={lab.stage === 'completed'}
              />
            </div>

            <p className="text-[10px] text-muted-foreground/50 text-center mt-5 pt-4 border-t border-border/30">
              Shortcuts are disabled while typing in text fields.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper components ──

function ShortcutRow({
  keys,
  label,
  available,
}: {
  keys: string[];
  label: string;
  available: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn(
        "text-xs font-medium",
        available ? "text-foreground/80" : "text-muted-foreground/40",
      )}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className={cn(
            "inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md text-[10px] font-bold",
            available
              ? "bg-muted text-foreground/80 border border-border/50 shadow-sm"
              : "bg-muted/30 text-muted-foreground/30 border border-border/30",
          )}>
            {key === 'Ctrl' ? (
              <span className="flex items-center gap-0.5">
                <Command className="w-2.5 h-2.5" />
                <span>Ctrl</span>
              </span>
            ) : (
              key
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border/30 my-1" />;
}

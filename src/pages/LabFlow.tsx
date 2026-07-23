import { useState, useCallback, useEffect, useMemo } from "react";
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
} from "lucide-react";
import Gate from "@/components/Gate";
import LockedFeatureBadge from "@/components/LockedFeatureBadge";
import TierBadge from "@/components/TierBadge";
import { useSubscription } from "@/hooks/useSubscription";

import { useLanguage } from "@/components/languages/languageProvider";
import { useLabFlow, STAGE_ORDER, LISTEN_OPTIONS, LOOK_PROMPTS, LEARN_TABS } from "@/hooks/useLabFlow";
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
import { Badge } from "@/components/ui/badge";
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

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function LabFlowPage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const lab = useLabFlow();
  const { isFree } = useSubscription();

  // ── Passage verses for display ──
  const [passageVerses, setPassageVerses] = useState<Verse[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);

  // Fetch verse text when entering look stage (or when book/chapter changes)
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

  // ── Strong's word modal state ──
  const [verseWords, setVerseWords] = useState<StrongsWordData[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<StrongsEntryType | null>(null);
  const [wordLoadingDetail, setWordLoadingDetail] = useState(false);

  // Fetch Strong's words when entering look stage
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

  // Fetch Strong's words when entering learn stage on the language tab
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

  // ── Verse resources state (History tab) ──
  const [verseResources, setVerseResources] = useState<VerseResourceData | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [translations, setTranslations] = useState<TranslationComparisonEntry[] | null>(null);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [translationsError, setTranslationsError] = useState(false);

  // Fetch verse resources when entering learn stage on the history tab
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

  // ── Book prologue state ──
  const [bookPrologue, setBookPrologue] = useState<BookPrologue | null>(null);
  const [prologueLoading, setPrologueLoading] = useState(false);

  // Fetch book prologue when entering learn stage on the prologue tab
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

  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [covenant, setCovenant] = useState<"all" | "ot" | "nt">("all");

  const filteredBooks = useMemo(() => {
    if (covenant === "ot") return lab.BOOK_NAMES.slice(0, 39);
    if (covenant === "nt") return lab.BOOK_NAMES.slice(39);
    return lab.BOOK_NAMES;
  }, [covenant, lab.BOOK_NAMES]);

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

  // ── Stage progress indicator ──
  const currentStageIdx = STAGE_ORDER.indexOf(lab.stage as any);

  const renderStageProgress = () => (
    <div
      className="flex items-center justify-center gap-6 py-2 px-4 mb-1"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {STAGE_ORDER.map((s, idx) => {
        const isDone = idx < currentStageIdx;
        const isCurrent = idx === currentStageIdx;
        const IconComp = STAGE_ICONS[s];

        return (
          <button
            key={s}
            onClick={() => {
              if (isDone) lab.goToStage(s);
            }}
            className={cn(
              "flex flex-col items-center gap-1 transition-all [touch-action:manipulation]",
              isDone && "cursor-pointer hover:opacity-80 active:scale-[0.96]",
              isCurrent && "cursor-default",
              !isDone && !isCurrent && "cursor-default opacity-40",
            )}
            disabled={!isDone && !isCurrent}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isDone && "bg-green-500 text-white",
                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                !isDone && !isCurrent && "bg-muted text-muted-foreground",
              )}
            >
              {isDone ? (
                <Check className="w-4 h-4" />
              ) : (
                <IconComp className="w-4 h-4" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                isDone && "text-green-500",
                isCurrent && "text-primary",
                !isDone && !isCurrent && "text-muted-foreground",
              )}
            >
              {s}
            </span>
          </button>
        );
      })}
    </div>
  );

  // ── Passage Selection ──
  const renderPassageSelection = () => (
    <div className="flex flex-col gap-5 pt-4">
      <div className="flex flex-col items-center pb-2">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-3">
          <BookOpen className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-black text-foreground text-center">
          Choose Your Passage
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
          Select the Scripture you want to study through the 4-step journey.
        </p>
      </div>

      {/* Book selection */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Book
        </p>
        {lab.bookName ? (
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="text-sm font-bold px-3 py-1.5 bg-primary/10 border-primary/30 text-primary"
            >
              {lab.bookName}
            </Badge>
            <button
              onClick={() => setShowBookPicker(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline active:scale-[0.95] [touch-action:manipulation]"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            {/* Covenant filter */}
            <div className="flex items-center gap-1.5 mb-2">
              {(["all", "ot", "nt"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCovenant(c)}
                  className={cn(
                    "min-h-[44px] px-3 py-1 rounded-full text-[11px] font-bold border transition-colors active:scale-[0.97] [touch-action:manipulation]",
                    covenant === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border",
                  )}
                >
                  {c === "all" ? "All" : c === "ot" ? "OT (39)" : "NT (27)"}
                </button>
              ))}
            </div>

            {/* Book grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 max-h-60 overflow-y-auto p-1">
              {filteredBooks.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    lab.update({ bookName: b, chapter: "", verseStart: "", verseEnd: "" });
                    setShowBookPicker(false);
                  }}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors text-left active:scale-[0.97] [touch-action:manipulation]",
                    lab.bookName === b
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-muted",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Chapter selection */}
      {lab.bookName && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Chapter
          </p>
          {lab.chapter ? (
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="text-sm font-bold px-3 py-1.5 bg-primary/10 border-primary/30 text-primary"
              >
                {lab.bookName} {lab.chapter}
              </Badge>
              <button
                onClick={() => setShowChapterPicker(true)}
                className="text-xs text-muted-foreground hover:text-foreground underline active:scale-[0.95] [touch-action:manipulation]"
              >
                Change
              </button>
            </div>
          ) : null}

          {/* Chapter grid */}
          {!lab.chapter && (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-40 overflow-y-auto p-1">
              {Array.from({ length: maxChapters }, (_, i) => i + 1).map((ch) => (
                <button
                  key={ch}
                  onClick={() => lab.update({ chapter: String(ch), verseStart: "", verseEnd: "" })}
                  className={cn(
                    "px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors active:scale-[0.97] [touch-action:manipulation]",
                    lab.chapter === String(ch)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-muted",
                  )}
                >
                  {ch}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verse selection */}
      {lab.bookName && lab.chapter && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Verse(s)
          </p>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              min={1}
              placeholder="Start"
              value={lab.verseStart}
              onChange={(e) => lab.update({ verseStart: e.target.value, verseEnd: lab.verseEnd && e.target.value ? "" : lab.verseEnd })}
              className="w-24 h-9 rounded-lg border border-border bg-card text-foreground text-sm font-semibold text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <span className="text-muted-foreground text-xs font-bold">to</span>
            <input
              type="number"
              min={1}
              placeholder="End"
              value={lab.verseEnd}
              onChange={(e) => lab.update({ verseEnd: e.target.value })}
              className="w-24 h-9 rounded-lg border border-border bg-card text-foreground text-sm font-semibold text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Enter a verse number, or add an end verse for a range.
          </p>
        </div>
      )}

      {/* Error */}
      {lab.error && (
        <p className="text-xs font-semibold text-destructive text-center">{lab.error}</p>
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
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-primary-foreground font-extrabold text-sm transition-all",
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
          {lab.loading ? "Starting..." : "Begin Study"}
        </button>
      )}

      {/* Tip */}
      <p className="text-[11px] text-muted-foreground text-center leading-5 pb-4">
        Tap once for a single verse. Enter an end verse to select a range.
      </p>
    </div>
  );

  // ── Completed Stage ──
  const renderCompletedStage = () => (
    <div className="flex flex-col items-center pt-8 gap-4">
      <div className="w-24 h-24 rounded-full bg-green-500/15 flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-xl font-black text-foreground text-center">
        Study Complete!
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Your exegesis has been saved to the Legacy Ledger. You can view it in
        your journal.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
        <Button
          onClick={() => navigate(routes.journal.path)}
          className="gap-2"
        >
          <BookMarkedIcon className="w-4 h-4" />
          Open Legacy Ledger
        </Button>
        <Button
          variant="outline"
          onClick={lab.resetAll}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Start Another Study
        </Button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════

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
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (lab.stage !== "passage" && lab.completed !== undefined) {
                  lab.saveCurrentProgress(true);
                }
                navigate(-1);
              }}
              className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 active:scale-[0.93] transition-all [touch-action:manipulation]"
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
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                {stageTitle}
              </p>
            </div>
          </div>

          {/* ── Subscription Tier Badge ── */}
          <TierBadge />
        </div>

        {/* Stage progress indicator */}
        {lab.stage !== "passage" && lab.stage !== "completed" && renderStageProgress()}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-16">
          {/* Loading */}
          {lab.loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">Loading...</p>
            </div>
          ) : lab.stage === "passage" ? (
            renderPassageSelection()
          ) : (
            <Gate
              featureName="Exegesis Lab"
              featureDescription="The full 4-stage Scripture study journey (Look, Listen, Learn, Abide) is available for Legacy Sower and Covenant Sower subscribers."
            >
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
                  learnTab={lab.learnTab}
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
                  onUpdate={lab.update}
                  onAdvance={lab.advanceLearn}
                  onSaveProgress={() => lab.saveCurrentProgress()}
                  onWordTap={handleWordTap}
                  stageLabel={STAGE_LABELS.learn}
                  learnTabs={LEARN_TABS}
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

      {/* ── Strong's Word Detail Sheet ── */}
      <WordDetailSheet
        open={wordModalOpen}
        onOpenChange={setWordModalOpen}
        strongsId={selectedWord?.strongsId || null}
        wordEntry={selectedWord as any || null}
        verseRef={lab.passageRef || (lab.bookName && lab.verseStart ? `${lab.bookName} ${lab.chapter}:${lab.verseStart}` : undefined)}
        translationBadge="BSB"
      />
    </div>
  );
}

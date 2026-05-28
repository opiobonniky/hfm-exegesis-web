"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Save,
  Loader2,
  Sparkles,
  ScrollText,
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getVerseText } from "@/utilities/bibleUtils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const BIBLE_BOOKS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalm",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];

const BIBLE_VERSIONS = [
  "KJV",
  "NIV",
  "ESV",
  "NASB",
  "NLT",
  "NKJV",
  "CSB",
  "RSV",
  "ASV",
  "AMP",
  "MSG",
  "WEB",
];

// ─────────────────────────────────────────────
// Live character counter
// ─────────────────────────────────────────────
function CharCount({ value, max }: { value: string; max: number }) {
  const pct = value.length / max;
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        pct > 0.9
          ? "text-destructive"
          : pct > 0.7
            ? "text-amber-500"
            : "text-muted-foreground",
      )}
    >
      {value.length}/{max}
    </span>
  );
}

// ─────────────────────────────────────────────
// Live preview panel
// ─────────────────────────────────────────────
function LivePreview({
  bookName,
  chapter,
  verseNumber,
  bibleVersion,
  explanation,
  learnMore,
  t,
}: {
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion: string;
  explanation: string;
  learnMore: string;
  t: any;
}) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  const renderContent = (text: string) => {
    const lines = text
      .replace(/\r/g, "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) {
      return (
        <p className="text-sm text-muted-foreground/50 italic">
          {t.verseExplanations.nothingToPreview}
        </p>
      );
    }
    return lines.map((line, i) => {
      const isBullet = /^(\-|\*|•|\d+\.)\s+/.test(line);
      if (isBullet) {
        return (
          <div key={i} className="flex gap-2.5 items-start mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-[7px] shrink-0" />
            <span className="text-sm leading-relaxed text-foreground/80">
              {line.replace(/^(\-|\*|•|\d+\.)\s+/, "")}
            </span>
          </div>
        );
      }
      return (
        <p
          key={i}
          className="text-sm leading-relaxed text-foreground/80 mb-1.5"
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="rounded-xl border border-primary/20 overflow-hidden shadow-sm">
      {/* Preview header */}
      <div className="bg-primary/8 border-b border-primary/15 px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          {t.verseExplanations.livePreview}
        </span>
        {bookName && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-primary">
              {bookName} {chapter}:{verseNumber}
            </span>
            {bibleVersion && (
              <Badge variant="outline" className="text-xs font-mono">
                {bibleVersion}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 bg-card">
        {/* Explanation section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {t.verseExplanations.previewExplanation}
            </span>
          </div>
          <div className="pl-3">{renderContent(explanation)}</div>
        </div>

        {/* Learn more section */}
        {learnMore && (
          <div>
            <button
              onClick={() => setShowLearnMore((p) => !p)}
              className="flex items-center gap-2 group mb-2"
            >
              <div className="w-1 h-4 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider group-hover:text-amber-700">
                {t.verseExplanations.previewLearnMore}
              </span>
              {showLearnMore ? (
                <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>
            {showLearnMore && (
              <div className="pl-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3">
                {renderContent(learnMore)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const AddVerseExplanation = () => {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  type Params = {
    bookName?: string;
    chapter?: string;
    verseNumber?: string;
  };

  const params = useParams<Params>();

  const qBookName = params.bookName ? decodeURIComponent(params.bookName) : "";
  const qChapter = params.chapter ? Number(params.chapter) : 1;
  const qVerseNumber = params.verseNumber ? Number(params.verseNumber) : 1;

  console.log("Route params:", { qBookName, qChapter, qVerseNumber });

  const isEditMode =
    !!params.bookName && !!params.chapter && !!params.verseNumber;

  const NONE_VALUE = "__NONE__";

  // ✅ SAFE state (never undefined)
  const [bookName, setBookName] = useState<string>(qBookName);
  const [chapter, setChapter] = useState<number>(
    Number.isFinite(qChapter) ? qChapter : 1,
  );
  const [verseNumber, setVerseNumber] = useState<number>(
    Number.isFinite(qVerseNumber) ? qVerseNumber : 1,
  );

  const [bibleVersion, setBibleVersion] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [learnMore, setLearnMore] = useState<string>("");

  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingFound, setExistingFound] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verseText, setVerseText] = useState<string | null>(null);

  const [prompts, setPrompts] = useState<{ id: number; prompt: string; category: string }[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);

  const fetchPrompts = async (bn: string, ch: number, vn?: number) => {
    if (!bn || !ch) return;
    setPromptsLoading(true);
    try {
      const res = await sendPostRequest("journal", "prompts/get-all", {
        bookName: bn,
        chapter: ch,
        isActive: true,
      });
      if (res.returnCode === 200 && res.returnData) {
        const filtered = vn 
          ? res.returnData.filter((p: any) => !p.verseNumber || p.verseNumber === vn)
          : res.returnData;
        setPrompts(filtered);
      }
    } catch (e) {
      console.error("Error fetching prompts:", e);
    } finally {
      setPromptsLoading(false);
    }
  };

  // ── load existing on edit mode ─────────────
  const fetchExisting = async (bn: string, ch: number, vn: number) => {
    if (!bn || !ch || !vn) return;
    setLoadingExisting(true);
    setExistingFound(false);
    setExistingId(null);
    try {
      const res = await sendPostRequest("bible", "get-verse-explanation", {
        bookName: bn,
        chapter: ch,
        verseNumber: vn,
      });
      if (res.returnCode === 200 && res.returnData) {
        const d = res.returnData;
        setBibleVersion(d.bibleVersion ?? "");
        setExplanation(d.explanation ?? "");
        setLearnMore(d.learnMore ?? "");
        setExistingFound(true);
        setExistingId(d.id ?? null);
        if (d.promptIds) {
          try {
            const parsed = JSON.parse(d.promptIds);
            if (Array.isArray(parsed)) {
              setSelectedPromptIds(parsed.map(Number));
            }
          } catch (e) {
            console.error("Error parsing promptIds:", e);
          }
        }
      }
    } catch {
      // silently ignore — treat as new
    } finally {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchExisting(qBookName, qChapter, qVerseNumber);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  useEffect(() => {
    setVerseText(getVerseText(bookName, Number(chapter), Number(verseNumber)));
  }, [bookName, chapter, verseNumber]);

  useEffect(() => {
    if (bookName && chapter) {
      fetchPrompts(bookName, chapter, verseNumber);
    }
  }, [bookName, chapter, verseNumber]);

  // Also fetch when user finishes filling in verse reference fields (add mode)
  const handleVerseBlur = () => {
    if (!isEditMode && bookName && chapter && verseNumber) {
      fetchExisting(bookName, chapter, verseNumber);
    }
  };

  // ── validation ─────────────────────────────
  const isValid =
    (bookName ?? "").trim() !== "" &&
    Number(chapter) >= 1 &&
    Number(verseNumber) >= 1 &&
    (explanation ?? "").trim().length >= 20;

  // ── submit ─────────────────────────────────
  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        bookName,
        chapter,
        verseNumber,
        bibleVersion,
        explanation,
        learnMore,
        promptIds: selectedPromptIds,
      };
      
      // Include id when updating existing record
      if (existingFound && existingId) {
        (payload as any).id = existingId;
      }
      
      const res = await sendPostRequest("bible", "add-verse-explanation", payload);
      if (res.returnCode === 200) {
        setSaved(true);
        toast({
          title: existingFound
            ? t.verseExplanations.toastExplanationUpdated
            : t.verseExplanations.toastExplanationCreated,
          description: t.verseExplanations.toastSavedDesc.replace('{bookName}', bookName).replace('{chapter}', String(chapter)).replace('{verseNumber}', String(verseNumber)),
        });
        setTimeout(() => navigate(routes.verseExplanations.path), 1500);
      } else {
        toast({
          title: t.verseExplanations.toastSaveFailed,
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: t.verseExplanations.toastNetworkError,
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className="mx-auto space-y-6">
        {/* ── Page header ── */}
        <div className="fade-up flex items-center gap-4">
          <Link
            to={routes.verseExplanations.path}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            {t.common.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
              <ScrollText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-heading text-gradient">
                {isEditMode
                  ? t.verseExplanations.editPageTitle.replace('{bookName}', qBookName).replace('{chapter}', String(qChapter)).replace('{verseNumber}', String(qVerseNumber))
                  : t.verseExplanations.addPageTitle}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isEditMode
                  ? t.verseExplanations.editPageSubtitle
                  : t.verseExplanations.addPageSubtitle}
              </p>
            </div>
          </div>

          {/* Existing indicator */}
          {existingFound && (
            <Badge
              variant="outline"
              className="ml-auto gap-1.5 border-amber-300 bg-amber-50 text-amber-700"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {t.verseExplanations.existingBadge}
            </Badge>
          )}
        </div>

        {/* ══════════════════════════════════════
            Two-column layout
        ══════════════════════════════════════ */}
        <div className="fade-up stagger-1 grid lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* ── LEFT: Form ── */}
          <div className="space-y-5">
            {/* Section 1: Verse Reference */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {t.verseExplanations.refTitle}
                </CardTitle>
                <CardDescription>
                  {t.verseExplanations.refDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-5 space-y-4">
                {/* Book */}
                <div className="space-y-1.5">
                  <Label>
                    {t.verseExplanations.book}
                  </Label>
                  <Select
                    value={bookName || ""}
                    onValueChange={(v) => {
                      setBookName(v);
                      setExistingFound(false);
                    }}
                    disabled={isEditMode}
                  >
                    <SelectTrigger
                      className={cn(
                        isEditMode && "bg-muted/40 text-muted-foreground",
                      )}
                    >
                      <SelectValue placeholder={t.verseExplanations.selectBookPlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {BIBLE_BOOKS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Chapter + Verse */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>
                      {t.verseExplanations.chapter}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={150}
                      value={chapter}
                      readOnly={isEditMode}
                      className={cn(
                        isEditMode && "bg-muted/40 text-muted-foreground",
                      )}
                      onChange={(e) => {
                        setChapter(Math.max(1, parseInt(e.target.value) || 1));
                        setExistingFound(false);
                      }}
                      onBlur={handleVerseBlur}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      {t.verseExplanations.verse}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={verseNumber}
                      readOnly={isEditMode}
                      className={cn(
                        isEditMode && "bg-muted/40 text-muted-foreground",
                      )}
                      onChange={(e) => {
                        setVerseNumber(
                          Math.max(1, parseInt(e.target.value) || 1),
                        );
                        setExistingFound(false);
                      }}
                      onBlur={handleVerseBlur}
                    />
                  </div>
                </div>

                {verseText && (
                  <div className="space-y-2">
                    <Label>
                      {t.verseExplanations.verseText}{" "}
                      <span className="text-xs text-muted-foreground font-normal">
                        {t.verseExplanations.verseTextHint}
                      </span>
                    </Label>
                    <div className="relative">
                      <Textarea
                        value={verseText}
                        readOnly
                        className="min-h-[110px] resize-none bg-muted/40 font-serif leading-relaxed"
                        placeholder={t.verseExplanations.verseTextPlaceholder}
                      />
                      {verseText && (
                        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                          {bookName} {chapter}:{verseNumber}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bible Version */}
                <div className="space-y-1.5">
                  <Label>
                    {t.verseExplanations.bibleVersion}{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      {t.verseExplanations.optionalLabel}
                    </span>
                  </Label>
                  <Select
                    value={bibleVersion ? bibleVersion : NONE_VALUE}
                    onValueChange={(v) =>
                      setBibleVersion(v === NONE_VALUE ? "" : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.verseExplanations.bibleVersionPlaceholder} />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>{t.verseExplanations.noneOption}</SelectItem>

                      {BIBLE_VERSIONS.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Loading indicator */}
                {loadingExisting && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {t.verseExplanations.checkingExisting}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Explanation */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ScrollText className="w-4 h-4 text-primary" />
                  {t.verseExplanations.explanationTitle}
                </CardTitle>
                <CardDescription>
                  {t.verseExplanations.explanationDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    {t.verseExplanations.explanationText}
                  </Label>
                  <CharCount value={explanation} max={5000} />
                </div>
                <Textarea
                  rows={8}
                  placeholder={t.verseExplanations.explanationPlaceholder}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  maxLength={5000}
                  className="resize-y font-mono text-sm leading-relaxed"
                />
                {(explanation ?? "").trim().length > 0 &&
                  (explanation ?? "").trim().length < 20 && (
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {t.verseExplanations.minCharsError}
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* Section 3: Learn More */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-amber-500/5 to-amber-400/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {t.verseExplanations.learnMoreTitle}
                      <Badge
                        variant="outline"
                        className="text-xs font-normal border-amber-200 text-amber-600"
                      >
                        {t.verseExplanations.learnMoreBadge}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {t.verseExplanations.learnMoreDesc}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t.verseExplanations.learnMoreLabel}</Label>
                  <CharCount value={learnMore} max={8000} />
                </div>
                <Textarea
                  rows={6}
                  placeholder={t.verseExplanations.learnMorePlaceholder}
                  value={learnMore}
                  onChange={(e) => setLearnMore(e.target.value)}
                  maxLength={8000}
                  className="resize-y font-mono text-sm leading-relaxed"
                />
              </CardContent>
            </Card>

            {/* Journal Prompts for this verse */}
            {(promptsLoading || prompts.length > 0) && (
              <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    {t.verseExplanations.relatedPrompts}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {t.verseExplanations.promptsDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {promptsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.verseExplanations.loadingPrompts}
                    </div>
                  ) : prompts.length > 0 ? (
                    <>
                      {prompts.map((prompt) => {
                        const isSelected = selectedPromptIds.includes(prompt.id);
                        return (
                          <div
                            key={prompt.id}
                            onClick={() => {
                              setSelectedPromptIds((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== prompt.id)
                                  : [...prev, prompt.id]
                              );
                            }}
                            className={cn(
                              "bg-white dark:bg-background rounded-lg p-3 border text-sm cursor-pointer transition-all",
                              isSelected
                                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30"
                                : "border-amber-100/50 dark:border-amber-900/30 hover:border-amber-300"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={cn(
                                  "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5",
                                  isSelected
                                    ? "bg-amber-500 border-amber-500"
                                    : "border-amber-300"
                                )}
                              >
                                {isSelected && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-foreground/80">{prompt.prompt}</span>
                            </div>
                            <div className="ml-7 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {prompt.category}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      {selectedPromptIds.length > 0 && (
                        <div className="text-xs text-muted-foreground pt-2">
                          {t.verseExplanations.promptsSelected.replace('{n}', String(selectedPromptIds.length))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t.verseExplanations.noPromptsForVerse}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Save button */}
            <div className="flex items-center justify-between pt-2 pb-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5" />
                {existingFound
                  ? t.verseExplanations.savingOverwrite
                  : t.verseExplanations.savingCreate}
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || !isValid || saved}
                size="lg"
                className={cn(
                  "gap-2 min-w-36",
                  saved
                    ? "bg-emerald-600 hover:bg-emerald-600"
                    : "bg-gradient-to-r from-primary to-primary/80 shadow-md",
                )}
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> {t.verseExplanations.savedLabel}
                  </>
                ) : saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {t.verseExplanations.savingLabel}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {existingFound ? t.verseExplanations.updateExplanation : t.verseExplanations.saveExplanation}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ── RIGHT: Live Preview ── */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t.verseExplanations.appPreview}
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <LivePreview
              bookName={bookName}
              chapter={chapter}
              verseNumber={verseNumber}
              bibleVersion={bibleVersion}
              explanation={explanation}
              learnMore={learnMore}
              t={t}
            />

            {/* Formatting tips */}
            <Card className="border-border/30 bg-muted/20">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t.verseExplanations.formattingTips}
                </p>
                <div className="space-y-1.5 text-xs text-muted-foreground" dir="ltr">
                  <div className="flex gap-2">
                    <code className="bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {t.verseExplanations.ftBulletCode}
                    </code>
                    <span>{t.verseExplanations.ftBulletDesc}</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {t.verseExplanations.ftNumberedCode}
                    </code>
                    <span>{t.verseExplanations.ftNumberedDesc}</span>
                  </div>
                  <div className="flex gap-2">
                    <code className="bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {t.verseExplanations.ftEmptyCode}
                    </code>
                    <span>{t.verseExplanations.ftEmptyDesc}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation status */}
            <Card
              className={cn(
                "border transition-colors",
                isValid
                  ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-border/40 bg-muted/20",
              )}
            >
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.verseExplanations.checklist}
                </p>
                {[
                  {
                    label: t.verseExplanations.clBookSelected,
                    ok: (bookName ?? "").trim() !== "",
                  },
                  ,
                  { label: t.verseExplanations.clValidChapter, ok: chapter >= 1 },
                  { label: t.verseExplanations.clValidVerse, ok: verseNumber >= 1 },
                  {
                    label: t.verseExplanations.clExplanationWords,
                    ok: (explanation ?? "").trim().split(/\s+/).length >= 20,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                        item.ok ? "bg-emerald-500" : "bg-muted-foreground/20",
                      )}
                    >
                      {item.ok && (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={
                        item.ok ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVerseExplanation;

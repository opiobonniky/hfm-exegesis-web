import { useEffect, useMemo, useState } from "react";
import {
  Sun,
  Calendar,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
  CalendarRange,
  Pencil,
  Trash2,
  BookOpen,
  Lightbulb,
  Save,
  AlertTriangle,
  PenLine,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { sendPostRequest } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getVerseText,
  getBooksByTestament,
  getChaptersForBook,
  getVersesCountForChapter,
  setActiveVersion,
} from "@/utilities/bibleUtils";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";
import { Combobox } from "@/components/ui/combobox";
import { routes } from "@/components/Routes/routes";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { format } from "date-fns";
import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DailyVerseItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion?: string;
  verseText?: string | null;
  displayDate: string | Record<string, never>;
  displayTime: string | Record<string, never>;
  reflection?: string | null;
  explanation?: string | null;
  learnMore?: string | null;
  createdBy: string;
  createdOn: string | Record<string, never>;
  updatedBy: string | null;
  updatedOn: string | Record<string, never>;
  isPublished: boolean;
}

interface DailyVerseResponse {
  content: DailyVerseItem[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const SMART_PAGE_SIZE = 6;
const SMART_FUTURE_DAYS = 2;
const FILTERED_PAGE_SIZE = 12;

const PRESETS = (t?: any) => [
  { label: t?.dailyVerse?.presetLast7 || 'Last 7 days', value: 'last_7' },
  { label: t?.dailyVerse?.presetLast30 || 'Last 30 days', value: 'last_30' },
  { label: t?.dailyVerse?.presetThisWeek || 'This week', value: 'this_week' },
  { label: t?.dailyVerse?.presetThisMonth || 'This month', value: 'this_month' },
  { label: t?.dailyVerse?.presetLastMonth || 'Last month', value: 'last_month' },
];

const TESTAMENTS = (t?: any) => [
  { value: 'Old', label: t?.dailyVerse?.oldTestament || 'Old Testament' },
  { value: 'New', label: t?.dailyVerse?.newTestament || 'New Testament' },
];

const OLD_TESTAMENT_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
];

// ─── Date helpers ───────────────────────────────────────────────────────────────

const safeDate = (value: unknown): Date => {
  if (!value || typeof value === "object") return new Date();
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? new Date() : d;
};

const toYMD = (d: Date): string =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");

const getLocalDateString = (utcDateString: unknown): string => toYMD(safeDate(utcDateString));

const isToday = (utcDateString: unknown): boolean =>
  getLocalDateString(utcDateString) === toYMD(new Date());

const isFuture = (utcDateString: unknown): boolean =>
  getLocalDateString(utcDateString) > toYMD(new Date());

const formatDisplayDate = (utcDateString: unknown): string =>
  safeDate(utcDateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const formatShortDate = (utcDateString: unknown): string =>
  safeDate(utcDateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const getConflictMessage = (conflict: any, t?: any): string => {
  if (!conflict) return '';
  const ref = conflict.existing?.bookName + ' ' + conflict.existing?.chapter + ':' + conflict.existing?.verseNumber;
  const date = conflict.existing?.displayDate || '';
  const dv = t?.dailyVerse;
  if (conflict.type === 'date') {
    const msg = dv?.verseConflictForDate || 'A verse already exists for this date ({ref}).';
    return msg.replace('{ref}', ref);
  }
  const msg = dv?.verseConflictForVerse || 'This verse ({ref}) already exists for {date}.';
  return msg.replace('{ref}', ref).replace('{date}', date);
};

const addDays = (d: Date, days: number): Date => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

// ─── Preset ranges ──────────────────────────────────────────────────────────────

const getPresetRange = (preset: string): { from: string; to: string } => {
  const now = new Date();
  switch (preset) {
    case "this_week": {
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      return { from: toYMD(mon), to: toYMD(addDays(mon, 6)) };
    }
    case "this_month":
      return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), to: toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0)) };
    case "last_month":
      return { from: toYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: toYMD(new Date(now.getFullYear(), now.getMonth(), 0)) };
    case "last_7":
      return { from: toYMD(addDays(now, -6)), to: toYMD(now) };
    case "last_30":
      return { from: toYMD(addDays(now, -29)), to: toYMD(now) };
    default:
      return { from: "", to: "" };
  }
};

// ─── Edit state ─────────────────────────────────────────────────────────────────

interface EditState {
  id: number;
  testament: string;
  book: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  verseText: string;
  explanation: string;
  learnMore: string;
  selectedDate: Date;
  selectedTime: string;
}

const buildEditState = (verse: DailyVerseItem): EditState => {
  const date = safeDate(verse.displayDate);
  if (verse.bibleVersion) setActiveVersion(verse.bibleVersion);
  return {
    id: verse.id,
    testament: OLD_TESTAMENT_BOOKS.includes(verse.bookName) ? "Old" : "New",
    book: verse.bookName,
    chapter: String(verse.chapter),
    verseNumber: String(verse.verseNumber),
    bibleVersion: verse.bibleVersion || "BSB",
    verseText: verse.verseText || getVerseText(verse.bookName, verse.chapter, verse.verseNumber) || "",
    explanation: verse.explanation || "",
    learnMore: verse.learnMore || "",
    selectedDate: date,
    selectedTime: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
};

// ─── Main component ─────────────────────────────────────────────────────────────

const DailyVerse = () => {
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  const [dailyVerses, setDailyVerses] = useState<DailyVerseItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Filter
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [filterError, setFilterError] = useState("");

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editVerseText, setEditVerseText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyVerseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedVerse = dailyVerses[selectedIndex];
  const isFiltered = Boolean(fromDate || toDate);

  // ── Request payload ────────────────────────────────────────────────────────
  const requestPayload = useMemo(() => {
    if (isFiltered) {
      const payload: Record<string, unknown> = { page, size: FILTERED_PAGE_SIZE };
      if (fromDate) payload.startDate = fromDate;
      if (toDate) payload.endDate = toDate;
      return payload;
    }
    return { page, size: SMART_PAGE_SIZE, smartDefault: true, futureDays: SMART_FUTURE_DAYS };
  }, [page, isFiltered, fromDate, toDate]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDailyVerses = async () => {
    if (isAdmin) await getAllDailyVerses();
    else await getTodayVerse();
  };

  const getTodayVerse = async () => {
    try {
      setIsLoading(true);
      const response = await sendPostRequest("bible", "get-daily-verse", {});
      const { returnData, returnCode, returnMessage } = response;
      if (returnCode === 200 && returnData) {
        setDailyVerses([returnData]);
        setSelectedIndex(0);
        setTotalPages(1);
        setHasNext(false);
        setHasPrevious(false);
      } else if (returnCode === 404) {
        setDailyVerses([]);
      } else {
        toast({ title: t.common?.error || 'Error', description: returnMessage || (t.dailyVerse?.failedToFetch || "Failed to fetch today's verse."), variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || 'Error', description: t.dailyVerse?.failedToFetch || "Unable to load today's verse.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getAllDailyVerses = async () => {
    try {
      setIsLoading(true);
      const response = await sendPostRequest<DailyVerseResponse>("admin", "get-all-daily-verses", requestPayload);
      const { returnData, returnCode, returnMessage } = response;
      if (returnCode === 200 && returnData) {
        const content = returnData.content || [];
        setDailyVerses(content);
        setTotalPages(returnData.totalPages || 0);
        setHasNext(returnData.hasNext || false);
        setHasPrevious(returnData.hasPrevious || false);
        const todayIdx = content.findIndex((v) => isToday(v.displayDate));
        setSelectedIndex(todayIdx !== -1 ? todayIdx : 0);
      } else {
        toast({ title: t.common?.error || 'Error', description: returnMessage || (t.dailyVerse?.failedToFetchVerses || "Failed to fetch verses."), variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || 'Error', description: t.dailyVerse?.unableToLoadVerses || "Unable to load daily verses.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyVerses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, requestPayload]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const validateAndApply = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setFilterError(t.dailyVerse?.dateRangeError || "'From' date must be before or equal to 'To' date.");
      return;
    }
    setFilterError("");
    setActivePreset(null);
    setPage(0);
  };

  const applyPreset = (preset: string) => {
    const { from, to } = getPresetRange(preset);
    setFromDate(from);
    setToDate(to);
    setActivePreset(preset);
    setFilterError("");
    setPage(0);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    setActivePreset(null);
    setFilterError("");
    setPage(0);
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNextVerse = () => setSelectedIndex((p) => (p > 0 ? p - 1 : p));
  const handlePreviousVerse = () => setSelectedIndex((p) => (p < dailyVerses.length - 1 ? p + 1 : p));

  const [conflictDialog, setConflictDialog] = useState<{ open: boolean; conflict: any; payload: any }>({ open: false, conflict: null, payload: null });

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (verse: DailyVerseItem) => {
    setEditState(buildEditState(verse));
    if (verse.bibleVersion) setActiveVersion(verse.bibleVersion);
    setEditVerseText(getVerseText(verse.bookName, verse.chapter, verse.verseNumber) || "");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    if (!editState.book || !editState.chapter || !editState.verseNumber || !editState.explanation.trim()) {
      toast({ title: t.dailyVerse?.missingFields || 'Missing fields', description: t.dailyVerse?.fillAllRequired || 'Please fill all required fields.', variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const res = await sendPostRequest("admin", "add-daily-verse", {
        id: editState.id, bookName: editState.book, chapter: Number(editState.chapter),
        verseNumber: Number(editState.verseNumber), bibleVersion: editState.bibleVersion,
        verseText: editState.verseText || null, explanation: editState.explanation,
        learnMore: editState.learnMore || null, published: true,
        displayDate: editState.selectedDate.toISOString(), displayTime: editState.selectedDate.toISOString(),
      });
      if (res.returnCode === 200) {
        toast({ title: t.dailyVerse?.dailyVerse || 'Updated', description: t.dailyVerse?.verseSaved || 'Daily verse updated successfully.' });
        setEditOpen(false);
        getAllDailyVerses();
      } else if (res.returnCode === 409) {
        setConflictDialog({ open: true, conflict: res.returnData?.conflicts?.[0], payload: {
          id: editState.id, bookName: editState.book, chapter: Number(editState.chapter),
          verseNumber: Number(editState.verseNumber), bibleVersion: editState.bibleVersion,
          verseText: editState.verseText || null, explanation: editState.explanation,
          learnMore: editState.learnMore || null, published: true,
          displayDate: editState.selectedDate.toISOString(), displayTime: editState.selectedDate.toISOString(),
        }});
      } else {
        toast({ title: t.common?.error || 'Error', description: res.returnMessage || (t.dailyVerse?.fillAllRequired || 'Failed to update.'), variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || 'Error', description: t.common?.error || 'An error occurred.', variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConflictUpdate = async () => {
    const c = conflictDialog.conflict;
    if (!c) return;
    setConflictDialog({ open: false, conflict: null, payload: null });
    try {
      const res = await sendPostRequest("admin", "add-daily-verse", conflictDialog.payload);
      if (res.returnCode === 200) {
        toast({ title: t.dailyVerse?.dailyVerse || 'Updated', description: t.dailyVerse?.verseSaved || 'Verse updated.' });
        setEditOpen(false);
        getAllDailyVerses();
      } else {
        toast({ title: t.common?.error || 'Error', description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || 'Error', description: t.common?.error || 'An error occurred.', variant: "destructive" });
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const openDelete = (verse: DailyVerseItem) => {
    setDeleteTarget(verse);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await sendPostRequest("admin", "delete-daily-verse", { id: deleteTarget.id });
      if (res.returnCode === 200) {
        toast({ title: t.common?.delete || 'Deleted', description: t.dailyVerse?.verseDeleted || 'Daily verse deleted successfully.' });
        setDeleteOpen(false);
        setDeleteTarget(null);
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        getAllDailyVerses();
      } else {
        toast({ title: t.common?.error || 'Error', description: res.returnMessage || (t.dailyVerse?.deleteVerse || 'Failed to delete.'), variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || 'Error', description: t.common?.error || 'An error occurred.', variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t.dailyVerse?.loading || 'Loading daily verses...'}</p>
        </div>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!dailyVerses.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <PageHeader onAdd={() => navigate(routes.addDailyVerse.path)} />
        <FilterCard fromDate={fromDate} toDate={toDate} activePreset={activePreset} filterError={filterError}
          isFiltered={isFiltered} onFromChange={setFromDate} onToChange={setToDate}
          onApply={validateAndApply} onClear={clearFilter} onPreset={applyPreset} />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Sun className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">{t.dailyVerse?.noVersesYet || 'No verses found'}</h3>
          <p className="text-sm text-muted-foreground mb-5">
            {isFiltered ? (t.dailyVerse?.noVersesMatch || 'No verses match the selected date range.') : (t.dailyVerse?.noVersesAdded || 'No daily verses have been added yet.')}
          </p>
          <div className="flex gap-2">
            {isFiltered && <Button variant="outline" size="sm" onClick={clearFilter}>{t.dailyVerse?.clearFilter || 'Clear Filter'}</Button>}
            <Button variant="outline" size="sm" onClick={getAllDailyVerses}>{t.dailyVerse?.refresh || 'Refresh'}</Button>
          </div>
        </div>
      </div>
    );
  }

  const futureCount = !isFiltered ? dailyVerses.filter((v) => isFuture(v.displayDate)).length : 0;

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader onAdd={() => navigate(routes.addDailyVerse.path)} />

      <FilterCard fromDate={fromDate} toDate={toDate} activePreset={activePreset} filterError={filterError}
        isFiltered={isFiltered} onFromChange={setFromDate} onToChange={setToDate}
        onApply={validateAndApply} onClear={clearFilter} onPreset={applyPreset} />

      {/* Status row */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isFiltered ? (
          <>
            <CalendarRange className="w-4 h-4 shrink-0" />
            <span>
              {t.dailyVerse?.verse_other || 'verses'}
              {fromDate && <> {t.common?.from || 'from'} <strong className="text-foreground">{formatDisplayDate(fromDate)}</strong></>}
              {toDate && <> {t.common?.to || 'to'} <strong className="text-foreground">{formatDisplayDate(toDate)}</strong></>}
            </span>
            <button onClick={clearFilter} className="ml-1 rounded-full hover:text-destructive transition-colors" aria-label={t.dailyVerse?.clearFilter || 'Clear filter'}>
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <span>
            {t.dailyVerse?.showingToday || 'Showing today'}
            {futureCount > 0 && <> + <strong className="text-foreground">{futureCount}</strong> {futureCount === 1 ? (t.dailyVerse?.verse_one || 'upcoming verse') : (t.dailyVerse?.verse_other || 'upcoming verses')}</>}
            {' '} + {t.dailyVerse?.recentHistory || 'recent history'}
          </span>
        )}
      </div>

        {/* Simplified Featured Verse */}
        {selectedVerse && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            {/* Date and badges */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDisplayDate(selectedVerse.displayDate)}
              </Badge>
              {isToday(selectedVerse.displayDate) && <Badge className="text-xs">{t.dailyVerse?.todayBadge || 'Today'}</Badge>}
              {isFuture(selectedVerse.displayDate) && <Badge variant="outline" className="text-xs border-primary/30 text-primary">{t.dailyVerse?.upcoming || 'Upcoming'}</Badge>}
            </div>
            {/* Verse reference */}
            <h2 className="text-xl font-semibold mb-2">{selectedVerse.bookName} {selectedVerse.chapter}:{selectedVerse.verseNumber}</h2>
            {/* Verse text */}
            <blockquote className="text-2xl lg:text-3xl font-serif leading-relaxed mb-4 text-foreground/90" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              &ldquo;{selectedVerse.verseText || getVerseText(selectedVerse.bookName, selectedVerse.chapter, selectedVerse.verseNumber)}&rdquo;
            </blockquote>
            {/* Explanation */}
            <div className="bg-muted/50 rounded-xl p-5 mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {isToday(selectedVerse.displayDate) ? (t.dailyVerse?.todaysExplanation || "Today's Explanation") : isFuture(selectedVerse.displayDate) ? (t.dailyVerse?.upcomingExplanation || "Upcoming Explanation") : (t.dailyVerse?.explanation || "Explanation")}
              </h3>
              <p className="text-base leading-relaxed text-foreground/85 whitespace-pre-line">
                {selectedVerse.explanation || selectedVerse.reflection || (t.dailyVerse?.noExplanation || "No explanation available.")}
              </p>
              {selectedVerse.learnMore && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.dailyVerse?.learnMore || 'Learn More'}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{selectedVerse.learnMore}</p>
                </div>
              )}
            </div>
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 gap-2 h-11" aria-label="Open verse in Bible" onClick={() => {
                navigate(`/bible-reader?book=${selectedVerse.bookName}&chapter=${selectedVerse.chapter}&verse=${selectedVerse.verseNumber}`);
              }}>
                <BookOpen className="w-4 h-4" />
                {t.dailyVerse?.openInBible || 'Open in Bible'}
              </Button>
              <Button variant="outline" className="flex-1 gap-2 h-11" aria-label="Write this verse to journal" onClick={() => {
                const journalUrl = `/journal/new?book=${selectedVerse.bookName}&chapter=${selectedVerse.chapter}&verse=${selectedVerse.verseNumber}`;
                window.open(journalUrl, "_blank");
              }}>
                <PenLine className="w-4 h-4" />
                {t.dailyVerse?.writeInJournal || 'Write in Journal'}
              </Button>
            </div>
          </section>
        )}

      {/* ── Verse History ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          {isFiltered ? (t.dailyVerse?.filteredVerses || 'Filtered Verses') : (t.dailyVerse?.verseWindow || 'Verse Window')}
        </h2>

        {!isFiltered && futureCount > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.dailyVerse?.upcoming || 'Upcoming'}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {dailyVerses.map((verse, index) => {
            const prevVerse = dailyVerses[index - 1];
            const insertDivider = !isFiltered && index > 0 && isFuture(prevVerse.displayDate) && !isFuture(verse.displayDate);

            return (
              <React.Fragment key={verse.id}>
                {insertDivider && (
                  <div className="md:col-span-2 lg:col-span-3 flex items-center gap-3 py-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.dailyVerse?.todayAndPast || 'Today & Past'}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                <div
                  className={cn(
                    "border border-border rounded-xl p-4 cursor-pointer transition-all",
                    selectedIndex === index ? "ring-2 ring-primary bg-primary/[0.03]" : "hover:bg-muted/50",
                    isFuture(verse.displayDate) && "border-primary/20 bg-primary/[0.02]",
                  )}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={isToday(verse.displayDate) ? "default" : "secondary"} className={cn("text-[10px]", isFuture(verse.displayDate) && "border-primary/40 text-primary bg-primary/10")}>
                        {formatShortDate(verse.displayDate)}
                      </Badge>
                      {isFuture(verse.displayDate) && <span className="text-[10px] font-semibold text-primary">{t.dailyVerse?.upcoming || 'Upcoming'}</span>}
                    </div>
                    <div className={cn("flex items-center gap-0.5 transition-opacity", selectedIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                      {isAdmin && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); openEdit(verse); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={t.dailyVerse?.editVerse || 'Edit verse'}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); openDelete(verse); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title={t.dailyVerse?.deleteVerse || 'Delete verse'}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-serif leading-relaxed line-clamp-2 mb-1.5 text-foreground/85" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                    &ldquo;{verse.verseText || (() => { if (verse.bibleVersion) setActiveVersion(verse.bibleVersion); return getVerseText(verse.bookName, verse.chapter, verse.verseNumber); })()}&rdquo;
                  </p>
                  <p className="text-xs font-medium text-primary">
                    {verse.bookName} {verse.chapter}:{verse.verseNumber}
                    {verse.bibleVersion && <span className="text-muted-foreground ml-1">({BIBLE_VERSIONS.find(v => v.id === verse.bibleVersion)?.abbreviation || verse.bibleVersion})</span>}
                  </p>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={() => setPage((p) => Math.max(p - 1, 0))}>
              {t.common?.previous || 'Previous Page'}
            </Button>
            <span className="text-xs text-muted-foreground">
              {(t.dailyVerse?.verseOf || 'Page {n} of {total}').replace('{n}', String(page + 1)).replace('{total}', String(Math.max(totalPages, 1)))}
            </span>
            <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
              {t.common?.next || 'Next Page'}
            </Button>
          </div>
        )}
      </div>

      {/* ═══ EDIT DIALOG ══════════════════════════════════════════════════════ */}
      {editState && (
        <EditVerseDialog open={editOpen} onOpenChange={setEditOpen} state={editState}
          verseText={editVerseText} isSaving={isSaving} onChange={setEditState}
          onVerseTextChange={setEditVerseText} onSave={handleSaveEdit} />
      )}

      {/* ═══ DELETE DIALOG ════════════════════════════════════════════════════ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t.dailyVerse?.deleteVerseTitle || 'Delete Daily Verse'}
            </DialogTitle>
            <DialogDescription>
              {t.dailyVerse?.deleteVerseDesc || 'This will permanently remove the verse. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1.5">
              <p className="font-semibold text-sm">{deleteTarget.bookName} {deleteTarget.chapter}:{deleteTarget.verseNumber}</p>
              <p className="text-xs text-muted-foreground">{formatDisplayDate(deleteTarget.displayDate)}</p>
              <p className="text-sm text-muted-foreground italic line-clamp-2 pt-1">
                &ldquo;{getVerseText(deleteTarget.bookName, deleteTarget.chapter, deleteTarget.verseNumber)}&rdquo;
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>{t.common?.cancel || 'Cancel'}</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting} className="gap-2">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {t.dailyVerse?.deleteVerse || 'Delete Verse'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ CONFLICT DIALOG ════════════════════════════════════════════════════ */}
      <Dialog open={conflictDialog.open} onOpenChange={(open) => !open && setConflictDialog({ open: false, conflict: null, payload: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              {t.dailyVerse?.verseAlreadyExists || 'Verse Already Exists'}
            </DialogTitle>
            <DialogDescription>
              {getConflictMessage(conflictDialog.conflict, t)} {t.dailyVerse?.updateExisting || 'Update the existing entry instead?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConflictDialog({ open: false, conflict: null, payload: null })}>{t.common?.cancel || 'Cancel'}</Button>
            <Button variant="outline" onClick={() => { setConflictDialog({ open: false, conflict: null, payload: null }); }}>
              <BookOpen className="w-4 h-4 mr-2" />{t.dailyVerse?.viewExisting || 'View Existing'}
            </Button>
            <Button onClick={handleConflictUpdate}><Save className="w-4 h-4 mr-2" />{t.dailyVerse?.updateExisting || 'Update Existing'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

const PageHeader = ({ onAdd }: { onAdd: () => void }) => {
  const { userInfo } = useAuth();
  const { t } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Sun className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t.dailyVerse?.dailyVerse || 'Daily Verse'}</h1>
          <p className="text-sm text-muted-foreground">{t.dailyVerse?.pageSubtitle || "Start each day with God's Word"}</p>
        </div>
      </div>
      {isAdmin && (
        <Button onClick={onAdd} size="sm" className="gap-2 w-fit">
          <Plus className="w-4 h-4" />
          {t.dailyVerse?.addVerse || 'Add Daily Verse'}
        </Button>
      )}
    </div>
  );
};

interface FilterCardProps {
  fromDate: string; toDate: string; activePreset: string | null; filterError: string;
  isFiltered: boolean; onFromChange: (v: string) => void; onToChange: (v: string) => void;
  onApply: () => void; onClear: () => void; onPreset: (p: string) => void;
}

const FilterCard = ({ fromDate, toDate, activePreset, filterError, isFiltered, onFromChange, onToChange, onApply, onClear, onPreset }: FilterCardProps) => {
  const { t } = useLanguage();
  return (
    <div className="border border-border rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.dailyVerse?.quickRange || 'Quick Range'}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS(t).map((p) => (
            <button key={p.value} onClick={() => onPreset(p.value)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-colors", activePreset === p.value ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-muted")}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border" />
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">{t.common?.from || 'From'}</Label>
          <Input id="from-date" type="date" value={fromDate} max={toDate || undefined} onChange={(e) => onFromChange(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="flex-1 space-y-1">
          <Label className="text-xs">{t.common?.to || 'To'}</Label>
          <Input id="to-date" type="date" value={toDate} min={fromDate || undefined} onChange={(e) => onToChange(e.target.value)} className="h-9 text-sm" />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={onApply} className="gap-1.5"><Search className="w-3.5 h-3.5" />{t.dailyVerse?.apply || 'Apply'}</Button>
          {isFiltered && <Button variant="outline" size="sm" onClick={onClear} className="gap-1"><X className="w-3.5 h-3.5" />{t.dailyVerse?.clear || 'Clear'}</Button>}
        </div>
      </div>
      {filterError && <p className="text-sm text-destructive">{filterError}</p>}
    </div>
  );
};

// ─── Edit dialog ─────────────────────────────────────────────────────────────────

interface EditDialogProps {
  open: boolean; onOpenChange: (v: boolean) => void; state: EditState;
  verseText: string; isSaving: boolean; onChange: (s: EditState) => void;
  onVerseTextChange: (t: string) => void; onSave: () => void;
}

const EditVerseDialog = ({ open, onOpenChange, state, verseText, isSaving, onChange, onVerseTextChange, onSave }: EditDialogProps) => {
  const { t } = useLanguage();
  const [localState, setLocalState] = useState<EditState>(state);

  useEffect(() => { setLocalState(state); }, [state]);

  const books = useMemo(() => {
    if (!localState.testament) return [];
    return getBooksByTestament(localState.testament as "Old" | "New");
  }, [localState.testament]);

  const chapters = useMemo(() => {
    if (!localState.book) return [];
    return getChaptersForBook(localState.book);
  }, [localState.book]);

  const maxVerses = useMemo(() => {
    if (!localState.book || !localState.chapter) return 0;
    return getVersesCountForChapter(localState.book, Number(localState.chapter)) || 0;
  }, [localState.book, localState.chapter]);

  const verseTextValue = useMemo(() => {
    if (!localState.book || !localState.chapter || !localState.verseNumber) return "";
    if (localState.bibleVersion) setActiveVersion(localState.bibleVersion);
    return getVerseText(localState.book, Number(localState.chapter), Number(localState.verseNumber)) || "";
  }, [localState.book, localState.chapter, localState.verseNumber, localState.bibleVersion]);

  useEffect(() => { onVerseTextChange(verseTextValue); }, [verseTextValue]);

  const set = (key: keyof EditState, value: unknown) => {
    let newState = { ...localState, [key]: value };
    if (key === "testament") newState = { ...newState, book: "", chapter: "", verseNumber: "" };
    else if (key === "book") newState = { ...newState, chapter: "", verseNumber: "" };
    else if (key === "chapter") newState = { ...newState, verseNumber: "" };
    setLocalState(newState);
    onChange(newState);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const d = new Date(localState.selectedDate);
    d.setHours(h, m, 0, 0);
    const newState = { ...localState, selectedTime: e.target.value, selectedDate: d };
    setLocalState(newState);
    onChange(newState);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parts = e.target.value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return;
    const [y, mo, d] = parts;
    const newDate = new Date(localState.selectedDate);
    newDate.setFullYear(y, mo - 1, d);
    set("selectedDate", newDate);
  };

  const safeDateValue = localState.selectedDate instanceof Date && !isNaN(localState.selectedDate.getTime()) ? localState.selectedDate : new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t.dailyVerse?.editVerse || 'Edit Daily Verse'}
          </DialogTitle>
          <DialogDescription>
            {t.dailyVerse?.editVerseDesc || 'Update the verse reference, date, and reflection below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{t.dailyVerse?.testament || 'Testament'}</Label>
              <Combobox options={TESTAMENTS(t)} value={localState.testament} onChange={(v) => set("testament", v)} placeholder={t.dailyVerse?.testament || 'Select testament'} width="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t.dailyVerse?.book || 'Book'}</Label>
              <Combobox options={books.map((b) => ({ value: b, label: b }))} value={localState.book} onChange={(v) => set("book", v)} placeholder={t.dailyVerse?.selectBook || 'Select book'} disabled={!localState.testament} width="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t.dailyVerse?.chapter || 'Chapter'}</Label>
              <Combobox options={chapters.map((c) => ({ value: String(c), label: String(c) }))} value={localState.chapter} onChange={(v) => set("chapter", v)} placeholder={t.dailyVerse?.selectChapter || 'Select chapter'} disabled={!localState.book} width="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t.dailyVerse?.verse || 'Verse'}</Label>
              <Combobox options={maxVerses > 0 ? Array.from({ length: maxVerses }, (_, i) => i + 1).map((v) => ({ value: String(v), label: String(v) })) : []} value={localState.verseNumber} onChange={(v) => set("verseNumber", v)} placeholder={t.dailyVerse?.verse || 'Select verse'} disabled={!localState.chapter || maxVerses === 0} width="w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t.dailyVerse?.version || 'Version'}</Label>
              <Combobox options={BIBLE_VERSIONS.map(v => ({ value: v.id, label: `${v.name} (${v.abbreviation})` }))} value={localState.bibleVersion} onChange={(v) => set("bibleVersion", v)} placeholder={t.dailyVerse?.selectVersion || "Select version"} width="w-full" />
            </div>
          </div>

          {verseTextValue && (
            <div className="space-y-1.5">
              <Label className="text-xs">{t.dailyVerse?.verseText || 'Verse Text'} <span className="text-muted-foreground font-normal">({t.dailyVerse?.verseTextOverride || 'edit to override'})</span></Label>
              <div className="relative">
                <Textarea value={verseTextValue} onChange={(e) => set("verseText", e.target.value)} className="resize-none font-serif leading-relaxed min-h-[80px]" placeholder={t.dailyVerse?.verseText || 'Verse text...'} />
                <span className="absolute bottom-2.5 right-3 text-xs text-muted-foreground">{t.dailyVerse?.reference || 'Ref'}: {localState.book} {localState.chapter}:{localState.verseNumber} ({BIBLE_VERSIONS.find(v => v.id === localState.bibleVersion)?.abbreviation || localState.bibleVersion})</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{t.common?.date || 'Date'}</Label>
              <Input type="date" value={format(safeDateValue, "yyyy-MM-dd")} onChange={handleDateChange} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t.common?.time || 'Time'}</Label>
              <Input type="time" value={localState.selectedTime} onChange={handleTimeChange} />
              <p className="text-xs text-muted-foreground">{format(safeDateValue, "p")} &middot; {format(safeDateValue, "EEEE")}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-3.5 h-3.5" />
              {t.dailyVerse?.explanation || 'Explanation'} <span className="text-destructive">*</span>
            </Label>
            <Textarea value={localState.explanation} onChange={(e) => set("explanation", e.target.value)} rows={5} className="resize-none" placeholder={t.dailyVerse?.explanation || 'Explain what this verse means...'} required />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
              {t.dailyVerse?.learnMore || 'Learn More'} <span className="text-muted-foreground font-normal">{t.common?.save || '(optional)'}</span>
            </Label>
            <Textarea value={localState.learnMore} onChange={(e) => set("learnMore", e.target.value)} rows={3} className="resize-none" placeholder={t.dailyVerse?.learnMore || 'Additional resources or related verses...'} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>{t.common?.cancel || 'Cancel'}</Button>
          <Button onClick={onSave} disabled={isSaving || !verseTextValue.trim() || !localState.explanation.trim()} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t.dailyVerse?.saveChanges || 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyVerse;

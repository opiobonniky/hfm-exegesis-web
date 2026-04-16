import { useEffect, useMemo, useState } from "react";
import {
  Sun,
  Calendar,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
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
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  getVerseText,
  getBooksByTestament,
  getChaptersForBook,
  getVersesCountForChapter,
} from "@/utilities/bibleUtils";
import { Combobox } from "@/components/ui/combobox";
import { routes } from "@/components/Routes/routes";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DailyVerseItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  displayDate: string | Record<string, never>; // API may return {} when unset
  displayTime: string | Record<string, never>;
  reflection: string;
  createdBy: string; // UUID string from API
  createdOn: string | Record<string, never>;
  updatedBy: string | null;
  updatedOn: string | Record<string, never>;
  isPublished: boolean; // API uses isPublished, not published
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

const PRESETS = [
  { label: "Last 7 days", value: "last_7" },
  { label: "Last 30 days", value: "last_30" },
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
  { label: "Last month", value: "last_month" },
];

const TESTAMENTS = [
  { value: "Old", label: "Old Testament" },
  { value: "New", label: "New Testament" },
];

const OLD_TESTAMENT_BOOKS = [
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
  "Psalms",
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
];

// ─── Date helpers ───────────────────────────────────────────────────────────────

/**
 * Safely coerce any API value to a valid Date.
 * Falls back to `new Date()` when the value is missing, {}, or unparseable.
 */
const safeDate = (value: unknown): Date => {
  if (!value || typeof value === "object") return new Date();
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? new Date() : d;
};

const toYMD = (d: Date): string =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");

const getLocalDateString = (utcDateString: unknown): string =>
  toYMD(safeDate(utcDateString));

const isToday = (utcDateString: unknown): boolean =>
  getLocalDateString(utcDateString) === toYMD(new Date());

const isFuture = (utcDateString: unknown): boolean =>
  getLocalDateString(utcDateString) > toYMD(new Date());

const formatDisplayDate = (utcDateString: unknown): string =>
  safeDate(utcDateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatShortDate = (utcDateString: unknown): string =>
  safeDate(utcDateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

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
      return {
        from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    case "last_month":
      return {
        from: toYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: toYMD(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
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
  reflection: string;
  selectedDate: Date;
  selectedTime: string;
}

const buildEditState = (verse: DailyVerseItem): EditState => {
  // safeDate guards against displayDate being {} or null from the API
  const date = safeDate(verse.displayDate);
  return {
    id: verse.id,
    testament: OLD_TESTAMENT_BOOKS.includes(verse.bookName) ? "Old" : "New",
    book: verse.bookName,
    chapter: String(verse.chapter),
    verseNumber: String(verse.verseNumber),
    reflection: verse.reflection,
    selectedDate: date,
    selectedTime: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
};

// ─── Main component ─────────────────────────────────────────────────────────────

const DailyVerse = () => {
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
      const payload: Record<string, unknown> = {
        page,
        size: FILTERED_PAGE_SIZE,
      };
      if (fromDate) payload.startDate = fromDate;
      if (toDate) payload.endDate = toDate;
      return payload;
    }
    return {
      page,
      size: SMART_PAGE_SIZE,
      smartDefault: true,
      futureDays: SMART_FUTURE_DAYS,
    };
  }, [page, isFiltered, fromDate, toDate]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const getAllDailyVerses = async () => {
    try {
      setIsLoading(true);
      const response = await sendPostRequest<DailyVerseResponse>(
        "admin",
        "get-all-daily-verses",
        requestPayload,
      );
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
        toast({
          title: "Error",
          description: returnMessage || "Failed to fetch verses.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Unable to load daily verses.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllDailyVerses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestPayload]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const validateAndApply = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setFilterError("'From' date must be before or equal to 'To' date.");
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
  const handlePreviousVerse = () =>
    setSelectedIndex((p) => (p < dailyVerses.length - 1 ? p + 1 : p));

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (verse: DailyVerseItem) => {
    setEditState(buildEditState(verse));
    setEditVerseText(
      getVerseText(verse.bookName, verse.chapter, verse.verseNumber) || "",
    );
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    if (
      !editState.book ||
      !editState.chapter ||
      !editState.verseNumber ||
      !editState.reflection.trim()
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const res = await sendPostRequest("admin", "add-daily-verse", {
        id: editState.id,
        bookName: editState.book,
        chapter: Number(editState.chapter),
        verseNumber: Number(editState.verseNumber),
        reflection: editState.reflection,
        published: true,
        displayDate: editState.selectedDate.toISOString(),
        displayTime: editState.selectedDate.toISOString(),
      });
      if (res.returnCode === 200) {
        toast({
          title: "Updated",
          description: "Daily verse updated successfully.",
        });
        setEditOpen(false);
        getAllDailyVerses();
      } else {
        toast({
          title: "Error",
          description: res.returnMessage || "Failed to update.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
      const res = await sendPostRequest("admin", "delete-daily-verse", {
        id: deleteTarget.id,
      });
      if (res.returnCode === 200) {
        toast({
          title: "Deleted",
          description: "Daily verse deleted successfully.",
        });
        setDeleteOpen(false);
        setDeleteTarget(null);
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        getAllDailyVerses();
      } else {
        toast({
          title: "Error",
          description: res.returnMessage || "Failed to delete.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading daily verses...</p>
        </div>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!dailyVerses.length) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <PageHeader onAdd={() => navigate(routes.addDailyVerse.path)} />
        <FilterCard
          fromDate={fromDate}
          toDate={toDate}
          activePreset={activePreset}
          filterError={filterError}
          isFiltered={isFiltered}
          onFromChange={setFromDate}
          onToChange={setToDate}
          onApply={validateAndApply}
          onClear={clearFilter}
          onPreset={applyPreset}
        />
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <Sun className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No verses found</h3>
            <p className="text-muted-foreground mb-4">
              {isFiltered
                ? "No verses match the selected date range."
                : "No daily verses have been added yet."}
            </p>
            <div className="flex gap-2 justify-center">
              {isFiltered && (
                <Button onClick={clearFilter}>Clear Filter</Button>
              )}
              <Button variant="outline" onClick={getAllDailyVerses}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const futureCount = !isFiltered
    ? dailyVerses.filter((v) => isFuture(v.displayDate)).length
    : 0;

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader onAdd={() => navigate(routes.addDailyVerse.path)} />

      <FilterCard
        fromDate={fromDate}
        toDate={toDate}
        activePreset={activePreset}
        filterError={filterError}
        isFiltered={isFiltered}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onApply={validateAndApply}
        onClear={clearFilter}
        onPreset={applyPreset}
      />

      {/* Status row */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isFiltered ? (
          <>
            <CalendarRange className="w-4 h-4 text-primary shrink-0" />
            <span>
              Showing verses
              {fromDate && (
                <>
                  {" "}
                  from{" "}
                  <strong className="text-foreground">
                    {formatDisplayDate(fromDate)}
                  </strong>
                </>
              )}
              {toDate && (
                <>
                  {" "}
                  to{" "}
                  <strong className="text-foreground">
                    {formatDisplayDate(toDate)}
                  </strong>
                </>
              )}
            </span>
            <button
              onClick={clearFilter}
              className="ml-1 rounded-full hover:text-destructive transition-colors"
              aria-label="Clear filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-accent shrink-0" />
            <span>
              Showing today
              {futureCount > 0 && (
                <>
                  {" "}
                  +{" "}
                  <strong className="text-foreground">
                    {futureCount} upcoming
                  </strong>{" "}
                  {futureCount === 1 ? "verse" : "verses"}
                </>
              )}{" "}
              + recent history
            </span>
          </>
        )}
      </div>

      {/* ── Featured Verse ─────────────────────────────────────────────────── */}
      {selectedVerse && (
        <Card className="opacity-0 fade-up stagger-1 relative overflow-hidden border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute top-4 right-4 pointer-events-none">
            <Sparkles className="w-8 h-8 text-accent/50" />
          </div>

          <CardHeader className="relative pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-accent/20 text-accent-foreground"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDisplayDate(selectedVerse.displayDate)}
                </Badge>
                {isToday(selectedVerse.displayDate) && (
                  <Badge className="bg-primary text-primary-foreground">
                    Today
                  </Badge>
                )}
                {isFuture(selectedVerse.displayDate) && (
                  <Badge
                    variant="outline"
                    className="border-accent text-accent"
                  >
                    Upcoming
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                  onClick={() => openEdit(selectedVerse)}
                  title="Edit verse"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => openDelete(selectedVerse)}
                  title="Delete verse"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button variant="ghost" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative pt-6 pb-8">
            <div className="max-w-3xl mx-auto text-center">
              <blockquote className="text-2xl lg:text-4xl font-[family-name:var(--font-heading)] leading-relaxed mb-6">
                "
                {getVerseText(
                  selectedVerse.bookName,
                  selectedVerse.chapter,
                  selectedVerse.verseNumber,
                )}
                "
              </blockquote>
              <p className="text-xl text-primary font-medium mb-8">
                — {selectedVerse.bookName} {selectedVerse.chapter}:
                {selectedVerse.verseNumber}
              </p>
              <div className="bg-secondary/50 rounded-xl p-6 text-left">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {isToday(selectedVerse.displayDate)
                    ? "Today's Reflection"
                    : isFuture(selectedVerse.displayDate)
                      ? "Upcoming Reflection"
                      : "Reflection"}
                </h3>
                <p className="text-lg leading-relaxed whitespace-pre-line">
                  {selectedVerse.reflection}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="outline"
                onClick={handlePreviousVerse}
                disabled={selectedIndex >= dailyVerses.length - 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Day
              </Button>

              <span className="text-sm text-muted-foreground">
                {isToday(selectedVerse.displayDate)
                  ? "Today's Verse"
                  : `Verse ${selectedIndex + 1} of ${dailyVerses.length}`}
              </span>

              <Button
                variant="outline"
                onClick={handleNextVerse}
                disabled={selectedIndex <= 0}
                className="gap-2"
              >
                Next Day
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Verse History ──────────────────────────────────────────────────── */}
      <div className="opacity-0 fade-up stagger-2">
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] mb-4">
          {isFiltered ? "Filtered Verses" : "Verse Window"}
        </h2>

        {!isFiltered && futureCount > 0 && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Upcoming
            </span>
            <div className="flex-1 h-px bg-accent/20" />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dailyVerses.map((verse, index) => {
            const prevVerse = dailyVerses[index - 1];
            const insertDivider =
              !isFiltered &&
              index > 0 &&
              isFuture(prevVerse.displayDate) &&
              !isFuture(verse.displayDate);

            return (
              <React.Fragment key={verse.id}>
                {insertDivider && (
                  <div className="md:col-span-2 lg:col-span-3 flex items-center gap-3 py-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Today &amp; Past
                    </span>
                    <div className="flex-1 h-px bg-border/60" />
                  </div>
                )}

                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-200 border-border/50 group",
                    selectedIndex === index
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-secondary/50",
                    isFuture(verse.displayDate) &&
                      "border-accent/30 bg-accent/5",
                  )}
                  onClick={() => setSelectedIndex(index)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            isToday(verse.displayDate) ? "default" : "secondary"
                          }
                          className={cn(
                            "text-xs",
                            isFuture(verse.displayDate) &&
                              "border-accent/50 text-accent bg-accent/10",
                          )}
                        >
                          {formatShortDate(verse.displayDate)}
                        </Badge>
                        {isFuture(verse.displayDate) && (
                          <span className="text-[10px] font-semibold text-accent uppercase tracking-wide">
                            Upcoming
                          </span>
                        )}
                      </div>

                      <div
                        className={cn(
                          "flex items-center gap-0.5 transition-opacity duration-150",
                          selectedIndex === index
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100",
                        )}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(verse);
                          }}
                          className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          title="Edit verse"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDelete(verse);
                          }}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete verse"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="font-medium text-sm line-clamp-2 mb-2">
                      "
                      {getVerseText(
                        verse.bookName,
                        verse.chapter,
                        verse.verseNumber,
                      )}
                      "
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {verse.bookName} {verse.chapter}:{verse.verseNumber}
                    </p>
                  </CardContent>
                </Card>
              </React.Fragment>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            disabled={!hasPrevious}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
          >
            Previous Page
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {Math.max(totalPages, 1)}
          </span>
          <Button
            variant="outline"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next Page
          </Button>
        </div>
      </div>

      {/* ═══ EDIT DIALOG ══════════════════════════════════════════════════════ */}
      {editState && (
        <EditVerseDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          state={editState}
          verseText={editVerseText}
          isSaving={isSaving}
          onChange={setEditState}
          onVerseTextChange={setEditVerseText}
          onSave={handleSaveEdit}
        />
      )}

      {/* ═══ DELETE DIALOG ════════════════════════════════════════════════════ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Daily Verse
            </DialogTitle>
            <DialogDescription>
              This will permanently remove the verse. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="my-2 rounded-lg border border-border/50 bg-muted/40 p-4 space-y-1.5">
              <p className="font-semibold text-sm">
                {deleteTarget.bookName} {deleteTarget.chapter}:
                {deleteTarget.verseNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDisplayDate(deleteTarget.displayDate)}
              </p>
              <p className="text-sm text-muted-foreground italic line-clamp-2 pt-1">
                "
                {getVerseText(
                  deleteTarget.bookName,
                  deleteTarget.chapter,
                  deleteTarget.verseNumber,
                )}
                "
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Verse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────────

const PageHeader = ({ onAdd }: { onAdd: () => void }) => (
  <div className="fade-up flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
        <Sun className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
          Daily Verse
        </h1>
        <p className="text-muted-foreground">Start each day with God's Word</p>
      </div>
    </div>
    <Button
      onClick={onAdd}
      className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md w-fit"
    >
      <Plus className="w-4 h-4" />
      Add Daily Verse
    </Button>
  </div>
);

interface FilterCardProps {
  fromDate: string;
  toDate: string;
  activePreset: string | null;
  filterError: string;
  isFiltered: boolean;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  onPreset: (p: string) => void;
}

const FilterCard = ({
  fromDate,
  toDate,
  activePreset,
  filterError,
  isFiltered,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  onPreset,
}: FilterCardProps) => (
  <Card className="border-border/50">
    <CardContent className="p-5 space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Quick Range
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPreset(p.value)}
              className={cn(
                "px-3 py-1 rounded-full text-sm border transition-colors",
                activePreset === p.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-secondary",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border/40" />
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="from-date">From</Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => onFromChange(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label htmlFor="to-date">To</Label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => onToChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button onClick={onApply} className="gap-2">
            <Search className="w-4 h-4" />
            Apply
          </Button>
          {isFiltered && (
            <Button variant="outline" onClick={onClear} className="gap-1">
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
      {filterError && <p className="text-sm text-destructive">{filterError}</p>}
    </CardContent>
  </Card>
);

// ─── Edit dialog ─────────────────────────────────────────────────────────────────

interface EditDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  state: EditState;
  verseText: string;
  isSaving: boolean;
  onChange: (s: EditState) => void;
  onVerseTextChange: (t: string) => void;
  onSave: () => void;
}

const EditVerseDialog = ({
  open,
  onOpenChange,
  state,
  verseText,
  isSaving,
  onChange,
  onVerseTextChange,
  onSave,
}: EditDialogProps) => {
  const [localState, setLocalState] = useState<EditState>(state);

  useEffect(() => {
    setLocalState(state);
  }, [state]);

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
    return (
      getVersesCountForChapter(localState.book, Number(localState.chapter)) || 0
    );
  }, [localState.book, localState.chapter]);

  const verseTextValue = useMemo(() => {
    if (!localState.book || !localState.chapter || !localState.verseNumber)
      return "";
    return (
      getVerseText(
        localState.book,
        Number(localState.chapter),
        Number(localState.verseNumber),
      ) || ""
    );
  }, [localState.book, localState.chapter, localState.verseNumber]);

  // Keep parent verse text in sync
  useEffect(() => {
    onVerseTextChange(verseTextValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseTextValue]);

  const set = (key: keyof EditState, value: unknown) => {
    let newState = { ...localState, [key]: value };
    if (key === "testament") {
      newState = { ...newState, book: "", chapter: "", verseNumber: "" };
    } else if (key === "book") {
      newState = { ...newState, chapter: "", verseNumber: "" };
    } else if (key === "chapter") {
      newState = { ...newState, verseNumber: "" };
    }
    setLocalState(newState);
    onChange(newState);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const d = new Date(localState.selectedDate);
    d.setHours(h, m, 0, 0);
    const newState = {
      ...localState,
      selectedTime: e.target.value,
      selectedDate: d,
    };
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

  // Guard: ensure selectedDate is always a valid Date before formatting
  const safeDateValue =
    localState.selectedDate instanceof Date &&
    !isNaN(localState.selectedDate.getTime())
      ? localState.selectedDate
      : new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Edit Daily Verse
          </DialogTitle>
          <DialogDescription>
            Update the verse reference, date, and reflection below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Testament</Label>
              <Combobox
                options={TESTAMENTS}
                value={localState.testament}
                onChange={(v) => set("testament", v)}
                placeholder="Select testament"
                width="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Book</Label>
              <Combobox
                options={books.map((b) => ({ value: b, label: b }))}
                value={localState.book}
                onChange={(v) => set("book", v)}
                placeholder="Select book"
                disabled={!localState.testament}
                width="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Chapter</Label>
              <Combobox
                options={chapters.map((c) => ({
                  value: String(c),
                  label: String(c),
                }))}
                value={localState.chapter}
                onChange={(v) => set("chapter", v)}
                placeholder="Select chapter"
                disabled={!localState.book}
                width="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Verse</Label>
              <Combobox
                options={
                  maxVerses > 0
                    ? Array.from({ length: maxVerses }, (_, i) => i + 1).map(
                        (v) => ({ value: String(v), label: String(v) }),
                      )
                    : []
                }
                value={localState.verseNumber}
                onChange={(v) => set("verseNumber", v)}
                placeholder="Select verse"
                disabled={!localState.chapter || maxVerses === 0}
                width="w-full"
              />
            </div>
          </div>

          {verseTextValue && (
            <div className="space-y-1.5">
              <Label>Verse Text</Label>
              <div className="relative">
                <Textarea
                  value={verseTextValue}
                  readOnly
                  className="resize-none bg-muted/40 font-serif leading-relaxed min-h-[80px]"
                />
                <span className="absolute bottom-2.5 right-3 text-xs text-muted-foreground">
                  {localState.book} {localState.chapter}:
                  {localState.verseNumber}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={format(safeDateValue, "yyyy-MM-dd")}
                onChange={handleDateChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input
                type="time"
                value={localState.selectedTime}
                onChange={handleTimeChange}
              />
              <p className="text-xs text-muted-foreground">
                {format(safeDateValue, "p")} · {format(safeDateValue, "EEEE")}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent" />
              Reflection
            </Label>
            <Textarea
              value={localState.reflection}
              onChange={(e) => set("reflection", e.target.value)}
              rows={5}
              className="resize-none"
              placeholder="Write your reflection..."
            />
          </div>
        </div>
 
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={
              isSaving ||
              !verseTextValue.trim() ||
              !localState.reflection.trim()
            }
            className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-md"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyVerse;

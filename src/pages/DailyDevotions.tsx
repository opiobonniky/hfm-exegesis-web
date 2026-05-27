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
  PenLine,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Combobox } from "@/components/ui/combobox";
import { routes } from "@/components/Routes/routes";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import {
  format,
  addDays,
  isAfter,
  isBefore,
  isToday,
  parseISO,
} from "date-fns";
import React from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DailyDevotionItem {
  id: number;
  title: string;
  content: string;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  displayDate: string | Record<string, never>;
  displayTime: string | Record<string, never>;
  createdBy: string;
  createdOn: string | Record<string, never>;
  updatedBy: string | null;
  updatedOn: string | Record<string, never>;
  isPublished: boolean;
}

interface DailyDevotionResponse {
  content: DailyDevotionItem[];
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

const safeDate = (dateInput: string | Record<string, never>): Date => {
  if (!dateInput || typeof dateInput !== "string") return new Date();
  const d = parseISO(dateInput);
  return isNaN(d.getTime()) ? new Date() : d;
};

const toYMD = (d: Date): string => format(d, "yyyy-MM-dd");

const formatDisplayDate = (
  dateInput: string | Record<string, never>,
): string => {
  const d = safeDate(dateInput);
  return format(d, "MMM d, yyyy");
};

const isFuture = (dateInput: string | Record<string, never>): boolean => {
  const d = safeDate(dateInput);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isAfter(d, today);
};

const getPresetRange = (preset: string): { from: string; to: string } => {
  const now = new Date();
  switch (preset) {
    case "this_week":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return { from: toYMD(startOfWeek), to: toYMD(now) };
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
  title: string;
  content: string;
  book: string;
  chapter: string;
  verseNumber: string;
  selectedDate: Date;
  selectedTime: string;
}

const buildEditState = (devotion: DailyDevotionItem): EditState => {
  const date = safeDate(devotion.displayDate);
  return {
    id: devotion.id,
    title: devotion.title,
    content: devotion.content,
    book: devotion.bookName || "",
    chapter: devotion.chapter ? String(devotion.chapter) : "",
    verseNumber: devotion.verseNumber ? String(devotion.verseNumber) : "",
    selectedDate: date,
    selectedTime: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
};

// ─── Main component ─────────────────────────────────────────────────────────────

const adminDailyDevotions = () => {
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  const [dailyDevotions, setDailyDevotions] = useState<DailyDevotionItem[]>([]);
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
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyDevotionItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedDevotion: any = dailyDevotions[selectedIndex];
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

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const getAllDailyDevotions = async () => {
    setIsLoading(true);
    try {
      const res = await sendPostRequest(
        "admin",
        "get-all-daily-devotions",
        requestPayload,
      );
      if (res.returnCode === 200) {
        const data = res.returnData as DailyDevotionResponse;
        setDailyDevotions(data.content || []);
        setTotalPages(data.totalPages);
        setHasNext(data.hasNext);
        setHasPrevious(data.hasPrevious);

        // Reset selected index if out of bounds
        if (selectedIndex >= (data.content?.length || 0)) {
          setSelectedIndex(Math.max(0, (data.content?.length || 1) - 1));
        }
      } else {
        toast({
          title: t.common?.error || 'Error',
          description: res.returnMessage || (t.devotions?.failedToFetch || 'Failed to fetch devotions'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching devotions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllDailyDevotions();
  }, [page, requestPayload]);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const validateAndApply = () => {
    if (fromDate && toDate && isAfter(parseISO(fromDate), parseISO(toDate))) {
      const dv = t.devotions;
      setFilterError(dv?.dateRangeError || "Start date must be before end date.");
      return;
    }
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

  const applyPreset = (preset: string) => {
    const range = getPresetRange(preset);
    setFromDate(range.from);
    setToDate(range.to);
    setActivePreset(preset);
    setPage(0);
  };

  // ── Save edit ───────────────────────────────────────────────────────────────
  const openEdit = (devotion: DailyDevotionItem) => {
    setEditState(buildEditState(devotion));
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    if (!editState.title.trim() || !editState.content.trim()) {        toast({
          title: t.devotions?.missingFields || 'Missing fields',
          description: t.devotions?.fillAllRequired || 'Please fill in the title and content.',
          variant: "destructive",
        });
        return;
      }
    setIsSaving(true);
    try {
      const res = await sendPostRequest("admin", "add-daily-devotion", {
        id: editState.id,
        title: editState.title,
        content: editState.content,
        bookName: editState.book || null,
        chapter: editState.chapter ? Number(editState.chapter) : null,
        verseNumber: editState.verseNumber
          ? Number(editState.verseNumber)
          : null,
        published: true,
        displayDate: editState.selectedDate.toISOString(),
        displayTime: editState.selectedDate.toISOString(),
      });
      if (res.returnCode === 200) {
        toast({
          title: t.devotions?.dailyDevotions || 'Updated',
          description: t.devotions?.devotionUpdated || 'Daily devotion updated successfully.',
        });
        setEditOpen(false);
        getAllDailyDevotions();
      } else {
        toast({
          title: t.common?.error || 'Error',
          description: res.returnMessage || "Failed to update.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t.common?.error || 'Error',
        description: t.common?.error || 'An error occurred.',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const openDelete = (devotion: DailyDevotionItem) => {
    setDeleteTarget(devotion);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await sendPostRequest("admin", "delete-daily-devotion", {
        id: deleteTarget.id,
      });
      if (res.returnCode === 200) {
        toast({
          title: t.devotions?.dailyDevotions || 'Deleted',
          description: t.devotions?.devotionDeleted || 'Daily devotion deleted successfully.',
        });
        setDeleteOpen(false);
        setDeleteTarget(null);
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        getAllDailyDevotions();
      } else {
        toast({
          title: t.common?.error || 'Error',
          description: res.returnMessage || "Failed to delete.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t.common?.error || 'Error',
        description: t.common?.error || 'An error occurred.',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{t.devotions?.loading || 'Loading daily devotions...'}</p>
        </div>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (!dailyDevotions.length) {
    return (
      <div className="p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <PageHeader onAdd={() => navigate(routes.addDailyDevotion.path)} />
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
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">{t.devotions?.noDevotions || 'No devotions found'}</h3>
            <p className="text-muted-foreground mb-4">
              {isFiltered
                ? (t.devotions?.noDevotionsMatch || 'No devotions match the selected date range.')
                : (t.devotions?.noDevotionsAdded || 'No daily devotions have been added yet.')}
            </p>
            <div className="flex gap-2 justify-center">
              {isFiltered && (
                <Button onClick={clearFilter}>{t.devotions?.clearFilter || 'Clear Filter'}</Button>
              )}
              <Button variant="outline" onClick={getAllDailyDevotions}>
                {t.devotions?.refresh || 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader onAdd={() => navigate(routes.addDailyDevotion.path)} />

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

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="w-4 h-4" />
          {t.common?.previous || 'Previous'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {isFiltered
            ? (t.devotions?.filteredDevotions || 'Filtered') + `: ${page + 1} / ${totalPages}`
            : (t.devotions?.devotions || 'Devotion') + ` ${selectedIndex + 1} / ${dailyDevotions.length}`}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isFiltered) {
              setPage((p) => p + 1);
            } else {
              setSelectedIndex((p) =>
                p < dailyDevotions.length - 1 ? p + 1 : p,
              );
            }
          }}
          disabled={
            isFiltered ? !hasNext : selectedIndex >= dailyDevotions.length - 1
          }
        >
          {t.common?.next || 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t.devotions?.allDevotions || 'All Devotions'}</h2>
          {dailyDevotions.map((devotion: any, index) => (
            <Card
              key={devotion.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border/50",
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          isFuture(devotion.displayDate)
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : isToday(devotion.displayDate)
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {formatDisplayDate(devotion.displayDate)}
                      </span>
                    </div>
                    <h3 className="font-semibold truncate">{devotion.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {devotion.content}
                    </p>
                    {devotion.bookName && (
                      <p className="text-sm text-primary font-medium mt-2">
                        {devotion.bookName} {devotion.chapter}:
                        {devotion.verseNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(devotion);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDelete(devotion);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview */}
        {selectedDevotion && (
          <div className="space-y-4">
            <div className="sticky top-6">
              <Card className="border-border/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        isToday(selectedDevotion.displayDate)
                          ? "default"
                          : "secondary"
                      }
                    >
                      {isToday(selectedDevotion.displayDate)
                        ? (t.devotions?.todaysDevotion || "Today's Devotion")
                        : isFuture(selectedDevotion.displayDate)
                          ? (t.devotions?.upcoming || 'Upcoming')
                          : (t.devotions?.past || 'Past')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDisplayDate(selectedDevotion.displayDate)}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-heading mt-2">
                    {selectedDevotion.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="prose prose-stone dark:prose-invert max-w-none">
                    <p className="leading-relaxed text-lg whitespace-pre-wrap">
                      {selectedDevotion.content}
                    </p>
                  </div>

                  {selectedDevotion.bookName && (
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        {t.devotions?.bibleReference || 'Bible Reference'}
                      </h3>
                      <p className="text-primary font-medium">
                        {selectedDevotion.bookName} {selectedDevotion.chapter}:
                        {selectedDevotion.verseNumber}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* ═══ EDIT DIALOG ════════════════════════════════════════════════════ */}
      <DevotionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editState={editState}
        onChange={setEditState}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />

      {/* ═══ DELETE DIALOG ════════════════════════════════════════════════════ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t.devotions?.deleteDevotionTitle || 'Delete Daily Devotion'}
            </DialogTitle>
            <DialogDescription>
              {t.devotions?.deleteDevotionDesc || 'This will permanently remove the devotion. This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="my-2 rounded-lg border border-border/50 bg-muted/40 p-4 space-y-1.5">
              <p className="font-semibold text-sm">{deleteTarget.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDisplayDate(deleteTarget.displayDate)}
              </p>
              <p className="text-sm text-muted-foreground italic line-clamp-2 pt-1">
                {deleteTarget.content.substring(0, 100)}...
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              {t.common?.cancel || 'Cancel'}
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
              {t.devotions?.deleteDevotion || 'Delete Devotion'}
            </Button>
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
    <div className="fade-up flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            {t.devotions?.dailyDevotions || 'Daily Devotion'}
          </h1>
          <p className="text-muted-foreground">
            {t.devotions?.pageSubtitle || 'Spiritual reflections for each day'}
          </p>
        </div>
      </div>
      {isAdmin && (
        <Button
          onClick={onAdd}
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md w-fit"
        >
          <Plus className="w-4 h-4" />
          {t.devotions?.addDevotion || 'Add Devotion'}
        </Button>
      )}
    </div>
  );
};

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
  onPreset: (v: string) => void;
}

const PRESETS = (t?: any) => [
  { label: t?.devotions?.presetLast7 || 'Last 7 days', value: 'last_7' },
  { label: t?.devotions?.presetLast30 || 'Last 30 days', value: 'last_30' },
  { label: t?.devotions?.presetThisWeek || 'This week', value: 'this_week' },
  { label: t?.devotions?.presetThisMonth || 'This month', value: 'this_month' },
  { label: t?.devotions?.presetLastMonth || 'Last month', value: 'last_month' },
];

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
}: FilterCardProps) => {
  const { t } = useLanguage();
  return (
    <Card className="border-border/50">
      <CardContent className="p-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {t.devotions?.quickRange || 'Quick Range'}
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS(t).map((p) => (
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
            <Label htmlFor="from-date">{t.common?.from || 'From'}</Label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => onFromChange(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="to-date">{t.common?.to || 'To'}</Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => onToChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onApply} variant="secondary">
              {t.devotions?.apply || 'Apply'}
            </Button>
            {isFiltered && (
              <Button onClick={onClear} variant="ghost">
                {t.devotions?.clear || 'Clear'}
              </Button>
            )}
          </div>
        </div>
        {filterError && <p className="text-sm text-destructive">{filterError}</p>}
      </CardContent>
    </Card>
  );
};

interface DevotionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editState: EditState | null;
  onChange: (state: EditState) => void;
  onSave: () => void;
  isSaving: boolean;
}

const DevotionEditDialog = ({
  open,
  onOpenChange,
  editState,
  onChange,
  onSave,
  isSaving,
}: DevotionEditDialogProps) => {
  const [localState, setLocalState] = useState<EditState | null>(null);
  const [safeDateValue, setSafeDateValue] = useState<Date>(new Date());

  useEffect(() => {
    if (editState) {
      setLocalState(editState);
      setSafeDateValue(editState.selectedDate);
    }
  }, [editState]);

  const set = (key: keyof EditState, value: unknown) => {
    if (!localState) return;
    let newState = { ...localState, [key]: value };
    if (key === "book") {
      newState = { ...newState, chapter: "", verseNumber: "" };
    } else if (key === "chapter") {
      newState = { ...newState, verseNumber: "" };
    }
    setLocalState(newState);
    onChange(newState);
  };

  const handleDateChange = (d: Date | undefined) => {
    if (!d || !localState) return;
    const newDate = new Date(localState.selectedDate);
    newDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    setSafeDateValue(newDate);
    set("selectedDate", newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!localState) return;
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate = new Date(localState.selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    set("selectedTime", e.target.value);
    set("selectedDate", newDate);
  };

  if (!localState) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            {t.devotions?.editDevotion || 'Edit Daily Devotion'}
          </DialogTitle>
          <DialogDescription>
            {t.devotions?.editDevotionDesc || 'Update the title, content, and optional Bible reference below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label>{t.common?.title || 'Title'} *</Label>
            <Input
              value={localState.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={t.devotions?.devotionTitlePlaceholder || 'Devotion title...'}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>{t.common?.content || 'Content'} *</Label>
            <Textarea
              value={localState.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder={t.devotions?.devotionContentPlaceholder || 'Devotion content...'}
              className="min-h-[200px]"
            />
          </div>

          {/* Optional Bible Reference */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>{t.dailyVerse?.book || 'Book'}</Label>
              <Input
                value={localState.book}
                onChange={(e) => set("book", e.target.value)}
                placeholder={t.dailyVerse?.selectBook || 'e.g. Psalms'}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.dailyVerse?.chapter || 'Chapter'}</Label>
              <Input
                type="number"
                value={localState.chapter}
                onChange={(e) => set("chapter", e.target.value)}
                placeholder={t.dailyVerse?.chapter || 'Chapter'}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.dailyVerse?.verse || 'Verse'}</Label>
              <Input
                type="number"
                value={localState.verseNumber}
                onChange={(e) => set("verseNumber", e.target.value)}
                placeholder={t.dailyVerse?.verse || 'Verse'}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t.common?.date || 'Date'}</Label>
              <Input
                type="date"
                value={format(safeDateValue, "yyyy-MM-dd")}
                onChange={(e) => handleDateChange(parseISO(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.common?.time || 'Time'}</Label>
              <Input
                type="time"
                value={localState.selectedTime}
                onChange={handleTimeChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common?.cancel || 'Cancel'}
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {t.devotions?.saveChanges || 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default adminDailyDevotions;

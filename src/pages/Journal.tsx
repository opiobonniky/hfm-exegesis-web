import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  PenLine,
  Plus,
  Search,
  Star,
  BookOpen,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Clock,
  Download,
  Globe,
  BookText,
  X,
  Filter,
  Users,
  FileText,
  Sparkles,
  TrendingUp,
  MessageSquareQuote,
  StarOff,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { getVerseText } from "@/utilities/bibleUtils";
import { useLanguage } from "@/components/languages/languageProvider";
import { useSubscription } from "@/hooks/useSubscription";
import TierBadge from "@/components/TierBadge";
import Gate from "@/components/Gate";

// ── Types ────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: number;
  title: string | null;
  content: string;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  category: string;
  mood: string | null;
  prayers: string | null;
  gratitude: string | null;
  learnings: string | null;
  application: string | null;
  isPublished: boolean;
  isFavorite: boolean;
  tags: string | null;
  createdOn: string;
  updatedOn: string;
  source?: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
  };
}

interface JournalStats {
  totalEntries: number;
  favoriteCount: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
  categoryBreakdown: { category: string; count: number }[];
  recentEntries: { id: number; title: string; category: string; createdOn: string }[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "all", key: "categoryAll" },
  { value: "general", key: "categoryGeneral" },
  { value: "study", key: "categoryStudy" },
  { value: "prayer", key: "categoryPrayer" },
  { value: "gratitude", key: "categoryGratitude" },
  { value: "reflection", key: "categoryReflection" },
  { value: "application", key: "categoryApplication" },
];

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊", grateful: "🙏", peaceful: "🕊️", thoughtful: "🤔",
  motivated: "💪", hopeful: "🌟", challenged: "🧗", blessed: "✨",
};

const CATEGORY_COLORS: Record<string, string> = {
  study: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  prayer: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
  gratitude: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  reflection: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  application: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
  general: "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400",
};

const BOOK_NAMES = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1 Samuel","2 Samuel",
  "1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs",
  "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations",
  "Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk",
  "Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts",
  "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John",
  "3 John","Jude","Revelation",
];

function getCategoryLabel(t: any, catValue: string): string {
  if (catValue === "all") return t.journal?.categoryAll || "All";
  const cat = CATEGORIES.find((c) => c.value === catValue);
  return (t.journal as any)?.[cat?.key || ""] || catValue;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  hasSearch,
  currentCategory,
  isDiscover,
  onCreateNew,
}: {
  hasSearch: boolean;
  currentCategory: string;
  isDiscover: boolean;
  onCreateNew: () => void;
}) {
  const hasCategoryFilter = currentCategory !== "all";
  let title = "No journal entries yet";
  let subtitle = "Complete an Exegesis Lab session or write a journal entry.";
  let icon = <BookText className="w-10 h-10 text-stone-400" />;

  if (isDiscover && !hasSearch && !hasCategoryFilter) {
    title = "No community entries yet";
    subtitle = "Entries from other users will appear here once people start sharing.";
    icon = <Globe className="w-10 h-10 text-stone-400" />;
  } else if (hasSearch && hasCategoryFilter) {
    title = "No matching entries";
    subtitle = "Try adjusting your search or clearing filters.";
    icon = <Search className="w-10 h-10 text-stone-400" />;
  } else if (hasSearch) {
    title = "No results found";
    subtitle = "Try a different search term.";
    icon = <Search className="w-10 h-10 text-stone-400" />;
  } else if (hasCategoryFilter) {
    title = `No ${getCategoryLabel({}, currentCategory)} entries`;
    subtitle = "Try selecting a different category.";
    icon = <FileText className="w-10 h-10 text-stone-400" />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="w-20 h-20 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center mb-5 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-1.5">{title}</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm mb-5">{subtitle}</p>
      {!hasSearch && !isDiscover && (
        <Button
          onClick={onCreateNew}
          className="rounded-xl bg-stone-800 hover:bg-stone-700 text-white dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-stone-900 gap-2"
        >
          <Plus className="w-4 h-4" />
          Create First Entry
        </Button>
      )}
    </div>
  );
}

// ── Export Modal ─────────────────────────────────────────────────────────────

export function ExportModal({
  onClose,
  selectedIds,
}: {
  onClose: () => void;
  selectedIds?: number[];
}) {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<"txt" | "json" | "pdf">("txt");
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await sendPostRequest("journal", "export-all", {
        format,
        ...(selectedIds && selectedIds.length > 0 ? { ids: selectedIds } : {}),
      });
      if (res.returnCode === 200 && res.returnData) {
        const { content, filename, entryCount } = res.returnData as any;
        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        let blob: Blob;
        if (format === "pdf") {
          blob = new Blob([byteArray], { type: "application/pdf" });
        } else if (format === "json") {
          const text = new TextDecoder().decode(byteArray);
          blob = new Blob([text], { type: "application/json" });
        } else {
          const text = new TextDecoder().decode(byteArray);
          blob = new Blob([text], { type: "text/plain" });
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || `legacy-ledger-export.${format}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 500);
        toast({
          title: "Exported",
          description: `Exported ${entryCount} entries as .${format}`,
        });
        onClose();
      }
    } catch (e: any) {
      toast({
        title: "Export Failed",
        description: e?.message || "Failed to export entries",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const formats = [
    { value: "pdf" as const, label: ".pdf", desc: "Formatted PDF" },
    { value: "txt" as const, label: ".txt", desc: "Plain Text" },
    { value: "json" as const, label: ".json", desc: "Structured Data" },
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 text-center mb-1">
        {selectedIds && selectedIds.length > 0
          ? `Export ${selectedIds.length} Selected Entries`
          : "Export Legacy Ledger"}
      </h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 text-center mb-5">
        {selectedIds && selectedIds.length > 0
          ? `Choose a format to export ${selectedIds.length} selected journal entries.`
          : "Choose a format to export all your entries."}
      </p>

      <div className="flex gap-3 mb-5">
        {formats.map((f) => (
          <button
            key={f.value}
            onClick={() => setFormat(f.value)}
            className={cn(
              "flex-1 flex flex-col items-center py-4 rounded-xl border-2 transition-all",
              format === f.value
                ? "bg-stone-800 text-white border-stone-800 dark:bg-stone-200 dark:text-stone-900 dark:border-stone-200"
                : "bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600",
            )}
          >
            <span className="text-lg font-black">{f.label}</span>
            <span className="text-xs mt-0.5 opacity-70">{f.desc}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-xl border-stone-200 dark:border-stone-800"
        >
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="flex-1 gap-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-stone-900"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function LegacyLedgerPage() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isPayingUser } = useSubscription();
  const [sowerPortalLoading, setSowerPortalLoading] = useState(false);

  const handleTierBadgeClick = useCallback(async () => {
    if (isPayingUser) {
      setSowerPortalLoading(true);
      try {
        const res = await sendPostRequest("subscriptions", "create-portal-session", {});
        if (res.returnCode === 200 && res.returnData?.url) {
          window.open(res.returnData.url, "_blank");
        } else {
          toast({ title: "Portal error", description: res.returnMessage || "Could not open billing portal.", variant: "destructive" });
        }
      } catch (err: any) {
        toast({ title: "Error", description: err?.message || "Something went wrong", variant: "destructive" });
      } finally {
        setSowerPortalLoading(false);
      }
    } else {
      navigate(routes.sower.path);
    }
  }, [isPayingUser, navigate, toast]);

  // ── Core state ──
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // ── Filters ──
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [category, setCategory] = useState("all");
  const [bookName, setBookName] = useState("");
  const [source, setSource] = useState("");
  const [strongsId, setStrongsId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ── UI state ──
  const [viewMode, setViewMode] = useState<"my" | "discover">("my");
  const [deleteDialog, setDeleteDialog] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ── Selection state ──
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    exitSelectionMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounced, category, bookName, source, strongsId, startDate, endDate, viewMode]);

  useEffect(() => {
    fetchEntries();
    if (viewMode === "my") fetchStats();
  }, [page, searchDebounced, category, bookName, source, strongsId, startDate, endDate, viewMode]);

  const buildPayload = useCallback(() => {
    const payload: Record<string, any> = { page, pageSize: 12 };
    if (searchDebounced) payload.search = searchDebounced;
    if (category !== "all") payload.category = category;
    if (bookName) payload.bookName = bookName;
    if (source) payload.source = source;
    if (strongsId) payload.strongsId = strongsId;
    if (startDate) payload.startDate = startDate;
    if (endDate) payload.endDate = endDate;
    return payload;
  }, [page, searchDebounced, category, bookName, source, strongsId, startDate, endDate]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = viewMode === "discover" ? "get-public" : "get-all";
      const res = await sendPostRequest("journal", endpoint, buildPayload());
      if (res.returnCode === 200 && res.returnData) {
        const data = res.returnData as any;
        setEntries(data.entries || []);
        setTotalPages(data.totalPages || 1);
        setHasNext(data.hasNext || false);
        setHasPrevious(data.hasPrevious || false);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  }, [viewMode, buildPayload]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await sendPostRequest("journal", "stats", {});
      if (res.returnCode === 200 && res.returnData) {
        setStats(res.returnData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: deleteDialog.id });
      if (res.returnCode === 200) {
        toast({ title: "Deleted", description: "Journal entry deleted" });
        setDeleteDialog(null);
        fetchEntries();
        fetchStats();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFavorite = async (entry: JournalEntry) => {
    try {
      const res = await sendPostRequest("journal", "toggle-favorite", { id: entry.id });
      if (res.returnCode === 200) {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, isFavorite: !e.isFavorite } : e)),
        );
        fetchStats();
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.general;

  const hasActiveFilters = search || category !== "all" || bookName || source || strongsId || startDate || endDate;

  const clearAllFilters = () => {
    setSearch("");
    setSearchDebounced("");
    setCategory("all");
    setBookName("");
    setSource("");
    setStrongsId("");
    setStartDate("");
    setEndDate("");
  };

  // ── Selection helpers ──
  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(entries.map((e) => e.id)));
  const clearSelection = () => setSelectedIds(new Set());
  const exitSelectionMode = () => { setSelectionMode(false); setSelectedIds(new Set()); };

  // ── Entry card renderer ──
  const renderEntry = (entry: JournalEntry) => {
    const moodEmoji = entry.mood ? MOOD_EMOJIS[entry.mood] : null;
    const isDiscover = viewMode === "discover";
    const author = entry.user;
    const verseText = entry.bookName && entry.chapter && entry.verseNumber
      ? getVerseText(entry.bookName, entry.chapter, entry.verseNumber)
      : null;

    return (
      <div
        key={entry.id}
        className={cn(
          "group relative rounded-2xl border bg-white dark:bg-stone-900/80 p-4 sm:p-5 cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]",
          "border-stone-200 dark:border-stone-800",
          entry.isFavorite && "ring-1 ring-amber-300 dark:ring-amber-700",
        )}
        onClick={() => {
          if (selectionMode) toggleSelection(entry.id);
          else navigate(`/journal/view/${entry.id}`);
        }}
      >
        {/* Header: badges + actions */}
        <div className={cn("flex items-start justify-between mb-3", isRtl && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-1.5 flex-wrap", isRtl && "flex-row-reverse")}>
            {selectionMode && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleSelection(entry.id); }}
                className="shrink-0 p-0.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {selectedIds.has(entry.id) ? (
                  <CheckSquare className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                ) : (
                  <Square className="w-5 h-5 text-stone-400" />
                )}
              </button>
            )}
            {entry.category && (
              <span className={cn("inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md", getCategoryColor(entry.category))}>
                {getCategoryLabel(t, entry.category)}
              </span>
            )}
            {moodEmoji && <span className="text-base leading-none">{moodEmoji}</span>}
            {isDiscover && author && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-100/50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300">
                <Users className="w-2.5 h-2.5" />
                {author.firstName || author.username || "Anonymous"}
              </span>
            )}
            {entry.source === "exegesis-lab" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                <BookText className="w-2.5 h-2.5" />
                Lab
              </span>
            )}
          </div>

          {/* Actions */}
          {!isDiscover && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(entry); }}
                className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {entry.isFavorite ? (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                ) : (
                  <StarOff className="w-4 h-4 text-stone-400" />
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                    <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRtl ? "start" : "end"} className="rounded-xl border-stone-200 dark:border-stone-800">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/journal/entry/${entry.id}`); }} className="text-xs">
                    <PenLine className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setDeleteDialog(entry); }} className="text-xs text-red-600 dark:text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Title */}
        {entry.title && (
          <h3 className="font-bold text-stone-900 dark:text-stone-100 mb-1.5 line-clamp-1">{entry.title}</h3>
        )}

        {/* Content preview */}
        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-3 mb-3 leading-relaxed" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          {entry.content}
        </p>

        {/* Verse preview */}
        {verseText && (
          <div className="flex items-start gap-2 p-3 mb-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 border-l-[3px] border-l-amber-400 dark:border-l-amber-600">
            <MessageSquareQuote className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs italic text-stone-600 dark:text-stone-400 leading-5 line-clamp-2" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              &ldquo;{verseText}&rdquo;
            </p>
          </div>
        )}

        {/* Footer: date + ref */}
        <div className={cn("flex items-center justify-between text-xs text-stone-400 dark:text-stone-500", isRtl && "flex-row-reverse")}>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {getRelativeTime(entry.createdOn)}
            <span className="text-stone-300 dark:text-stone-600">·</span>
            {formatDate(entry.createdOn)}
          </span>
          {entry.bookName && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {entry.bookName} {entry.chapter}:{entry.verseNumber}
            </span>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      {/* ── Subscription Tier Badge ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <TierBadge onClick={handleTierBadgeClick} loading={sowerPortalLoading} />
      </div>

      <Gate
        tier="legacy_sower"
        featureName="Legacy Ledger"
        featureDescription="Your complete study archive and private journal. Save Exegesis Lab results, write reflections, track prayers, and export your entire Legacy Ledger."
      >
        <div className="min-h-full bg-amber-50/30 dark:bg-stone-950" dir={isRtl ? "rtl" : "ltr"}>
          {/* ── Header ── */}
          <div className="border-b border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shrink-0 shadow-sm">
                    <BookText className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Legacy Ledger</h1>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {stats ? `${stats.totalEntries} entries · ${stats.entriesThisWeek} this week` : "Your study archive"}
                    </p>
                  </div>
                </div>
                {viewMode === "my" && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
                      className={cn(
                        "rounded-xl border-stone-200 dark:border-stone-800 text-xs",
                        selectionMode && "bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 border-stone-800 dark:border-stone-200"
                      )}
                    >
                      {selectionMode ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                      {selectionMode ? "Cancel" : "Select"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExportModal(true)}
                      className="rounded-xl border-stone-200 dark:border-stone-800 text-xs gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      {selectedIds.size > 0 ? `Export (${selectedIds.size})` : "Export"}
                    </Button>
                    <Button
                      onClick={() => navigate(routes.newJournalEntry.path)}
                      size="sm"
                      className="rounded-xl bg-stone-800 hover:bg-stone-700 text-white dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-stone-900 gap-2 text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      New Entry
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Segment Control ── */}
          <div className="border-b border-stone-200/60 dark:border-stone-800/60 bg-amber-50/80 dark:bg-stone-950/80 backdrop-blur-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("my")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
                    viewMode === "my"
                      ? "bg-stone-800 text-white border-stone-800 dark:bg-stone-200 dark:text-stone-900 dark:border-stone-200 shadow-sm"
                      : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800",
                  )}
                >
                  <BookText className="w-3.5 h-3.5" />
                  My Ledger
                </button>
                <button
                  onClick={() => setViewMode("discover")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all",
                    viewMode === "discover"
                      ? "bg-stone-800 text-white border-stone-800 dark:bg-stone-200 dark:text-stone-900 dark:border-stone-200 shadow-sm"
                      : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800",
                  )}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Community
                </button>

                <div className="flex-1" />

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all",
                    showFilters || hasActiveFilters
                      ? "bg-stone-800 text-white border-stone-800 dark:bg-stone-200 dark:text-stone-900 dark:border-stone-200"
                      : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800",
                  )}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                  {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* ── Stats (my entries only) ── */}
            {viewMode === "my" && stats && !hasActiveFilters && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total Entries", value: stats.totalEntries, icon: PenLine, bg: "bg-blue-50 dark:bg-blue-950/40", color: "text-blue-600 dark:text-blue-400" },
                  { label: "Favorites", value: stats.favoriteCount, icon: Star, bg: "bg-amber-50 dark:bg-amber-950/40", color: "text-amber-600 dark:text-amber-400" },
                  { label: "This Week", value: stats.entriesThisWeek, icon: TrendingUp, bg: "bg-emerald-50 dark:bg-emerald-950/40", color: "text-emerald-600 dark:text-emerald-400" },
                  { label: "This Month", value: stats.entriesThisMonth, icon: Sparkles, bg: "bg-violet-50 dark:bg-violet-950/40", color: "text-violet-600 dark:text-violet-400" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="rounded-2xl border bg-white dark:bg-stone-900/80 border-stone-200 dark:border-stone-800 p-4 flex items-center gap-3 transition-all hover:shadow-sm">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border-0 shrink-0", s.bg)}>
                        <Icon className={cn("w-5 h-5", s.color)} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">{s.value}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Search + Category ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400", isRtl ? "right-3" : "left-3")} />
                <Input
                  aria-label={viewMode === "discover" ? "Search community entries" : "Search entries"}
                  placeholder={viewMode === "discover" ? "Search community entries..." : "Search entries..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "h-9 text-sm rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800",
                    isRtl ? "pr-9" : "pl-9"
                  )}
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setSearchDebounced(""); }}
                    className={cn("absolute top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors", isRtl ? "left-2.5" : "right-2.5")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Filter by category" className="w-full sm:w-44 h-9 text-sm rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {getCategoryLabel(t, cat.value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Advanced Filters ── */}
            {showFilters && (
              <div className="bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 mb-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Advanced Filters</p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mb-1">Book</p>
                    <Select value={bookName} onValueChange={(v) => setBookName(v === "all" ? "" : v)}>
                      <SelectTrigger aria-label="Filter by book" className="h-9 text-xs rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                        <SelectValue placeholder="All books" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
                        <SelectItem value="all">All Books</SelectItem>
                        {BOOK_NAMES.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {viewMode === "my" && (
                    <div>
                      <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mb-1">Source</p>
                      <Select value={source} onValueChange={(v) => setSource(v === "all" ? "" : v)}>
                        <SelectTrigger aria-label="Filter by source" className="h-9 text-xs rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                          <SelectValue placeholder="All sources" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
                          <SelectItem value="all">All Sources</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="exegesis-lab">Exegesis Lab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {viewMode === "my" && (
                    <div>
                      <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mb-1">Strong's ID</p>
                      <Input
                        aria-label="Strong's ID"
                        placeholder="e.g. G26, H7225"
                        value={strongsId}
                        onChange={(e) => setStrongsId(e.target.value)}
                        className="h-9 text-xs rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mb-1">Start Date</p>
                    <Input
                      aria-label="Start date filter"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mb-1">End Date</p>
                    <Input
                      aria-label="End date filter"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Selection Action Bar ── */}
            {selectionMode && entries.length > 0 && (
              <div className="sticky top-14 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 mb-4 bg-stone-800/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { selectedIds.size === entries.length ? clearSelection() : selectAll(); }}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
                    >
                      {selectedIds.size === entries.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      {selectedIds.size === entries.length ? "Deselect All" : "Select All"}
                    </button>
                    <span className="text-xs text-stone-400">{selectedIds.size} of {entries.length} selected</span>
                  </div>
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={clearSelection}
                        className="text-xs text-stone-400 hover:text-stone-200 transition-colors px-3 py-1.5 rounded-xl border border-stone-600 hover:border-stone-400"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 text-stone-900 hover:bg-amber-400 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export Selected ({selectedIds.size})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Entry List ── */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-stone-500" />
              </div>
            ) : entries.length === 0 ? (
              <EmptyState
                hasSearch={!!search}
                currentCategory={category}
                isDiscover={viewMode === "discover"}
                onCreateNew={() => navigate(routes.newJournalEntry.path)}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {entries.map(renderEntry)}
              </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                <Button
                  variant="outline"
                  disabled={!hasPrevious}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="rounded-xl border-stone-200 dark:border-stone-800"
                >
                  <ChevronLeft className={cn("w-4 h-4", isRtl ? "ml-2 order-1" : "mr-2")} />
                  Previous
                </Button>
                <span className="text-sm text-stone-500 dark:text-stone-400">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  disabled={!hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border-stone-200 dark:border-stone-800"
                >
                  Next
                  <ChevronRight className={cn("w-4 h-4", isRtl ? "mr-2" : "ml-2")} />
                </Button>
              </div>
            )}
          </div>

          {/* ── Delete Dialog ── */}
          <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
            <DialogContent className="rounded-2xl border-stone-200 dark:border-stone-800">
              <DialogHeader>
                <DialogTitle className="text-stone-800 dark:text-stone-200">Delete Journal Entry</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-stone-600 dark:text-stone-400">Are you sure you want to delete this entry? This action cannot be undone.</p>
              {deleteDialog?.title && <p className="text-sm font-medium text-stone-800 dark:text-stone-200">&ldquo;{deleteDialog.title}&rdquo;</p>}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialog(null)} className="rounded-xl border-stone-200 dark:border-stone-800">Cancel</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Export Modal ── */}
          <Dialog open={showExportModal} onOpenChange={(open) => { if (!open) { setShowExportModal(false); if (selectedIds.size > 0) exitSelectionMode(); } }}>
            <DialogContent className="rounded-2xl border-stone-200 dark:border-stone-800">
              <ExportModal
                onClose={() => { setShowExportModal(false); if (selectedIds.size > 0) exitSelectionMode(); }}
                selectedIds={selectedIds.size > 0 ? Array.from(selectedIds) : undefined}
              />
            </DialogContent>
          </Dialog>
        </div>
      </Gate>
    </>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Highlighter,
  Star,
  FileText,
  History,
  BookOpen,
  Trash2,
  Loader2,
  Search,
  X,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { HIGHLIGHT_COLORS } from "@/hooks/useBible";
import { getVerseText } from "@/utilities/bibleUtils";
import { cn } from "@/lib/utils";

const useFormatTimeAgo = () => {
  const { t } = useLanguage();
  return (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffSecs < 60) return t.myActivity.justNow;
    if (diffMins < 60) return t.myActivity.minAgo.replace('{n}', String(diffMins));
    if (diffHours < 24) return diffHours === 1 ? t.myActivity.hourAgo.replace('{n}', '1') : t.myActivity.hoursAgo.replace('{n}', String(diffHours));
    if (diffDays === 1) return t.myActivity.yesterday;
    if (diffDays < 7) return t.myActivity.daysAgo.replace('{n}', String(diffDays));
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (diffDays < 14) return days[date.getDay()];
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  };
};

interface HighlightItem { id: number; bookName: string; chapter: number; verseNumber: number; colorId: number; note?: string; createdOn: string }
interface NoteItem { id: number; bookName: string; chapter: number; verseNumber: number; note: string; createdOn: string }
interface FavoriteItem { id: number; bookName: string; chapter: number; verseNumber: number; createdOn: string }
interface ReadHistoryItem { id: number; bookName: string; chapter: number; verseNumber: number; createdOn: string }

type ActivityType = "all" | "highlights" | "notes" | "favorites" | "history";

const BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah",
  "Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah",
  "Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke",
  "John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy",
  "Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

const TYPE_META: Record<string, { icon: typeof BookOpen; color: string; bg: string; label: string }> = {
  highlights: { icon: Highlighter, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", label: "Highlight" },
  notes: { icon: FileText, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", label: "Note" },
  favorites: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", label: "Favorite" },
  history: { icon: History, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", label: "Read" },
};

export default function MyActivity() {
  const { t, isRtl } = useLanguage();
  const formatTimeAgo = useFormatTimeAgo();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeFilter, setActiveFilter] = useState<ActivityType>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBook, setFilterBook] = useState<string>("all");

  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [readHistory, setReadHistory] = useState<ReadHistoryItem[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  // ── Data loading ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [highlightsRes, notesRes, favoritesRes, historyRes] = await Promise.all([
        sendPostRequest("bible", "get-highlights", { pageSize: 100 }),
        sendPostRequest("bible", "get-verse-note", {}),
        sendPostRequest("bible", "get-favorites", { pageSize: 100 }),
        sendPostRequest("bible", "get-read-history", { pageSize: 100 }),
      ]);
      if (highlightsRes.returnCode === 200) setHighlights(highlightsRes.returnData?.highlights || []);
      if (notesRes.returnCode === 200) setNotes(notesRes.returnData || []);
      if (favoritesRes.returnCode === 200) setFavorites(favoritesRes.returnData?.favorites || []);
      if (historyRes.returnCode === 200) setReadHistory(historyRes.returnData?.readHistories || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Delete handlers ──
  const deleteHighlight = async (id: number) => {
    setDeleting(id);
    try {
      const res = await sendPostRequest("bible", "delete-highlight", { highlightId: id });
      if (res.returnCode === 200) { setHighlights((p) => p.filter((h) => h.id !== id)); toast({ title: t.myActivity.toastHighlightRemoved }); }
    } catch { toast({ title: t.myActivity.toastFailedRemoveHighlight, variant: "destructive" }); }
    finally { setDeleting(null); }
  };

  const deleteNote = async (id: number) => {
    setDeleting(id);
    try {
      const res = await sendPostRequest("bible", "delete-verse-note", { noteId: id });
      if (res.returnCode === 200) { setNotes((p) => p.filter((n) => n.id !== id)); toast({ title: t.myActivity.toastNoteRemoved }); }
    } catch { toast({ title: t.myActivity.toastFailedRemoveNote, variant: "destructive" }); }
    finally { setDeleting(null); }
  };

  const deleteFavorite = async (id: number) => {
    setDeleting(id);
    try {
      const res = await sendPostRequest("bible", "delete-favorite", { favoriteId: id });
      if (res.returnCode === 200) { setFavorites((p) => p.filter((f) => f.id !== id)); toast({ title: t.myActivity.toastFavoriteRemoved }); }
    } catch { toast({ title: t.myActivity.toastFailedRemoveFavorite, variant: "destructive" }); }
    finally { setDeleting(null); }
  };

  const clearReadHistory = async () => {
    if (readHistory.length === 0) return;
    setClearingAll(true);
    try {
      const ids = readHistory.map((h) => h.id);
      const res = await sendPostRequest("bible", "delete-read-history", { readHistoryIds: ids });
      if (res.returnCode === 200) { setReadHistory([]); toast({ title: t.myActivity.toastHistoryCleared }); }
    } catch { toast({ title: t.myActivity.toastFailedClearHistory, variant: "destructive" }); }
    finally { setClearingAll(false); }
  };

  const deleteReadHistoryItem = async (id: number) => {
    setDeleting(id);
    try {
      const res = await sendPostRequest("bible", "delete-read-history", { readHistoryIds: [id] });
      if (res.returnCode === 200) { setReadHistory((p) => p.filter((h) => h.id !== id)); toast({ title: t.myActivity.toastHistoryItemRemoved }); }
    } catch { toast({ title: t.myActivity.toastFailedRemoveHistory, variant: "destructive" }); }
    finally { setDeleting(null); }
  };

  const getColorById = (colorId: number) => HIGHLIGHT_COLORS.find((c) => c.id === colorId)?.color || "#F87171";

  const goToVerse = (bookName: string, chapter: number) => navigate(`/bible-reader?book=${bookName}&chapter=${chapter}`);

  // ── Build unified feed ──
  const feed: {
    id: string;
    type: "highlights" | "notes" | "favorites" | "history";
    data: any;
    timestamp: string;
  }[] = [
    ...highlights.map((h) => ({ id: `h-${h.id}`, type: "highlights" as const, data: h, timestamp: h.createdOn })),
    ...notes.map((n) => ({ id: `n-${n.id}`, type: "notes" as const, data: n, timestamp: n.createdOn })),
    ...favorites.map((f) => ({ id: `f-${f.id}`, type: "favorites" as const, data: f, timestamp: f.createdOn })),
    ...readHistory.map((h) => ({ id: `r-${h.id}`, type: "history" as const, data: h, timestamp: h.createdOn })),
  ].filter((item) => {
    if (activeFilter !== "all" && item.type !== activeFilter) return false;
    if (filterBook !== "all" && item.data.bookName.toLowerCase() !== filterBook.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const ref = `${item.data.bookName} ${item.data.chapter}:${item.data.verseNumber}`.toLowerCase();
      const noteMatch = item.data.note?.toLowerCase().includes(q);
      if (!ref.includes(q) && !noteMatch) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // ── Get count per type ──
  const counts = {
    all: highlights.length + notes.length + favorites.length + readHistory.length,
    highlights: highlights.length,
    notes: notes.length,
    favorites: favorites.length,
    history: readHistory.length,
  };

  // ── Render a single feed item ──
  const renderFeedItem = (item: typeof feed[0]) => {
    const { data } = item;
    const meta = TYPE_META[item.type];
    const Icon = meta.icon;
    const verseText = getVerseText(data.bookName, data.chapter, data.verseNumber);

    const handleDelete = () => {
      if (item.type === "highlights") deleteHighlight(data.id);
      else if (item.type === "notes") deleteNote(data.id);
      else if (item.type === "favorites") deleteFavorite(data.id);
      else deleteReadHistoryItem(data.id);
    };

    const isDeleting = item.type === "highlights" && deleting === data.id ||
      item.type === "notes" && deleting === data.id ||
      item.type === "favorites" && deleting === data.id ||
      item.type === "history" && deleting === data.id;

    return (
      <div
        key={item.id}
        onClick={() => goToVerse(data.bookName, data.chapter)}
        className="group relative bg-card border rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
      >
        {/* Top bar: type badge + time */}
        <div className="flex items-center justify-between mb-3">
          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide", meta.bg, meta.color)}>
            <Icon className="w-3 h-3" />
            {meta.label}
          </div>
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(data.createdOn)}
          </span>
        </div>

        {/* Verse reference */}
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground/70">
            {data.bookName} {data.chapter}:{data.verseNumber}
          </span>
        </div>

        {/* Verse text */}
        {verseText && (
          <p className="text-sm leading-relaxed text-foreground/80 line-clamp-2 mb-2 italic border-l-2 border-muted-foreground/20 pl-3">
            &ldquo;{verseText}&rdquo;
          </p>
        )}

        {/* Note content (for notes) */}
        {item.type === "notes" && data.note && (
          <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-800/30 px-3.5 py-2.5">
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">{data.note}</p>
          </div>
        )}

        {/* Note on highlight */}
        {item.type === "highlights" && data.note && (
          <p className="mt-2 text-xs text-muted-foreground/60 line-clamp-1">{data.note}</p>
        )}

        {/* Bottom bar: delete + navigate */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
          <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1 group-hover:text-primary/60 transition-colors">
            Open in reader
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all max-sm:opacity-100"
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Color accent bar for highlights */}
        {item.type === "highlights" && (
          <div
            className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
            style={{ backgroundColor: getColorById(data.colorId) }}
          />
        )}
      </div>
    );
  };

  const FILTERS: { key: ActivityType; label: string; icon: typeof BookOpen }[] = [
    { key: "all", label: "All", icon: BookOpen },
    { key: "highlights", label: "Highlights", icon: Highlighter },
    { key: "notes", label: "Notes", icon: FileText },
    { key: "favorites", label: "Favorites", icon: Star },
    { key: "history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-full bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Header ── */}
      <div className="border-b bg-gradient-to-br from-primary/[0.04] via-background to-accent/[0.04]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            {t.sidebar?.myActivity || 'My Activity'}
          </h1>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Your highlights, notes, favorites &amp; reading history
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Filter pills ── */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {FILTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                activeFilter === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/50 text-secondary-foreground/70 hover:bg-secondary hover:text-secondary-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={cn(
                "ml-0.5 text-[10px] px-1.5 py-0 rounded-full",
                activeFilter === key ? "bg-primary-foreground/15 text-primary-foreground/80" : "bg-muted-foreground/10 text-muted-foreground/60",
              )}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Search + Book filter ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 pb-5 border-b border-border/40">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input
              placeholder="Search verses or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm rounded-xl bg-muted/30 border-muted-foreground/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={filterBook} onValueChange={setFilterBook}>
              <SelectTrigger aria-label="Filter by book" className="w-full sm:w-[150px] h-9 text-xs rounded-xl bg-muted/30 border-muted-foreground/20">
                <SelectValue placeholder="All books" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                {BOOKS.map((book) => (
                  <SelectItem key={book} value={book} className="text-xs">{book}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(activeFilter === "history" && readHistory.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearReadHistory}
                disabled={clearingAll}
                className="h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl px-3 shrink-0"
              >
                {clearingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline ml-1">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── Feed ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-foreground/50">
              {activeFilter === "all" ? "Nothing here yet" : `No ${FILTERS.find(f => f.key === activeFilter)?.label.toLowerCase() || 'items'} found`}
            </p>
            <p className="text-xs text-muted-foreground/40 mt-1 max-w-[280px]">
              {activeFilter === "all"
                ? "Your activity from the Bible Reader will appear here"
                : `Try switching the filter or search for something else`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground/50">
                {feed.length} {feed.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            {feed.map(renderFeedItem)}
          </div>
        )}
      </div>
    </div>
  );
}

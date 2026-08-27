import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

interface JournalEntry { id: number; title: string; content: string; mood?: string; tags?: string; isPrivate: boolean; createdAt: string; updatedAt: string; }
interface JournalStats { totalEntries: number; thisMonth: number; currentStreak: number; totalWords: number; }
export function useJournalPageFull() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { isPayingUser } = useSubscription();
  const [sowerPortalLoading, setSowerPortalLoading] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [category, setCategory] = useState("all");
  const [bookName, setBookName] = useState("");
  const [source, setSource] = useState("");
  const [strongsId, setStrongsId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"my" | "discover">("my");
  const [deleteDialog, setDeleteDialog] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleTierBadgeClick = useCallback(async () => {
    if (isPayingUser) {
      setSowerPortalLoading(true);
      try {
        const res = await sendPostRequest("subscriptions", "create-portal-session", {});
        if (res.returnCode === 200 && res.returnData?.url) window.open(res.returnData.url, "_blank");
        else toast({ title: "Portal error", description: res.returnMessage || "Could not open billing portal.", variant: "destructive" });
      } catch (err: any) { toast({ title: "Error", description: err?.message || "Something went wrong", variant: "destructive" }); }
      finally { setSowerPortalLoading(false); }
    } else { navigate(routes.sower.path); }
  }, [isPayingUser, navigate, toast]);
  const loadEntries = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("journal", "get-all", {
        page: p, size: 12, search: searchDebounced || undefined, category: category !== "all" ? category : undefined,
        bookName: bookName || undefined, source: source || undefined, strongsId: strongsId || undefined,
        startDate: startDate || undefined, endDate: endDate || undefined, viewMode,
      });
      if (res?.returnCode === 200 && res?.returnData) {
        setEntries(res.returnData.content || []); setTotalPages(res.returnData.totalPages || 1);
        setHasNext(res.returnData.hasNext || false); setHasPrevious(res.returnData.hasPrevious || false);
      }
    } catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [searchDebounced, category, bookName, source, strongsId, startDate, endDate, viewMode, toast]);
  const loadStats = useCallback(async () => {
    try {
      const res = await sendPostRequest("journal", "get-stats", {});
      if (res?.returnCode === 200 && res?.returnData) setStats(res.returnData);
    } catch {}
  }, []);
  useEffect(() => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); searchTimerRef.current = setTimeout(() => setSearchDebounced(search), 300); return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); }; }, [search]);
  useEffect(() => { loadEntries(page); }, [page, loadEntries]);
  useEffect(() => { loadStats(); }, [loadStats]);
  const handleDelete = useCallback(async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: deleteDialog.id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); setDeleteDialog(null); loadEntries(page); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setDeleting(false); }
  }, [deleteDialog, loadEntries, page, toast]);
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === entries.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(entries.map((e) => e.id)));
  }, [entries, selectedIds.size]);
  const exitSelectionMode = useCallback(() => { setSelectionMode(false); setSelectedIds(new Set()); }, []);
  const selectAll = useCallback(() => {
    if (selectedIds.size === entries.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(entries.map((e) => e.id)));
  }, [entries, selectedIds.size]);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const hasActiveFilters = !!(search || category || bookName || source || strongsId || startDate || endDate);
  const clearAllFilters = useCallback(() => { setSearch(""); setCategory(""); setBookName(""); setSource(""); setStrongsId(""); setStartDate(null); setEndDate(null); }, []);
  const renderEntry = useCallback((entry: any) => null, []);
  return {
    t, isRtl, navigate, userInfo, isPayingUser, handleTierBadgeClick, sowerPortalLoading,
    entries, stats, loading, page, setPage, totalPages, hasNext, hasPrevious,
    search, setSearch, category, setCategory, bookName, setBookName, source, setSource,
    strongsId, setStrongsId, startDate, setStartDate, endDate, setEndDate,
    viewMode, setViewMode, deleteDialog, setDeleteDialog, deleting, handleDelete,
    showExportModal, setShowExportModal, showFilters, setShowFilters,
    selectionMode, setSelectionMode, selectedIds, setSelectedIds, toggleSelectAll,
    exitSelectionMode, selectAll, clearSelection,
    hasActiveFilters, clearAllFilters, setSearchDebounced, renderEntry,
    refresh: () => loadEntries(page),
  };
}

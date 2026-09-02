import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes, generatePath } from "@/components/Routes/routes";
import { useLanguage } from "@/components/languages/languageProvider";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { sendPostRequest } from "@/services/api";

export type JournalViewMode = "my" | "discover";

export interface JournalPageEntry {
  id: number;
  userId: string;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number | null;
  category?: string;
  mood?: string | null;
  prayers?: string | null;
  gratitude?: string | null;
  learnings?: string | null;
  application?: string | null;
  isPublished?: boolean;
  isFavorite?: boolean;
  strongsWords?: string | null;
  strongsIds?: string | null;
  source?: string;
  tags?: string | null;
  createdOn?: string;
  updatedOn?: string;
  createdBy?: string;
  updatedBy?: string | null;
}

export interface JournalPageStats {
  totalEntries: number;
  favoriteCount: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
}

export function useJournalPageFull() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isPayingUser } = useSubscription();
  const [sowerPortalLoading, setSowerPortalLoading] = useState(false);
  const [entries, setEntries] = useState<JournalPageEntry[]>([]);
  const [stats, setStats] = useState<JournalPageStats | null>(null);
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
  const [viewMode, setViewMode] = useState<JournalViewMode>("my");
  const [deleteDialog, setDeleteDialog] = useState<JournalPageEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleTierBadgeClick = useCallback(async () => {
    if (!isPayingUser) {
      navigate(routes.sower.path);
      return;
    }

    setSowerPortalLoading(true);
    try {
      const res = await sendPostRequest("subscriptions", "create-portal-session", {});
      if (res.returnCode === 200 && res.returnData?.url) {
        window.open(res.returnData.url, "_blank");
      } else {
        toast({ title: "Portal error", description: res.returnMessage || "Could not open billing portal.", variant: "destructive" });
      }
    } catch (error) {
      const description = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: "Error", description, variant: "destructive" });
    } finally {
      setSowerPortalLoading(false);
    }
  }, [isPayingUser, navigate, toast]);

  const loadEntries = useCallback(async (requestedPage: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("journal", "get-all", {
        page: requestedPage,
        size: 12,
        search: searchDebounced || undefined,
        category: category !== "all" ? category : undefined,
        bookName: bookName || undefined,
        source: source || undefined,
        strongsId: strongsId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        viewMode,
      });
      if (res?.returnCode === 200 && res?.returnData) {
        const data = res.returnData;
        const items = data.entries || data.content || data || [];
        setEntries(Array.isArray(items) ? items : []);
        setTotalPages(data.totalPages || 1);
        setHasNext(data.hasNext || false);
        setHasPrevious(data.hasPrevious || false);
      }
    } catch {
      toast({ title: "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [bookName, category, endDate, searchDebounced, source, startDate, strongsId, toast, viewMode]);

  const loadStats = useCallback(async () => {
    try {
      const res = await sendPostRequest("journal", "stats", {});
      if (res?.returnCode === 200 && res?.returnData) setStats(res.returnData);
    } catch {
      // Stats are supplementary; entries remain usable if this request fails.
    }
  }, []);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setSearchDebounced(search), 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  useEffect(() => {
    loadEntries(page);
  }, [loadEntries, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleDelete = useCallback(async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: deleteDialog.id });
      if (res?.returnCode === 200) {
        toast({ title: "Deleted" });
        setDeleteDialog(null);
        loadEntries(page);
      } else {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }, [deleteDialog, loadEntries, page, toast]);

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);
  const handlePreviousPage = useCallback(() => setPage((current) => Math.max(current - 1, 1)), []);
  const handleNextPage = useCallback(() => setPage((current) => current + 1), []);
  const openDeleteDialog = useCallback((entry: JournalPageEntry) => setDeleteDialog(entry), []);
  const closeDeleteDialog = useCallback(() => setDeleteDialog(null), []);
  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    if (!open) setDeleteDialog(null);
  }, []);
  const openExportDialog = useCallback(() => setShowExportModal(true), []);
  const closeExportDialog = useCallback(() => {
    setShowExportModal(false);
    if (selectedIds.size > 0) {
      setSelectionMode(false);
      setSelectedIds(new Set());
    }
  }, [selectedIds.size]);
  const handleExportDialogOpenChange = useCallback((open: boolean) => {
    if (!open) closeExportDialog();
  }, [closeExportDialog]);
  const viewEntry = useCallback((id: number) => navigate(generatePath("journalDetail", { entryId: id })), [navigate]);
  const createEntry = useCallback(() => navigate(routes.newJournalEntry.path), [navigate]);
  const toggleEntrySelection = useCallback((id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleSelectAll = useCallback(() => {
    setSelectedIds((current) => current.size === entries.length ? new Set() : new Set(entries.map((entry) => entry.id)));
  }, [entries]);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);
  const toggleSelectionMode = useCallback(() => {
    if (selectionMode) exitSelectionMode();
    else setSelectionMode(true);
  }, [exitSelectionMode, selectionMode]);
  const handleViewModeChange = useCallback((value: string) => {
    if (value === "my" || value === "discover") setViewMode(value);
  }, []);
  const clearAllFilters = useCallback(() => {
    setSearch("");
    setCategory("all");
    setBookName("");
    setSource("");
    setStrongsId("");
    setStartDate("");
    setEndDate("");
  }, []);
  const refresh = useCallback(() => loadEntries(page), [loadEntries, page]);
  const hasActiveFilters = !!(search || category !== "all" || bookName || source || strongsId || startDate || endDate);

  return {
    t, isRtl, handleTierBadgeClick, sowerPortalLoading,
    entries, stats, loading, page, totalPages, hasNext, hasPrevious,
    search, handleSearchChange, category, setCategory, bookName, setBookName, source, setSource,
    strongsId, setStrongsId, startDate, setStartDate, endDate, setEndDate,
    viewMode, handleViewModeChange, showFilters, setShowFilters,
    deleteDialog, deleting, handleDelete, openDeleteDialog, closeDeleteDialog, handleDeleteDialogOpenChange,
    showExportModal, openExportDialog, closeExportDialog, handleExportDialogOpenChange,
    selectionMode, selectedIds, toggleSelectionMode, exitSelectionMode,
    toggleEntrySelection, toggleSelectAll, clearSelection,
    handlePreviousPage, handleNextPage, viewEntry, createEntry,
    hasActiveFilters, clearAllFilters, refresh,
  };
}

export type JournalPageModel = ReturnType<typeof useJournalPageFull>;

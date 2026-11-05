import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes, generatePath } from "@/components/Routes/routes";
import { useLanguage } from "@/components/languages/languageProvider";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { sendPostRequest } from "@/services/api";
import { tt } from '@/components/languages/hardcodedTranslate';
import type { JournalAction } from '../components/JournalActionDialog';

export type JournalViewMode = "my" | "discover";

export interface JournalPageEntry {
  id: number;
  userId: string;
  title: string;
  content: string;
  observations?: string | null;
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
  const [entryAction, setEntryAction] = useState<JournalAction | null>(null);
  const requestId = useRef(0);
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
        toast({ title: tt("Portal error"), description: res.returnMessage || "Could not open billing portal.", variant: "destructive" });
      }
    } catch (error) {
      const description = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: tt("Error"), description, variant: "destructive" });
    } finally {
      setSowerPortalLoading(false);
    }
  }, [isPayingUser, navigate, toast]);

  const loadEntries = useCallback(async (requestedPage: number) => {
    const request = ++requestId.current;
    setLoading(true);
    try {
      const res = await sendPostRequest("ledger", viewMode === "discover" ? "discover" : "list", {
        page: requestedPage,
        pageSize: 12,
        search: searchDebounced || undefined,
        category: category !== "all" ? category : undefined,
        bookName: bookName || undefined,
        source: source || undefined,
        strongsId: strongsId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        viewMode,
      }, { includeLanguage: true });
      if (request !== requestId.current) return;
      if (res?.returnCode === 200 && res?.returnData) {
        const data = res.returnData;
        const items = data.entries || data.content || data || [];
        setEntries(Array.isArray(items) ? items : []);
        setTotalPages(data.totalPages || 1);
        setHasNext(data.hasNext || false);
        setHasPrevious(data.hasPrevious || false);
      }
    } catch {
      toast({ title: tt("Failed to load"), variant: "destructive" });
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, [bookName, category, endDate, searchDebounced, source, startDate, strongsId, toast, viewMode]);

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
    setSelectionMode(false); setSelectedIds(new Set());
  }, [page, searchDebounced, category, bookName, source, strongsId, startDate, endDate]);

  useEffect(() => {
    if (!selectionMode) return;
    const cancel = (event: KeyboardEvent) => { if (event.key === "Escape") { setSelectionMode(false); setSelectedIds(new Set()); } };
    window.addEventListener("keydown", cancel); return () => window.removeEventListener("keydown", cancel);
  }, [selectionMode]);

  const handleDelete = useCallback(async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: deleteDialog.id });
      if (res?.returnCode === 200) {
        toast({ title: tt("Deleted") });
        setDeleteDialog(null);
        loadEntries(page);
      } else {
        toast({ title: tt("Delete failed"), variant: "destructive" });
      }
    } catch {
      toast({ title: tt("Error"), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }, [deleteDialog, loadEntries, page, toast]);

  const handleSearchChange = useCallback((value: string) => { setSearch(value); setPage(1); }, []);
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
  const beginSelection = useCallback((id: number) => {
    setSelectionMode(true);
    setSelectedIds(previous => { const next = new Set(previous); next.add(id); return next; });
    navigator.vibrate?.(35);
  }, []);
  const toggleFavorite = useCallback(async (id: number) => {
    const response = await sendPostRequest("journal", "toggle-favorite", { id });
    if (response.returnCode === 200) setEntries(previous => previous.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));
    else toast({ title: tt("Failed to update favorite"), variant: "destructive" });
  }, [toast]);
  const openEntryAction = useCallback((kind: "pdf" | "share", entry?: JournalPageEntry) => {
    const chosen = entry ? [entry] : entries.filter(e => selectedIds.has(e.id));
    if (chosen.length) setEntryAction({ kind, entries: chosen });
  }, [entries, selectedIds]);
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
    data: {
      t, isRtl, sowerPortalLoading, entries, stats, loading, page, totalPages,
      hasNext, hasPrevious, search, category, bookName, source, strongsId,
      startDate, endDate, viewMode, showFilters, deleteDialog, deleting,
      showExportModal, selectionMode, selectedIds, hasActiveFilters, entryAction,
    },
    actions: {
      handleTierBadgeClick, handleSearchChange, setCategory, setBookName,
      setSource, setStrongsId, setStartDate, setEndDate, handleViewModeChange,
      setShowFilters, handleDelete, openDeleteDialog, closeDeleteDialog,
      handleDeleteDialogOpenChange, openExportDialog, closeExportDialog,
      handleExportDialogOpenChange, toggleSelectionMode, exitSelectionMode,
      toggleEntrySelection, toggleSelectAll, clearSelection,
      handlePreviousPage, handleNextPage, viewEntry, createEntry,
      clearAllFilters, refresh, beginSelection, toggleFavorite, openEntryAction, closeEntryAction: () => setEntryAction(null),
    },
  };
}

export type JournalPageModel =
  ReturnType<typeof useJournalPageFull>["data"] &
  ReturnType<typeof useJournalPageFull>["actions"];

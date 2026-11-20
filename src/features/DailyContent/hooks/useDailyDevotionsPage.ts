// useDailyDevotionsPage — all state, effects, and logic for DailyDevotions page
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import type { DailyDevotionCardItem, DailyDevotionItem } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

export function useDailyDevotionsPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.userRole === 1;
  // Listing
  const [devotions, setDevotions] = useState<DailyDevotionCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [filterError, setFilterError] = useState("");
  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyDevotionCardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const generation = useRef(0);
  const loadDevotions = useCallback(async (p: number) => {
    const request = ++generation.current;
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { page: p, size: 12, listPreview: true };
      if (fromDate) payload.startDate = fromDate;
      if (toDate) payload.endDate = toDate;
      if (search) payload.search = search;
      const res = await sendPostRequest("admin", "get-all-daily-devotions", payload);
      if (request !== generation.current) return;
      if (res?.returnCode === 200 && res?.returnData) {
        setDevotions(res.returnData.content || []);
        setTotal(res.returnData.totalElements || 0);
        setTotalPages(res.returnData.totalPages || 0);
        setHasNext(res.returnData.hasNext ?? false);
        setHasPrevious(res.returnData.hasPrevious ?? false);
      } else throw new Error('Devotions unavailable');
    } catch {
      if (request === generation.current) {
        setDevotions([]); setTotal(0); setTotalPages(0); setHasNext(false); setHasPrevious(false);
        toast({ title: tt("Failed to load"), variant: "destructive" });
      }
    } finally { if (request === generation.current) setLoading(false); }
  }, [fromDate, toDate, search, toast]);

  // Typing filters as you go, without a request per keystroke.
  useEffect(() => {
    if (searchInput.trim() === search) return;
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => { void loadDevotions(page); return () => { generation.current++; }; }, [page, loadDevotions]);
  const loadDevotion = useCallback(async (id: number) => {
    try {
      const res = await sendPostRequest<{ content: DailyDevotionItem[] }>("admin", "get-all-daily-devotions",
        { id, size: 1 }, { includeLanguage: false });
      const devotion = res.returnData?.content?.[0];
      if (res.returnCode !== 200 || !devotion) throw new Error('Devotion unavailable');
      return devotion;
    } catch {
      toast({ title: tt("Failed to load"), variant: "destructive" });
    }
  }, [toast]);
  const openEdit = useCallback(async (item?: DailyDevotionCardItem) => {
    if (!item) { navigate("/add-daily-devotion"); return; }
    const devotion = await loadDevotion(item.id);
    if (devotion) navigate("/add-daily-devotion", { state: { devotion } });
  }, [navigate, loadDevotion]);
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await sendPostRequest("admin", "delete-daily-devotion", { id: deleteTarget.id });
      if (res?.returnCode === 200) { toast({ title: tt("Deleted") }); setDeleteOpen(false); setDeleteTarget(null); loadDevotions(page); }
      else { toast({ title: tt("Delete failed"), variant: "destructive" }); }
    } catch { toast({ title: tt("Error"), variant: "destructive" }); }
    finally { setIsDeleting(false); }
  }, [deleteTarget, toast, loadDevotions, page]);

  const openDelete = useCallback((item: DailyDevotionCardItem) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  }, []);
  const openDetail = useCallback(async (item: DailyDevotionCardItem) => {
    const devotion = await loadDevotion(item.id);
    if (devotion) navigate(`/daily-devotion-detail?devotion=${encodeURIComponent(JSON.stringify(devotion))}`);
  }, [navigate, loadDevotion]);
  // ── Preset date ranges ──
  const toYMD = (d: Date) => d.toISOString().split("T")[0];
  const applyPreset = useCallback((preset: string) => {
    const now = new Date();
    let from = "";
    let to = toYMD(now);
    switch (preset) {
      case "last_7": from = toYMD(new Date(now.getTime() - 6 * 864e5)); break;
      case "last_30": from = toYMD(new Date(now.getTime() - 29 * 864e5)); break;
      case "this_week": {
        const s = new Date(now); s.setDate(now.getDate() - now.getDay()); from = toYMD(s); break;
      }
      case "this_month": from = toYMD(new Date(now.getFullYear(), now.getMonth(), 1)); break;
      case "last_month": from = toYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1)); to = toYMD(new Date(now.getFullYear(), now.getMonth(), 0)); break;
    }
    setFromDate(from);
    setToDate(to);
    setActivePreset(preset);
    setPage(0);
  }, []);

  // Every filter change re-fetches immediately (search is debounced above).
  const changeFromDate = useCallback((value: string) => {
    setFromDate(value);
    setActivePreset(null);
    setPage(0);
  }, []);

  const changeToDate = useCallback((value: string) => {
    setToDate(value);
    setActivePreset(null);
    setPage(0);
  }, []);

  const changeSearch = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const clearFilter = useCallback(() => {
    setFromDate("");
    setToDate("");
    setSearchInput("");
    setSearch("");
    setActivePreset(null);
    setFilterError("");
    setPage(0);
  }, []);

  const refresh = useCallback(() => loadDevotions(page), [loadDevotions, page]);

  const emptyMessage = t.devotions?.noDevotions || "No devotions found";
  const addLabel = t.devotions?.addDevotion || "Add Devotion";
  const paginationLabels = {
    page: (t as any).common?.page || "Page",
    of: (t as any).common?.of || "of",
    results: "results",
  };

  return {
    data: {
      t, isRtl, navigate, isAdmin, devotions, loading, page, total, totalPages,
      hasNext, hasPrevious, selectedIndex, fromDate, toDate, activePreset, filterError,
      search: searchInput,
      isFiltered: Boolean(fromDate || toDate || searchInput),
      deleteOpen, deleteTarget, isDeleting, emptyMessage, addLabel, paginationLabels,
      showPagination: totalPages > 1,
    },
    actions: {
      setPage, setSelectedIndex, setActivePreset, setFilterError,
      changeFromDate, changeToDate, changeSearch, applyPreset, clearFilter, openEdit,
      setDeleteOpen, handleDelete, openDelete, openDetail, refresh,
    },
  };
}

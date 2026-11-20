// useDailyDevotionsPage — all state, effects, and logic for DailyDevotions page
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import type { DailyDevotionItem } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

export function useDailyDevotionsPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.userRole === 1;
  // Listing
  const [devotions, setDevotions] = useState<DailyDevotionItem[]>([]);
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
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [filterError, setFilterError] = useState("");
  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyDevotionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const loadDevotions = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const payload: Record<string, any> = { page: p, size: 12 };
      if (fromDate) payload.startDate = fromDate;
      if (toDate) payload.endDate = toDate;
      const res = await sendPostRequest("admin", "get-all-daily-devotions", payload);
      if (res?.returnCode === 200 && res?.returnData) {
        setDevotions(res.returnData.content || []);
        setTotal(res.returnData.totalElements || 0);
        setTotalPages(res.returnData.totalPages || 0);
        setHasNext(res.returnData.hasNext ?? false);
        setHasPrevious(res.returnData.hasPrevious ?? false);
      }
    } catch { toast({ title: tt("Failed to load"), variant: "destructive" }); }
    finally { setLoading(false); }
  }, [fromDate, toDate, toast]);
  useEffect(() => { loadDevotions(page); }, [page, loadDevotions]);
  const openEdit = useCallback((item?: DailyDevotionItem) => {
    navigate("/add-daily-devotion", item ? { state: { devotion: item } } : undefined);
  }, [navigate]);
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

  const openDelete = useCallback((item: DailyDevotionItem) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  }, []);
  const openDetail = useCallback((item: DailyDevotionItem) => {
    navigate(`/daily-devotion-detail?devotion=${encodeURIComponent(JSON.stringify(item))}`);
  }, [navigate]);
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
  }, []);

  const clearFilter = useCallback(() => {
    setFromDate("");
    setToDate("");
    setActivePreset(null);
    setFilterError("");
  }, []);

  const refresh = useCallback(() => loadDevotions(page), [loadDevotions, page]);

  const applyFilter = useCallback(() => {
    setFilterError("");
    refresh();
  }, [refresh]);

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
      isFiltered: fromDate !== "" || toDate !== "",
      deleteOpen, deleteTarget, isDeleting, emptyMessage, addLabel, paginationLabels,
      showPagination: totalPages > 1,
    },
    actions: {
      setPage, setSelectedIndex, setFromDate, setToDate, setActivePreset, setFilterError,
      applyPreset, clearFilter, applyFilter, openEdit,
      setDeleteOpen, handleDelete, openDelete, openDetail, refresh,
    },
  };
}

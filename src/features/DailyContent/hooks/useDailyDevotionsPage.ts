// useDailyDevotionsPage — all state, effects, and logic for DailyDevotions page
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import type { DailyDevotionItem } from "../types";

export interface EditState {
  title: string; content: string; bookName: string; chapter: string;
  verseNumber: string; displayDate: string; displayTime: string; isPublished: boolean;
  selectedDate?: Date; selectedTime?: string;
}
const EMPTY_EDIT: EditState = {
  title: "", content: "", bookName: "", chapter: "", verseNumber: "",
  displayDate: new Date().toISOString().split("T")[0], displayTime: "08:00", isPublished: true,
};
export function useDailyDevotionsPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
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
  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
    } catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [fromDate, toDate, toast]);
  useEffect(() => { loadDevotions(page); }, [page, loadDevotions]);
  const openEdit = useCallback((item?: DailyDevotionItem) => {
    const now = new Date();
    const dateStr = item?.displayDate && typeof item.displayDate === "string"
      ? new Date(item.displayDate).toISOString().split("T")[0]
      : now.toISOString().split("T")[0];
    const base = {
      title: item?.title || "", content: item?.content || "", bookName: item?.bookName || "",
      chapter: item?.chapter?.toString() || "", verseNumber: item?.verseNumber?.toString() || "",
      displayDate: dateStr, displayTime: "08:00", isPublished: item?.isPublished ?? true,
      selectedDate: new Date(dateStr), selectedTime: "08:00",
    };
    setEditState(base);
    setEditOpen(true);
  }, []);
  const handleSave = useCallback(async () => {
    if (!editState) return;
    setIsSaving(true);
      const payload = {
        ...editState,
        chapter: editState.chapter ? Number(editState.chapter) : null,
        verseNumber: editState.verseNumber ? Number(editState.verseNumber) : null,
      };
      const res = await sendPostRequest("admin", "add-daily-devotion", payload);
      if (res?.returnCode === 200) {
        toast({ title: "Saved" }); setEditOpen(false); loadDevotions(page);
      } else {
        toast({ title: "Save failed", description: res?.returnMessage, variant: "destructive" });
    } catch { toast({ title: "Error saving", variant: "destructive" }); }
    finally { setIsSaving(false); }
  }, [editState, toast, loadDevotions, page]);
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
      const res = await sendPostRequest("admin", "delete-daily-devotion", { id: deleteTarget.id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); setDeleteOpen(false); setDeleteTarget(null); loadDevotions(page); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsDeleting(false); }
  }, [deleteTarget, toast, loadDevotions, page]);
  return {
    t, isRtl, navigate,
    devotions, loading, page, setPage, total, totalPages, hasNext, hasPrevious, selectedIndex, setSelectedIndex,
    fromDate, setFromDate, toDate, setToDate, activePreset, setActivePreset, filterError, setFilterError,
    editOpen, setEditOpen, editState, setEditState, isSaving, openEdit, handleSave,
    deleteOpen, setDeleteOpen, deleteTarget, setDeleteTarget, isDeleting, handleDelete,
    refresh: () => loadDevotions(page),
  };

// useDailyVersePage — all state, effects, and logic for DailyVerse page
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { EMPTY_EDIT, type DailyVerseItem, type EditState } from "../types";
import { safeDate, toYMD, isFuture, getPresetRange } from "../constants";

export function useDailyVersePage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.userRole === 1;

  // Listing
  const [verses, setVerses] = useState<DailyVerseItem[]>([]);
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
  const [editVerseText, setEditVerseText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyVerseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Conflict
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean; conflict: any; payload: any;
  }>({ open: false, conflict: null, payload: null });

  const [todayVerse, setTodayVerse] = useState<any>(null);

  useEffect(() => {
    sendPostRequest("bible", "get-todays-verse", {}).then(res => {
      if (res?.returnCode === 200) setTodayVerse(res.returnData);
    }).catch(() => {});
  }, []);

  // ─── Load ──────────────────────────────────────────────────────────────────
  const loadVerses = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const payload: Record<string, any> = { page: p, size: 12 };
      if (fromDate) payload.startDate = fromDate;
      if (toDate) payload.endDate = toDate;
      if (!fromDate && !toDate) payload.smartDefault = true;
      const res = await sendPostRequest("admin", "get-all-daily-verses", payload);
      if (res?.returnCode === 200 && res?.returnData) {
        setVerses(res.returnData.content || []);
        setTotal(res.returnData.totalElements || 0);
        setTotalPages(res.returnData.totalPages || 0);
        setHasNext(res.returnData.hasNext ?? false);
        setHasPrevious(res.returnData.hasPrevious ?? false);
      }
    } catch {
      toast({ title: "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, toast]);

  useEffect(() => { loadVerses(page); }, [page, loadVerses]);

  // ─── Filter helpers ────────────────────────────────────────────────────────
  const isFiltered = Boolean(fromDate || toDate);
  const futureCount = useMemo(() => {
    if (isFiltered) return 0;
    const now = toYMD(new Date());
    return verses.filter((v) => {
      const d = safeDate(v.displayDate);
      return toYMD(d) > now;
    }).length;
  }, [verses, isFiltered]);

  const selectedVerse = verses[selectedIndex] || null;

  const validateAndApply = useCallback(() => {
    if (fromDate && toDate && fromDate > toDate) {
      setFilterError("Start date must be before end date");
      return;
    }
    setFilterError("");
    setPage(0);
  }, [fromDate, toDate]);

  const clearFilter = useCallback(() => {
    setFromDate("");
    setToDate("");
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset: string) => {
    if (preset === "custom") {
      setActivePreset("custom");
      return;
    }
    const range = getPresetRange(preset);
    setFromDate(range.from);
    setToDate(range.to);
    setActivePreset(preset);
  }, []);

  // ─── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = useCallback((item?: DailyVerseItem) => {
    if (item) {
      setEditState({
        bookName: item.bookName,
        chapter: String(item.chapter),
        verseNumber: String(item.verseNumber),
        bibleVersion: item.bibleVersion || "BSB",
        explanation: item.explanation || "",
        reflection: item.reflection || "",
        learnMore: item.learnMore || "",
        application: item.application || "",
        verseIntroduction: item.verseIntroduction || "",
        displayDate: item.displayDate
          ? new Date(item.displayDate as string).toISOString().split("T")[0]
          : "",
        isPublished: item.isPublished,
      });
    } else {
      setEditState({ ...EMPTY_EDIT, displayDate: new Date().toISOString().split("T")[0] });
    }
    setEditOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editState) return;
    setIsSaving(true);
    try {
      const payload = {
        ...editState,
        chapter: Number(editState.chapter),
        verseNumber: Number(editState.verseNumber),
      };
      const res = await sendPostRequest("admin", "add-daily-verse", payload);
      if (res?.returnCode === 200) {
        toast({ title: "Saved" });
        setEditOpen(false);
        loadVerses(page);
      } else if (res?.returnCode === 409) {
        setConflictDialog({ open: true, conflict: res.returnData, payload });
      } else {
        toast({ title: "Save failed", description: res?.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [editState, toast, loadVerses, page]);

  const handleConflictUpdate = useCallback(async () => {
    if (!conflictDialog.payload) return;
    try {
      const payload = { ...conflictDialog.payload, id: conflictDialog.conflict?.existing?.id };
      const res = await sendPostRequest("admin", "add-daily-verse", payload);
      if (res?.returnCode === 200) {
        toast({ title: "Updated existing entry" });
        setConflictDialog({ open: false, conflict: null, payload: null });
        loadVerses(page);
      } else {
        toast({ title: "Update failed", description: res?.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }, [conflictDialog, toast, loadVerses, page]);

  // ─── Delete ────────────────────────────────────────────────────────────────
  const openDelete = useCallback((verse: DailyVerseItem) => {
    setDeleteTarget(verse);
    setDeleteOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await sendPostRequest("admin", "delete-daily-verse", { id: deleteTarget.id });
      if (res?.returnCode === 200) {
        toast({ title: "Deleted" });
        setDeleteOpen(false);
        setDeleteTarget(null);
        loadVerses(page);
      } else {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Delete error", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, toast, loadVerses, page]);

  // ─── Navigate helpers ──────────────────────────────────────────────────────
  const openInBible = useCallback((verse: DailyVerseItem) => {
    navigate(`/bible-reader?book=${verse.bookName}&chapter=${verse.chapter}&verse=${verse.verseNumber}`);
  }, [navigate]);

  const openInJournal = useCallback((verse: DailyVerseItem) => {
    window.open(
      `/journal/new?book=${verse.bookName}&chapter=${verse.chapter}&verse=${verse.verseNumber}`,
      "_blank",
    );
  }, []);

  return {
    t, isRtl, navigate, isAdmin,
    // Listing
    verses, loading, page, setPage, total, totalPages,
    hasNext, hasPrevious, selectedIndex, setSelectedIndex,
    selectedVerse, todayVerse,
    // Filters
    fromDate, setFromDate, toDate, setToDate,
    activePreset, filterError, isFiltered, futureCount,
    validateAndApply, clearFilter, applyPreset,
    // Edit
    editOpen, setEditOpen, editState, setEditState,
    editVerseText, setEditVerseText, isSaving,
    openEdit, handleSave, handleConflictUpdate,
    // Delete
    deleteOpen, setDeleteOpen, deleteTarget, setDeleteTarget,
    isDeleting, handleDelete, openDelete,
    // Conflict
    conflictDialog, setConflictDialog,
    // Navigate
    openInBible, openInJournal,
    // Refresh
    refresh: () => loadVerses(page),
  };
}

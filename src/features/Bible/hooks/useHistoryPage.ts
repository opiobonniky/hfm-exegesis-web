// useHistoryPage — state, effects, and logic for standalone History page
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export interface HistoryItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber?: number;
  lastVerse?: number;
  createdOn: string;
  lastRead?: string;
}

interface DeleteModal {
  visible: boolean;
  type: "single" | "all" | null;
  itemId?: number;
  itemName?: string;
}

export function useHistoryPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBook, setFilterBook] = useState("all");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({
    visible: false,
    type: null,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-read-history", { pageSize: 200 });
      const items: HistoryItem[] = res.returnCode === 200 ? (res.returnData?.readHistories || []) : [];
      setHistory(items.filter(Boolean));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteItem = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      const res = await sendPostRequest("bible", "delete-read-history", { readHistoryIds: [id] });
      if (res.returnCode === 200) {
        setHistory((p) => p.filter((h) => h.id !== id));
        toast({ title: "History item removed" });
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }, [toast]);

  const clearAll = useCallback(async () => {
    setClearingAll(true);
    try {
      const ids = history.map((h) => h.id);
      const res = await sendPostRequest("bible", "delete-read-history", { readHistoryIds: ids });
      if (res.returnCode === 200) {
        setHistory([]);
        toast({ title: "History cleared" });
      }
    } catch {
      toast({ title: "Failed to clear history", variant: "destructive" });
    } finally {
      setClearingAll(false);
      setDeleteModal({ visible: false, type: null });
    }
  }, [history, toast]);

  const confirmDelete = useCallback(() => {
    if (deleteModal.type === "all") {
      clearAll();
    } else if (deleteModal.type === "single" && deleteModal.itemId) {
      deleteItem(deleteModal.itemId);
      setDeleteModal({ visible: false, type: null });
    }
  }, [deleteModal, clearAll, deleteItem]);

  const goToReader = useCallback((book: string, ch: number) => {
    navigate(`/bible-reader?book=${book}&chapter=${ch}`);
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return history.filter((h) => {
      if (filterBook !== "all" && h.bookName !== filterBook) return false;
      if (q) {
        const ref = `${h.bookName} ${h.chapter}`.toLowerCase();
        if (!ref.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.createdOn || a.lastRead || 0).getTime();
      const dateB = new Date(b.createdOn || b.lastRead || 0).getTime();
      return dateB - dateA;
    });
  }, [history, searchQuery, filterBook]);

  const grouped = useMemo(() => {
    const groups: Record<string, HistoryItem[]> = {};
    for (const item of filtered) {
      const date = new Date(item.createdOn || item.lastRead || 0);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [filtered]);

  const formatTimeAgo = useCallback((dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  return {
    t, isRtl, loading, history, filtered, grouped, searchQuery, setSearchQuery,
    filterBook, setFilterBook, deleting, clearingAll, deleteModal, setDeleteModal,
    confirmDelete, goToReader, formatTimeAgo, refresh: loadData,
  };
}

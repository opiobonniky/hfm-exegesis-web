// useMyActivity — all state, effects, and logic for MyActivity page
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

import type { ActivityType } from "../types";
export function useMyActivity() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<ActivityType>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBook, setFilterBook] = useState("all");
  const [highlights, setHighlights] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [readHistory, setReadHistory] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [h, n, f, r] = await Promise.all([
        sendPostRequest("bible", "get-highlights", { pageSize: 100 }),
        sendPostRequest("bible", "get-verse-note", {}),
        sendPostRequest("bible", "get-favorites", { pageSize: 100 }),
        sendPostRequest("bible", "get-read-history", { pageSize: 100 }),
      ]);
      if (h.returnCode === 200) setHighlights(h.returnData?.highlights || []);
      if (n.returnCode === 200) setNotes(n.returnData || []);
      if (f.returnCode === 200) setFavorites(f.returnData?.favorites || []);
      if (r.returnCode === 200) setReadHistory(r.returnData?.readHistories || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  const deleteItem = useCallback(async (type: string, id: number, endpoint: string, field: string) => {
    setDeleting(id);
      const res = await sendPostRequest("bible", endpoint, { [field]: id });
      if (res.returnCode === 200) {
        if (type === "highlights") setHighlights((p) => p.filter((x) => x.id !== id));
        else if (type === "notes") setNotes((p) => p.filter((x) => x.id !== id));
        else if (type === "favorites") setFavorites((p) => p.filter((x) => x.id !== id));
        else setReadHistory((p) => p.filter((x) => x.id !== id));
        toast({ title: "Removed" });
      }
    } catch { toast({ title: "Failed", variant: "destructive" }); } finally { setDeleting(null); }
  }, [toast]);
  const clearHistory = useCallback(async () => {
    setClearingAll(true);
      const res = await sendPostRequest("bible", "delete-read-history", { readHistoryIds: readHistory.map((h) => h.id) });
      if (res.returnCode === 200) { setReadHistory([]); toast({ title: "History cleared" }); }
    } catch {} finally { setClearingAll(false); }
  }, [readHistory, toast]);
  const goToReader = useCallback((book: string, ch: number) => {
    navigate(`/bible-reader?book=${book}&chapter=${ch}`);
  }, [navigate]);
  const formatTimeAgo = useCallback((dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000), hours = Math.floor(mins / 60), days = Math.floor(hours / 24);
    if (mins < 1) return t.myActivity.justNow;
    if (mins < 60) return t.myActivity.minAgo.replace("{n}", String(mins));
    if (hours < 24) return t.myActivity.hoursAgo.replace("{n}", String(hours));
    if (days === 1) return t.myActivity.yesterday;
    if (days < 7) return t.myActivity.daysAgo.replace("{n}", String(days));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [t]);
  const feed = useMemo(() => {
    return [
      ...highlights.map((h) => ({ id: `h-${h.id}`, type: "highlights" as const, data: h, ts: h.createdOn })),
      ...notes.map((n) => ({ id: `n-${n.id}`, type: "notes" as const, data: n, ts: n.createdOn })),
      ...favorites.map((f) => ({ id: `f-${f.id}`, type: "favorites" as const, data: f, ts: f.createdOn })),
      ...readHistory.map((h) => ({ id: `r-${h.id}`, type: "history" as const, data: h, ts: h.createdOn })),
    ].filter((item) => {
      if (activeFilter !== "all" && item.type !== activeFilter) return false;
      if (filterBook !== "all" && item.data.bookName.toLowerCase() !== filterBook.toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const ref = `${item.data.bookName} ${item.data.chapter}:${item.data.verseNumber}`.toLowerCase();
        const noteMatch = "note" in item.data ? item.data.note?.toLowerCase().includes(q) : false;
        if (!ref.includes(q) && !noteMatch) return false;
      return true;
    }).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [highlights, notes, favorites, readHistory, activeFilter, filterBook, searchQuery]);
  const counts = {
    all: highlights.length + notes.length + favorites.length + readHistory.length,
    highlights: highlights.length, notes: notes.length,
    favorites: favorites.length, history: readHistory.length,
  };
  return {
    t, isRtl,
    activeFilter, setActiveFilter,
    loading, searchQuery, setSearchQuery,
    filterBook, setFilterBook,
    feed, counts, deleting, clearingAll,
    deleteItem, clearHistory, goToReader, formatTimeAgo,
}

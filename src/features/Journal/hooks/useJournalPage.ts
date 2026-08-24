// useJournalPage — all state for Journal listing page
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

import type { JournalListItem } from "../types";
export function useJournalPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterMood, setFilterMood] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("journal", "get-all", { page: p, size: 12, search: search || undefined, tag: filterTag !== "all" ? filterTag : undefined, mood: filterMood !== "all" ? filterMood : undefined, sortBy });
      if (res?.returnCode === 200 && res?.returnData) { setEntries(res.returnData.content || []); setTotal(res.returnData.totalElements || 0); }
    } catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [search, filterTag, filterMood, sortBy, toast]);
  useEffect(() => { load(page); }, [page, load]);
  const handleDelete = useCallback(async (id: string) => {
      const res = await sendPostRequest("journal", "delete", { id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); load(page); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  }, [load, page, toast]);
  return { t, isRtl, navigate, entries, loading, page, setPage, total, search, setSearch, filterTag, setFilterTag, filterMood, setFilterMood, sortBy, setSortBy, handleDelete };
}

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface JournalModerationEntry {
  id: number; title: string; content: string; username: string;
  isPublic: boolean; isPublished: boolean; flags: number;
  createdAt: string; updatedAt: string;
}
export const FILTERS = [
  { label: "All", value: "all" },
  { label: "Public", value: "public" },
  { label: "Flagged", value: "flagged" },
  { label: "Unpublished", value: "unpublished" },
];
export function useAdminJournalModerationPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalModerationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewEntry, setViewEntry] = useState<JournalModerationEntry | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const fetchEntries = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await sendPostRequest("journal", "get-all", { search, filter, page: 0, size: 50 });
      if (res.data?.returnCode === 200) {
        setEntries(res.data.returnData?.content || []);
      } else {
        toast({ title: "Error", description: "Failed to load journal entries", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to load journal entries", variant: "destructive" });
    } finally { setLoading(false); setRefreshing(false); }
  }, [search, filter, toast]);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  const togglePublication = useCallback(async (entryId: number, published: boolean) => {
    setActionLoading(entryId);
      const res = await sendPostRequest("journal", "set-publication", { entryId, isPublished: published });
        setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, isPublished: published } : e));
        toast({ title: published ? "Published" : "Unpublished", description: `Journal entry ${published ? "published" : "unpublished"} successfully` });
      } else { throw new Error(res.data?.returnMessage || "Failed"); }
      toast({ title: "Error", description: "Failed to update publication status", variant: "destructive" });
    } finally { setActionLoading(null); }
  }, [toast]);
  const filteredEntries = entries.filter((entry) => {
    if (filter === "public") return entry.isPublic && entry.isPublished;
    if (filter === "flagged") return entry.flags > 0;
    if (filter === "unpublished") return !entry.isPublished;
    return true;
  });
  return {
    entries, loading, refreshing, search, setSearch, filter, setFilter,
    viewEntry, setViewEntry, actionLoading, fetchEntries, togglePublication, filteredEntries,
  };

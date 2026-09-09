// useAdminJournalModeration — list + toggle + delete for journal entries
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useNavigate } from "react-router-dom";

export interface JournalModerationEntry {
  id: number;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  category?: string;
  isPublished: boolean;
  userId: string;
  createdOn: string;
}

export function useAdminJournalModeration() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<JournalModerationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const [deleteTarget, setDeleteTarget] = useState<JournalModerationEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadEntries = useCallback(
    async (pageNum: number, q: string, append = false) => {
      if (append) {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else setLoading(true);
      try {
        const res = await sendPostRequest("journal", "admin/get-all", {
          page: pageNum + 1,
          pageSize: 20,
          search: q || undefined,
        });
        const data = res?.returnData;
        const items: JournalModerationEntry[] =
          data?.entries || data?.content || data || [];
        setEntries((previous) => (append ? [...previous, ...items] : items));
        const total = data?.totalCount ?? items.length;
        setTotalCount(total);
        const apiPage = data?.page ?? pageNum + 1;
        setHasMore(data?.hasNext ?? apiPage < Math.ceil(total / 20));
        setPage(pageNum);
      } catch {
        toast({ title: "Failed to load entries", variant: "destructive" });
      } finally {
        setLoading(false);
        if (append) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        }
      }
    },
    [toast],
  );

  useEffect(() => {
    loadEntries(0, search);
  }, []);

  const handleSearch = useCallback(() => {
    loadEntries(0, search);
  }, [search, loadEntries]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMoreRef.current) return;
    void loadEntries(page + 1, search, true);
  }, [hasMore, loadEntries, page, search]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "0px 0px 320px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const handleTogglePublication = useCallback(
    async (entry: JournalModerationEntry) => {
      setActionLoading(entry.id);
      try {
        const res = await sendPostRequest("journal", "admin/set-publication", {
          id: entry.id,
          isPublished: !entry.isPublished,
        });
        if (res.returnCode === 200) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id ? { ...e, isPublished: !e.isPublished } : e,
            ),
          );
          toast({
            title: entry.isPublished ? "Made private" : "Made public",
          });
        }
      } catch {
        toast({ title: "Failed to update", variant: "destructive" });
      } finally {
        setActionLoading(null);
      }
    },
    [toast],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "admin/delete", {
        id: deleteTarget.id,
      });
      if (res.returnCode === 200) {
        setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        toast({ title: "Deleted" });
        setDeleteTarget(null);
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, toast]);

  const goBack = useCallback(() => navigate(-1), [navigate]);
  const viewEntry = useCallback((entry: JournalModerationEntry) => {
    navigate(`/admin/journal-moderation/${entry.id}`);
  }, [navigate]);
  const requestDelete = useCallback((entry: JournalModerationEntry) => {
    setDeleteTarget(entry);
  }, []);
  const handleDeleteDialogChange = useCallback((open: boolean) => {
    if (!open) setDeleteTarget(null);
  }, []);

  return { data: {
    entries,
    loading,
    loadingMore,
    search,
    setSearch,
    totalCount,
    hasMore,
    sentinelRef,
    deleteTarget,
    deleting,
    actionLoading,
    handleSearch,
    handleTogglePublication,
    handleDelete,
    goBack,
    viewEntry,
    requestDelete,
  }, actions: {
    setSearch, handleSearch, handleTogglePublication, handleDelete, goBack, viewEntry,
    requestDelete, handleDeleteDialogChange,
  } };
}

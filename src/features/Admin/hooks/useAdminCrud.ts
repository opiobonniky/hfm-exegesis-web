// useAdminCrud — shared hook for admin listing pages (fetch, search, CRUD + infinite scroll)
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

interface UseAdminCrudOpts<T> {
  /** API route: "bible" | "admin" | "book-prologues" etc */
  route: string;
  /** API action: "get-all-verses-explanation" etc */
  listAction: string;
  saveAction: string;
  deleteAction: string;
  /** Transform API response items to T[] */
  mapItems?: (data: any) => T[];
}

export function useAdminCrud<T extends { id: number }>(opts: UseAdminCrudOpts<T>) {
  const { toast } = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(
    async (pageNum: number, q: string, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await sendPostRequest(opts.route, opts.listAction, {
          page: pageNum,
          size: 20,
          search: q || undefined,
        });
        const data = res?.returnData || res?.data;
        const raw = Array.isArray(data)
          ? data
          : data?.content || data?.users || [];
        const mapped: T[] = opts.mapItems ? raw.map(opts.mapItems) : raw;
        const hasNext = data?.hasNext ?? mapped.length === 20;
        setItems((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore(hasNext);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [opts.route, opts.listAction, opts.mapItems, toast],
  );

  useEffect(() => {
    fetchItems(0, search);
    setPage(0);
  }, []);

  const refresh = useCallback(() => {
    setPage(0);
    fetchItems(0, search);
  }, [search, fetchItems]);

  const loadMore = useCallback(() => {
    const np = page + 1;
    setPage(np);
    fetchItems(np, search, true);
  }, [page, search, fetchItems]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchItems(nextPage, search, true);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, search, fetchItems]);

  const save = useCallback(
    async (data: any, itemId?: number) => {
      setSaving(true);
      try {
        const payload = itemId ? { id: itemId, ...data } : data;
        const res = await sendPostRequest(opts.route, opts.saveAction, payload);
        if (res?.returnCode === 200 || res?.status === 200) {
          toast({
            title: "Success",
            description: itemId ? "Updated successfully" : "Created successfully",
          });
          refresh();
          return true;
        }
        throw new Error(
          res?.returnMessage || res?.message || "Failed to save",
        );
      } catch (e: any) {
        toast({
          title: "Error",
          description: e.message || "Failed to save",
          variant: "destructive",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [opts.route, opts.saveAction, refresh, toast],
  );

  const remove = useCallback(
    async (itemId: number) => {
      setDeleting(itemId);
      try {
        const res = await sendPostRequest(opts.route, opts.deleteAction, {
          id: itemId,
        });
        if (res?.returnCode === 200 || res?.status === 200) {
          toast({ title: "Success", description: "Deleted successfully" });
          refresh();
          return true;
        }
        throw new Error(res?.returnMessage || "Failed to delete");
      } catch (e: any) {
        toast({
          title: "Error",
          description: e.message || "Failed to delete",
          variant: "destructive",
        });
        return false;
      } finally {
        setDeleting(null);
      }
    },
    [opts.route, opts.deleteAction, refresh, toast],
  );

  return {
    items,
    loading,
    loadingMore,
    search,
    setSearch,
    hasMore,
    saving,
    deleting,
    sentinelRef,
    refresh,
    loadMore,
    save,
    remove,
  };
}

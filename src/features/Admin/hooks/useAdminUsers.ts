// useAdminUsers — list + infinite scroll + search + toggle actions for admin users
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import type { AdminUser } from "../types";
import { USERS_PAGE_SIZE, USER_SEARCH_DEBOUNCE_MS } from "../constants";

export function useAdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const loadUsers = useCallback(
    async (pageNum: number, q: string, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await sendPostRequest("admin", "get-users-by-admin", {
          page: pageNum + 1,
          pageSize: USERS_PAGE_SIZE,
          search: q || undefined,
        });
        const data = res?.returnData;
        const items: AdminUser[] = data?.users || data?.content || data || [];
        setUsers((prev) => (append ? [...prev, ...items] : items));
        const total = data?.totalCount ?? 0;
        const totalPages = data?.totalPages ?? Math.ceil(total / USERS_PAGE_SIZE);
        setTotalCount(total);
        setHasMore(pageNum + 1 < totalPages);
      } catch {
        toast({ title: "Failed to load users", variant: "destructive" });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast],
  );

  // Initial load
  useEffect(() => {
    loadUsers(0, searchDebounced);
  }, [searchDebounced]);

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setPage(0);
      setSearchDebounced(search);
    }, USER_SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadUsers(nextPage, searchDebounced, true);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, searchDebounced, loadUsers]);

  const handleToggleStatus = useCallback(
    async (user: AdminUser) => {
      setActionLoading(user.id);
      try {
        const newStatus = !user.status;
        const res = await sendPostRequest("admin", "toggle-user-status", {
          username: user.username,
          status: newStatus,
        });
        if (res.returnCode === 200) {
          setUsers((prev) =>
            prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
          );
          toast({ title: newStatus ? "User activated" : "User deactivated" });
        }
      } catch {
        toast({ title: "Failed to update status", variant: "destructive" });
      } finally {
        setActionLoading(null);
      }
    },
    [toast],
  );

  const handleToggleVerification = useCallback(
    async (user: AdminUser) => {
      setActionLoading(user.id);
      try {
        const newVerified = !user.emailVerified;
        const res = await sendPostRequest("admin", "toggle-user-verification", {
          username: user.username,
          isVerified: newVerified,
        });
        if (res.returnCode === 200) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, emailVerified: newVerified } : u,
            ),
          );
          toast({ title: newVerified ? "User verified" : "Verification removed" });
        }
      } catch {
        toast({ title: "Failed to update verification", variant: "destructive" });
      } finally {
        setActionLoading(null);
      }
    },
    [toast],
  );

  return {
    users,
    loading,
    loadingMore,
    search,
    setSearch,
    hasMore,
    totalCount,
    actionLoading,
    sentinelRef,
    handleToggleStatus,
    handleToggleVerification,
  };
}

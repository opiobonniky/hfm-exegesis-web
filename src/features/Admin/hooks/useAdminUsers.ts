// useAdminUsers — list + infinite scroll + search + toggle actions for admin users
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/adminApi";
import type { AdminUser } from "../types";
import { USERS_PAGE_SIZE, USER_SEARCH_DEBOUNCE_MS, USER_ROLE_MAP } from "../constants";

export function useAdminUsers() {
  const navigate = useNavigate();
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
        const res = await adminApi.request("admin", "get-users-by-admin", {
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
        const res = await adminApi.request("admin", "toggle-user-status", {
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
        const res = await adminApi.request("admin", "toggle-user-verification", {
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

  const handleUpdateRole = useCallback(
    async (user: AdminUser, newRole: number) => {
      if (newRole === user.userRole) return;
      setActionLoading(user.id);
      // Optimistic update — revert on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, userRole: newRole } : u)),
      );
      try {
        const res = await adminApi.request("admin", "update-user", {
          username: user.username,
          roleId: newRole,
        });
        if (res.returnCode === 200) {
          toast({
            title: `Role updated`,
            description: `${user.firstName || user.username} is now ${USER_ROLE_MAP[newRole]?.label ?? "a user"}.`,
          });
        } else {
          throw new Error(res.message || "Update failed");
        }
      } catch {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, userRole: user.userRole } : u)),
        );
        toast({ title: "Failed to update role", variant: "destructive" });
      } finally {
        setActionLoading(null);
      }
    },
    [toast],
  );

  // Permanently delete a user and ALL their data (activity, journal,
  // highlights, notes, favorites, reading history, quiz answers, plan
  // progress, verifications, messages, daily verses). Backend enforces
  // self-deletion and existence checks.
  const handleDeleteUser = useCallback(
    async (user: AdminUser) => {
      setActionLoading(user.id);
      try {
        const res = await adminApi.request("admin", "delete-user", {
          username: user.username,
        });
        if (res.returnCode === 200) {
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          setTotalCount((prev) => Math.max(0, prev - 1));
          toast({
            title: "User deleted",
            description: `${user.firstName || user.username} and all associated data were permanently removed.`,
          });
        } else {
          toast({
            title: res.returnMessage || "Failed to delete user",
            variant: "destructive",
          });
        }
      } catch {
        toast({ title: "Failed to delete user", variant: "destructive" });
      } finally {
        setActionLoading(null);
      }
    },
    [toast],
  );

  const refresh = useCallback(() => {
    setPage(0);
    loadUsers(0, searchDebounced);
  }, [loadUsers, searchDebounced]);

  const goBack = useCallback(() => navigate(-1), [navigate]);
  const openCreateUser = useCallback(() => navigate("/admin/users/create"), [navigate]);
  const viewUser = useCallback((user: AdminUser) => navigate(`/admin/users/${user.id}`), [navigate]);

  return { data: {
    users,
    loading,
    loadingMore,
    search,
    hasMore,
    totalCount,
    actionLoading,
    sentinelRef,
    goBack,
    openCreateUser,
  }, actions: {
    setSearch, handleToggleStatus, handleToggleVerification, handleUpdateRole, handleDeleteUser, refresh, goBack, openCreateUser, viewUser,
  } };
}

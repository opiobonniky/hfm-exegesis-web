// useAdminActivityLog — all state, effects, and logic for AdminActivityLog page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { ACTIVITY_PAGE_SIZE } from "../constants";
import type { ActivitySession, ActivitySummary } from "../types";

export function useAdminActivityLog() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const loadActivity = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const params: any = { page: pg, pageSize: ACTIVITY_PAGE_SIZE };
      if (searchUsername) params.username = searchUsername;
      if (deviceFilter !== "all") params.deviceType = deviceFilter;
      if (statusFilter !== "all") params.success = statusFilter === "success";
      const res = await sendPostRequest("admin", "get-sessions", params);
      if (res?.returnCode === 200 && res?.returnData) {
        setSessions(res.returnData.sessions || []);
        setTotal(res.returnData.total || 0);
        setTotalPages(res.returnData.totalPages || 1);
        setSummary(res.returnData.summary || null);
      }
    } catch { toast({ title: "Failed to load activity", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [searchUsername, deviceFilter, statusFilter, toast]);
  useEffect(() => { loadActivity(page); }, [page, loadActivity]);
  const handleSearch = useCallback(() => { setPage(1); }, []);
  const handleClearFilters = useCallback(() => { setSearchUsername(""); setDeviceFilter("all"); setStatusFilter("all"); setPage(1); }, []);
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("admin", "delete-session", { id: deleteTarget });
      if (res?.returnCode === 200) { toast({ title: "Session deleted" }); setDeleteTarget(null); loadActivity(page); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setDeleting(false); }
  }, [deleteTarget, toast, loadActivity, page]);
  return {
    sessions, summary, total, page, setPage, totalPages, loading,
    searchUsername, setSearchUsername, deviceFilter, setDeviceFilter,
    statusFilter, setStatusFilter, filtersOpen, setFiltersOpen,
    deleteTarget, setDeleteTarget, deleting,
    handleSearch, handleClearFilters, handleDelete,
  };
}

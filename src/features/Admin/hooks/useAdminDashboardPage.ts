import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../services/adminApi";
import { useAdminErrorHandler } from "./useAdminErrorHandler";

export function useAdminDashboardPage() {
  const { actions: { handleError } } = useAdminErrorHandler();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.request("admin", "get-admin-dashboard-stats", {});
      if (res.returnCode === 200) setStats(res.returnData);
    } catch (e) { handleError(e, "load dashboard stats"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return { data: { stats, loading }, actions: { loadStats } };
}

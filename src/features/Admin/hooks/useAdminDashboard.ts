// Admin useAdminDashboard — useAdminDashboard state and API logic
import { useState, useCallback } from "react";
import { homeApi } from "../../Home/services/homeApi";
import { useAdminErrorHandler } from "./useAdminErrorHandler";

export function useAdminDashboard() {
  const { handleError } = useAdminErrorHandler();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await homeApi.getDashboardStats();
      if (res.returnCode === 200) setStats(res.returnData);
    } catch (e) { handleError(e, "load dashboard stats"); }
    finally { setLoading(false); }
  }, [handleError]);

  return { stats, loading, fetchStats };
}

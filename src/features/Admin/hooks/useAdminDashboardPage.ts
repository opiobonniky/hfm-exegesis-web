import { useState, useEffect, useCallback } from "react";
import { sendPostRequest } from "@/services/api";
import { useAdminErrorHandler } from "./useAdminErrorHandler";

export function useAdminDashboardPage() {
  const { handleError } = useAdminErrorHandler();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("admin", "get-admin-dashboard-stats", {});
      if (res.returnCode === 200) setStats(res.returnData);
    } catch (e) { handleError(e, "load dashboard stats"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return { stats, loading, loadStats };
}

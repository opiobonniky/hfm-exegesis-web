import { useState, useEffect, useCallback } from "react";
import { sendPostRequest } from "@/services/api";

export function useAdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("admin", "dashboard-stats", {});
      if (res.returnCode === 200) setStats(res.returnData);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  return { stats, loading, loadStats };
}

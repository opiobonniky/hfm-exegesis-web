// Admin useAdminDashboard — useAdminDashboard state and API logic
import { useState, useCallback } from "react";
import { homeApi } from "../../Home/services/homeApi";

export function useAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await homeApi.getDashboardStats();
      if (res.returnCode === 200) setStats(res.returnData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  return { stats, loading, fetchStats };
}

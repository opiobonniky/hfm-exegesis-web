// Subscription useSubscriptionTiers — useSubscriptionTiers state and API logic
import { useState, useCallback } from "react";
import { subscriptionApi } from "../services/subscriptionApi";

export function useSubscriptionTiers() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionApi.getTiers();
      if (res.returnCode === 200) setTiers(res.returnData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  const fetchUsers = useCallback(async (tier?: string) => {
      const res = await subscriptionApi.getUsers(0, 50, tier);
      if (res.returnCode === 200) setUsers(res.returnData?.content || []);
  return { tiers, users, loading, fetchTiers, fetchUsers };
}

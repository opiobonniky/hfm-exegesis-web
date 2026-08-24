// useUserPlans — all state for UserPlans page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export function useUserPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("reading-plans", "get-user-plans", { search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
      if (res?.returnCode === 200) setPlans(res.returnData || []);
    } catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [search, statusFilter, toast]);

  useEffect(() => { load(); }, [load]);

  return { plans, loading, search, setSearch, statusFilter, setStatusFilter, refresh: load };
}

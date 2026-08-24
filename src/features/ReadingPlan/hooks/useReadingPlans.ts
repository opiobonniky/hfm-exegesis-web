// useReadingPlans — all state for ReadingPlans listing page
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

import type { ReadingPlanListItem } from "../types";
export function useReadingPlans() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<ReadingPlanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("reading-plans", "get-all", { page: p, size: 12, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
      if (res?.returnCode === 200 && res?.returnData) { setPlans(res.returnData.content || []); setTotal(res.returnData.totalElements || 0); }
    } catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [search, statusFilter, toast]);
  useEffect(() => { load(page); }, [page, load]);
  return { t, isRtl, navigate, plans, loading, page, setPage, total, search, setSearch, statusFilter, setStatusFilter };
}

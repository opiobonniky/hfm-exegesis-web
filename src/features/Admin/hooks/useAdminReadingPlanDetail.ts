// useAdminReadingPlanDetail — fetch a single reading plan for admin
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/adminApi";
import type { ReadingPlanAdminDetail } from "../types";

export function useAdminReadingPlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<ReadingPlanAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId) return;
    setLoading(true);
    adminApi.request("reading-plans", "plan-detail", {
      planId: decodeURIComponent(planId),
    })
      .then((res) => {
        if (res?.returnCode === 200 && res.returnData) {
          setItem(res.returnData);
        } else {
          toast({ title: "Not found", variant: "destructive" });
          navigate("/admin/reading-plans");
        }
      })
      .catch(() => {
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/reading-plans");
      })
      .finally(() => setLoading(false));
  }, [planId, toast, navigate]);

  return { data: { item, loading }, actions: { navigate } };
}

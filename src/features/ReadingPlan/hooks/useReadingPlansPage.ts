import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export interface ReadingPlanItem {
  planId: string; title: string; description: string; totalDays?: number; total_days?: number;
  isActive?: boolean; is_active?: boolean; category?: string; planImage?: string;
  started?: boolean; completed?: boolean; progress?: number; streak?: number;
}

export function useReadingPlansPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;
  const [plans, setPlans] = useState<ReadingPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ReadingPlanItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<ReadingPlanItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReadingPlanItem>>({});
  const [saving, setSaving] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("reading-plans", "get-all", {});
      const plansData = res.returnData?.plans ?? res.returnData;
      if (res.returnCode === 200 && Array.isArray(plansData)) {
        setPlans((plansData as any[]).map((p) => ({
          ...p, started: p.started ?? false, completed: p.completed ?? false,
          progress: p.progress ?? 0, streak: p.streak ?? 0,
        })));
        const rd = res.returnData;
        if (rd.totalPages) setTotalPages(rd.totalPages);
        if (rd.hasNext !== undefined) setHasNext(rd.hasNext);
        if (rd.hasPrevious !== undefined) setHasPrevious(rd.hasPrevious);
      } else {
        toast({ title: t.readingPlan?.toastFailedLoad || "Failed to load", description: res.returnMessage, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: t.readingPlan?.toastNetworkError || "Network error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.title) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("reading-plans", "delete", { planId: deleteTarget.planId });
      if (res.returnCode === 200) {
        toast({ title: t.readingPlan?.toastPlanDeleted || "Deleted", description: t.readingPlan?.toastPlanDeletedDesc || "Plan deleted" });
        setDeleteTarget(null);
        setDeleteConfirmText("");
        await loadPlans();
      } else {
        toast({ title: t.readingPlan?.toastFailedLoad || "Failed to delete", description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || "Error", description: "Failed to delete plan", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, deleteConfirmText, toast, t, loadPlans]);

  const handleEditSave = useCallback(async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await sendPostRequest("reading-plans", "update", { planId: editTarget.planId, ...editForm });
      if (res.returnCode === 200) {
        toast({ title: t.readingPlan?.toastPlanUpdated || "Updated", description: t.readingPlan?.toastPlanUpdatedDesc || "Plan updated" });
        setEditTarget(null);
        setEditForm({});
        await loadPlans();
      } else {
        toast({ title: t.readingPlan?.toastUpdateFailed || "Failed to update", description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: t.common?.error || "Error", description: "Failed to update plan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [editTarget, editForm, toast, t, loadPlans]);

  return {
    plans, loading, search, setSearch, catFilter, setCatFilter,
    page, setPage, totalPages, hasNext, hasPrevious,
    deleteTarget, setDeleteTarget, deleteConfirmText, setDeleteConfirmText, deleting, handleDelete,
    editTarget, setEditTarget, editForm, setEditForm, saving, handleEditSave,
    isAdmin, navigate, t, isRtl, loadPlans,
  };
}

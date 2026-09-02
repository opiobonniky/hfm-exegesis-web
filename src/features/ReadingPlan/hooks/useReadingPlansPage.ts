import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { useReadingPlanApi } from "../services";
import type { ReadingPlanListItem, ReadingPlansResponse } from "../types";

export interface ReadingPlanItem extends ReadingPlanListItem {}

export function useReadingPlansPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;
  const api = useReadingPlanApi();

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
      const res = await api.getAllPlans({ page, pageSize: 10 });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData;
        const plansData = rd.plans ?? (rd as unknown as ReadingPlanListItem[]);
        if (Array.isArray(plansData)) {
          setPlans(plansData.map((p) => ({
            ...p,
            started: p.started ?? false,
            completed: p.completed ?? p.userIsCompleted ?? false,
            progress: p.progress ?? 0,
            streak: p.streak ?? p.userStreak ?? 0,
          })));
        }
        if (rd.totalPages) {
          setTotalPages(rd.totalPages);
          setHasNext(page < rd.totalPages);
          setHasPrevious(page > 1);
        }
      } else {
        toast({ title: t.readingPlan?.toastFailedLoad || "Failed to load", description: res.returnMessage, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: t.readingPlan?.toastNetworkError || "Network error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, t, api, page]);

  const pageTitle = useMemo(() => t.readingPlan?.readingPlans || "Reading Plans", [t]);
  const pageSubtitle = useMemo(() => t.readingPlan?.buildHabit || "Build a daily Bible habit", [t]);
  const createPlanLabel = useMemo(() => t.readingPlan?.createPlan || "Create Plan", [t]);
  const noPlansTitle = useMemo(() => t.readingPlan?.noPlansYet || "No plans yet", [t]);
  const noPlansDesc = useMemo(() => t.readingPlan?.noPlansDesc || "Create your first reading plan to get started.", [t]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.title) return;
    setDeleting(true);
    try {
      const res = await api.deletePlan(deleteTarget.planId);
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
  }, [deleteTarget, deleteConfirmText, toast, t, loadPlans, api]);

  const handleEditSave = useCallback(async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await api.updatePlan(editTarget.planId, editForm);
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
  }, [editTarget, editForm, toast, t, loadPlans, api]);

  return {
    data: {
      plans,
      loading,
      search,
      catFilter,
      page,
      totalPages,
      hasNext,
      hasPrevious,
      deleteTarget,
      deleteConfirmText,
      deleting,
      editTarget,
      editForm,
      saving,
      pageTitle,
      pageSubtitle,
      createPlanLabel,
      noPlansTitle,
      noPlansDesc,
      isAdmin,
      navigate,
      t,
      isRtl,
    },
    actions: {
      setSearch,
      setCatFilter,
      setPage,
      setDeleteTarget,
      setDeleteConfirmText,
      setEditTarget,
      setEditForm,
      handleDelete,
      handleEditSave,
      loadPlans,
    },
  };
}

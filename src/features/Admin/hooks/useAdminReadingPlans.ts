// useAdminReadingPlans — list + CRUD for reading plans
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface ReadingPlan {
  planId: string;
  id: number;
  title: string;
  description: string;
  category: string;
  durationDays: number;
  isPublished: boolean;
  createdOn: string;
}

export interface ReadingPlanForm {
  title: string;
  description: string;
  category: string;
  durationDays: string;
  isPublished: boolean;
}

const EMPTY_FORM: ReadingPlanForm = {
  title: "",
  description: "",
  category: "",
  durationDays: "7",
  isPublished: true,
};

export function useAdminReadingPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [editPlan, setEditPlan] = useState<ReadingPlan | null>(null);
  const [editForm, setEditForm] = useState<ReadingPlanForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deletePlan, setDeletePlan] = useState<ReadingPlan | null>(null);
  const [deleting, setDeleting] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPlans = useCallback(
    async (pageNum: number, q: string, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await sendPostRequest("reading-plans", "get-all", {
          page: pageNum,
          size: 20,
          search: q || undefined,
        });
        const data = res?.returnData;
        const items: ReadingPlan[] = data?.plans || data?.content || data || [];
        setPlans((prev) => (append ? [...prev, ...items] : items));
        const total = data?.totalCount ?? items.length;
        setTotalCount(total);
        setHasMore(items.length === 20);
      } catch {
        toast({ title: "Failed to load plans", variant: "destructive" });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    loadPlans(0, search);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadPlans(nextPage, search, true);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, search, loadPlans]);

  const handleSearch = useCallback(() => {
    setPage(0);
    loadPlans(0, search);
  }, [search, loadPlans]);

  const openEdit = useCallback((plan?: ReadingPlan) => {
    if (plan) {
      setEditPlan(plan);
      setEditForm({
        title: plan.title,
        description: plan.description || "",
        category: plan.category || "",
        durationDays: String(plan.durationDays || 7),
        isPublished: plan.isPublished ?? true,
      });
    } else {
      setEditPlan(null);
      setEditForm(EMPTY_FORM);
    }
  }, []);

  const closeEdit = useCallback(() => {
    setEditPlan(null);
    setEditForm(EMPTY_FORM);
  }, []);

  const updateFormField = useCallback(
    (field: keyof ReadingPlanForm, value: string | boolean) => {
      setEditForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        durationDays: parseInt(editForm.durationDays) || 7,
        ...(editPlan ? { id: editPlan.id } : {}),
      };
      const res = await sendPostRequest(
        "reading-plans",
        editPlan ? "update" : "create",
        payload,
      );
      if (res.returnCode === 200) {
        toast({ title: editPlan ? "Updated" : "Created" });
        closeEdit();
        loadPlans(0, search);
      }
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [editForm, editPlan, toast, closeEdit, loadPlans, search]);

  const handleDelete = useCallback(async () => {
    if (!deletePlan) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("reading-plans", "delete", {
        id: deletePlan.id,
      });
      if (res.returnCode === 200) {
        setPlans((prev) => prev.filter((p) => p.id !== deletePlan.id));
        toast({ title: "Deleted" });
        setDeletePlan(null);
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }, [deletePlan, toast]);

  const loadMore = useCallback(() => {
    const np = page + 1;
    setPage(np);
    loadPlans(np, search, true);
  }, [page, search, loadPlans]);

  return {
    plans,
    loading,
    loadingMore,
    search,
    setSearch,
    hasMore,
    totalCount,
    sentinelRef,
    editPlan,
    editForm,
    saving,
    deletePlan,
    setDeletePlan,
    deleting,
    handleSearch,
    openEdit,
    closeEdit,
    updateFormField,
    handleSave,
    handleDelete,
    loadMore,
      items: undefined
  };
}

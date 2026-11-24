// useJournalEntryAdminDetail — fetch a single journal entry for admin
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/adminApi";
import type { JournalAdminDetail } from "../types";
import type { JournalEntryDetailLocationState } from "../utils";
import { tt } from '@/components/languages/hardcodedTranslate';

export function useJournalEntryAdminDetail() {
  // The id is handed over in router state; the URL stays at
  // /admin/journal-moderation/detail for every entry.
  const location = useLocation();
  const locationState = (location.state || null) as Partial<JournalEntryDetailLocationState> | null;
  const rawId = locationState?.id;
  const entryId = rawId == null || rawId === "" ? null : String(rawId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<JournalAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!entryId) {
      toast({ title: tt("Not found"), variant: "destructive" });
      navigate("/admin/journal-moderation", { replace: true });
      return;
    }
    let active = true;
    setLoading(true);
    adminApi.request("journal", "admin/get", { id: Number(entryId) })
      .then((res) => {
        if (!active) return;
        if (res?.returnCode === 200 && res.returnData) {
          setItem(res.returnData);
        } else {
          toast({ title: tt("Not found"), variant: "destructive" });
          navigate("/admin/journal-moderation");
        }
      })
      .catch(() => {
        if (!active) return;
        toast({ title: tt("Failed to load"), variant: "destructive" });
        navigate("/admin/journal-moderation");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [entryId, toast, navigate]);

  const handleDelete = useCallback(async () => {
    if (!item) return;
    setDeleting(true);
    try {
      const res = await adminApi.request("journal", "admin/delete", { id: item.id });
      if (res.returnCode === 200) {
        toast({ title: tt("Deleted") });
        navigate("/admin/journal-moderation");
      }
    } catch {
      toast({ title: tt("Failed to delete"), variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }, [item, toast, navigate]);

  const handleTogglePublication = useCallback(async () => {
    if (!item) return;
    try {
      const res = await adminApi.request("journal", "admin/set-publication", {
        id: item.id,
        isPublished: !item.isPublished,
      });
      if (res.returnCode === 200) {
        setItem((prev) =>
          prev ? { ...prev, isPublished: !prev.isPublished } : prev,
        );
        toast({
          title: item.isPublished ? "Made private" : "Made public",
        });
      }
    } catch {
      toast({ title: tt("Failed to update"), variant: "destructive" });
    }
  }, [item, toast]);

  return { data: {
    item,
    loading,
    deleting,
    confirmDelete, setConfirmDelete,
    navigate,
    handleDelete,
  }, actions: { setConfirmDelete, handleDelete, handleTogglePublication, navigate } };
}

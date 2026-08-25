// useAdminDailyExegesis — all state, effects, and logic for AdminDailyExegesis page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import type { DailyExegesis } from "../types";

interface EditForm {
  title: string; bookName: string; chapter: string; verseStart: string; verseEnd: string;
  passageReference: string; introduction: string; contextSummary: string;
  teachingBody: string; application: string; prayer: string; tags: string;
  displayDate: string; isPublished: boolean;
}

const EMPTY_FORM: EditForm = {
  title: "", bookName: "", chapter: "", verseStart: "", verseEnd: "",
  passageReference: "", introduction: "", contextSummary: "",
  teachingBody: "", application: "", prayer: "", tags: "",
  displayDate: "", isPublished: true,
};

export function useAdminDailyExegesis() {
  const { toast } = useToast();
  const [items, setItems] = useState<DailyExegesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Edit dialog
  const [editItem, setEditItem] = useState<DailyExegesis | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<DailyExegesis | null>(null);

  const load = useCallback(async (p: number, append = false) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("admin", "get-all-daily-exegesis", {
        page: p, size: 20, search: search || undefined,
      });
      const data = res?.data?.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      const next = data?.hasNext ?? list.length === 20;
      setItems(prev => append ? [...prev, ...list] : list);
      setHasMore(next);
    } catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [search, toast]);

  useEffect(() => { load(0); setPage(0); }, []);

  const handleSearch = useCallback(() => { setPage(0); load(0); }, [load]);
  const handleLoadMore = useCallback(() => { const np = page + 1; setPage(np); load(np, true); }, [page, load]);
  const resetForm = useCallback(() => setEditForm(EMPTY_FORM), []);

  const openEdit = useCallback((item?: DailyExegesis) => {
    if (item) {
      setEditItem(item);
      const refMatch = item.passageReference?.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
      setEditForm({
        title: item.title, bookName: refMatch?.[1] || "", chapter: refMatch?.[2] || "",
        verseStart: refMatch?.[3] || "", verseEnd: refMatch?.[4] || "",
        passageReference: item.passageReference, introduction: item.introduction,
        contextSummary: item.contextSummary, teachingBody: item.teachingBody,
        application: item.application, prayer: item.prayer, tags: item.tags || "",
        displayDate: item.displayDate ? new Date(item.displayDate).toISOString().split("T")[0] : "",
        isPublished: item.isPublished,
      });
    } else {
      setEditItem(null); resetForm();
    }
    setDialogOpen(true);
  }, [resetForm]);

  const closeDialog = useCallback(() => { setEditItem(null); resetForm(); setDialogOpen(false); }, [resetForm]);

  const handleSave = useCallback(async () => {
    if (!editForm.title || !editForm.passageReference || !editForm.teachingBody) {
      toast({ title: "Validation Error", description: "Title, passage reference, and teaching body are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let passageRef = editForm.passageReference;
      if (editForm.bookName && editForm.chapter) {
        passageRef = `${editForm.bookName} ${editForm.chapter}`;
        if (editForm.verseStart) {
          passageRef += `:${editForm.verseStart}`;
          if (editForm.verseEnd && editForm.verseEnd !== editForm.verseStart) passageRef += `-${editForm.verseEnd}`;
        }
      }
      const payload = {
        ...(editItem ? { id: editItem.id } : {}),
        title: editForm.title, passageReference: passageRef,
        introduction: editForm.introduction, contextSummary: editForm.contextSummary,
        teachingBody: editForm.teachingBody, application: editForm.application,
        prayer: editForm.prayer, tags: editForm.tags || null,
        displayDate: editForm.displayDate || undefined, isPublished: editForm.isPublished,
      };
      const res = await sendPostRequest("admin", "add-daily-exegesis", payload);
      if (res?.data?.status === 200 || res?.data?.success) {
        toast({ title: editItem ? "Updated" : "Created" });
        closeDialog(); load(0); setPage(0);
      } else { throw new Error(res?.data?.returnMessage || "Failed"); }
    } catch (e) { toast({ title: "Error", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  }, [editForm, editItem, toast, closeDialog, load]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await sendPostRequest("admin", "delete-daily-exegesis", { id: deleteTarget.id });
      if (res?.returnCode === 200 || res?.data?.success) {
        toast({ title: "Deleted" }); setDeleteTarget(null); load(0); setPage(0);
      }
    } catch { toast({ title: "Delete failed", variant: "destructive" }); }
    finally { setDeletingId(null); }
  }, [deleteTarget, toast, load]);

  return {
    items, loading, page, setPage, hasMore, search, setSearch, saving, deletingId,
    editItem, editForm, setEditForm, dialogOpen, deleteTarget, setDeleteTarget,
    handleSearch, handleLoadMore, openEdit, closeDialog, handleSave, handleDelete,
  };
}

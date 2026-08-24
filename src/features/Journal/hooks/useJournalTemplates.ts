import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/languages/languageProvider";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

interface Template { id: string; name: string; description: string; prompts: string[]; category: string; isActive: boolean; }
export function useJournalTemplates() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", prompts: "", category: "general", isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      if (category !== "all") payload.category = category;
      const res = await sendPostRequest("journal", "templates/get-all", payload);
      if (res?.returnCode === 200 && res.returnData) setTemplates(res.returnData);
    } catch {} finally { setLoading(false); }
  }, [category]);
  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  const handleSave = useCallback(async () => {
    if (!formData.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
      const payload = { ...formData, prompts: formData.prompts.split("\n").filter(Boolean) };
      const res = await sendPostRequest("journal", "templates/create", payload);
      if (res?.returnCode === 200) { toast({ title: "Created" }); setDialogOpen(false); fetchTemplates(); }
      else { toast({ title: "Failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [formData, toast, fetchTemplates]);
  const handleDelete = useCallback(async () => {
    if (!deleteDialog) return;
    setDeleting(true);
      const res = await sendPostRequest("journal", "templates/delete", { id: deleteDialog.id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); setDeleteDialog(null); fetchTemplates(); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    finally { setDeleting(false); }
  }, [deleteDialog, toast, fetchTemplates]);
  return {
    t, isRtl, templates, loading, category, setCategory,
    dialogOpen, setDialogOpen, formData, setFormData, saving, handleSave,
    deleteDialog, setDeleteDialog, deleting, handleDelete, refresh: fetchTemplates,
  };
}

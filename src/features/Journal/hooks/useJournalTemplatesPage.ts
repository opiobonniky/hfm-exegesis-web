// useJournalTemplatesPage — all state, effects, and API logic for JournalTemplates page
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export interface JournalTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string;
  prompts: string[];
  isActive: boolean;
  isDefault: boolean;
}

export const CATEGORIES = [
  { value: "general", key: "categoryGeneral" },
  { value: "study", key: "categoryStudy" },
  { value: "prayer", key: "categoryPrayer" },
  { value: "gratitude", key: "categoryGratitude" },
  { value: "reflection", key: "categoryReflection" },
  { value: "application", key: "categoryApplication" },
];

export const getCatLabel = (t: any, v: string) => {
  const c = CATEGORIES.find((x) => x.value === v);
  return c ? (t.journal as any)?.[c.key] || v : v;
};

const EMPTY_FORM = { name: "", description: "", category: "general", prompts: [""] as string[], isActive: true };

export function useJournalTemplatesPage() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<JournalTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("journal", "templates/get-all", {});
      if (res.returnCode === 200 && res.returnData) setTemplates(res.returnData);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const handleSave = useCallback(async () => {
    if (!formData.name.trim() || formData.prompts.filter(p => p.trim()).length === 0) return;
    setSaving(true);
    try {
      const res = await sendPostRequest("journal", "templates/create", {
        ...formData, prompts: formData.prompts.filter(p => p.trim()),
      });
      if (res.returnCode === 200) { setDialogOpen(false); loadTemplates(); }
    } catch {} finally { setSaving(false); }
  }, [formData, loadTemplates]);

  const handleDelete = useCallback(async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      await sendPostRequest("journal", "templates/delete", { id: deleteDialog.id });
      setDeleteDialog(null); loadTemplates();
    } catch {} finally { setDeleting(false); }
  }, [deleteDialog, loadTemplates]);

  const openAddDialog = useCallback(() => {
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const saveDisabled = saving || !formData.name.trim() || formData.prompts.filter(p => p.trim()).length === 0;

  return {
    t, templates, loading, dialogOpen, setDialogOpen,
    deleteDialog, setDeleteDialog, deleting, saving,
    formData, setFormData, saveDisabled,
    handleSave, handleDelete, openAddDialog,
  };
}

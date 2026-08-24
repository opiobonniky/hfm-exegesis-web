import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface TriviaFormData {
  question: string; options: string[]; correctOptionIndex: number;
  explanation: string; category: string; difficulty: string; isActive: boolean;
}
export function useAdminAddTriviaQuestionPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(questionId);
  const [form, setForm] = useState<TriviaFormData>({
    question: "", options: ["", "", "", ""], correctOptionIndex: 0,
    explanation: "", category: "general", difficulty: "medium", isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const res = await sendPostRequest("trivia", "get-question", { questionId });
        if (res.returnCode === 200 && res.returnData) setForm(res.returnData);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, [questionId, isEditing]);
  const updateOption = useCallback((index: number, value: string) => {
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === index ? value : o)) }));
  }, []);
  const addOption = useCallback(() => { setForm((f) => ({ ...f, options: [...f.options, ""] })); }, []);
  const removeOption = useCallback((index: number) => { setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== index) })); }, []);
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await sendPostRequest("trivia", isEditing ? "update-question" : "create-question", form);
      if (res.returnCode === 200) {
        toast({ title: isEditing ? "Updated" : "Created" });
        navigate("/admin/trivia");
      } else { toast({ title: "Error", description: res.returnMessage, variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [form, isEditing, navigate, toast]);
  return { form, setForm, saving, loading, isEditing, updateOption, addOption, removeOption, handleSave, navigate };

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { tt } from '@/components/languages/hardcodedTranslate';

export interface ExtendedProfileData {
  middleName: string; alternativePhone: string; ministryGroup: string;
  servicePosition: string; spiritualGifts: string;
  emergencyContactName: string; emergencyContactPhone: string; emergencyContactRelationship: string;
}
const INITIAL_FORM: ExtendedProfileData = {
  middleName: "", alternativePhone: "", ministryGroup: "", servicePosition: "", spiritualGifts: "",
  emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "",
};
export function useExtendedProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ExtendedProfileData>(INITIAL_FORM);
  const fetchProfile = useCallback(async () => {
    try {
      const res = await sendPostRequest("user", "get-profile", {});
      if (res.data?.returnCode === 200) {
        const p = res.data.returnData;
        setForm({
          middleName: p.middleName || "", alternativePhone: p.alternativePhone || "",
          ministryGroup: p.ministryGroup || "", servicePosition: p.servicePosition || "",
          spiritualGifts: p.spiritualGifts || "", emergencyContactName: p.emergencyContactName || "",
          emergencyContactPhone: p.emergencyContactPhone || "", emergencyContactRelationship: p.emergencyContactRelationship || "",
        });
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await sendPostRequest("user", "update-extended-profile", form);
      if (res.returnCode === 200) {
        toast({ title: tt("Saved"), description: tt("Profile updated") });
        navigate(-1);
      } else {
        toast({ title: tt("Error"), description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: tt("Error"), variant: "destructive" });
    } finally { setSaving(false); }
  }, [form, navigate, toast]);
  const updateField = <K extends keyof ExtendedProfileData>(key: K, val: ExtendedProfileData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));
  const goBack = useCallback(() => navigate(-1), [navigate]);
  return { data: { loading, saving, form }, actions: { updateField, handleSave, goBack } };
}

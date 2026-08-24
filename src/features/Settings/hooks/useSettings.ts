// useSettings — all state for Settings page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";

export function useSettings() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("auth", "get-profile", {});
      if (res?.returnCode === 200 && res?.returnData) setProfile(res.returnData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadProfile(); }, [loadProfile]);
  const updateProfile = useCallback(async (data: any) => {
    setSaving(true);
      const res = await sendPostRequest("auth", "update-profile", data);
      if (res?.returnCode === 200) { toast({ title: "Profile updated" }); loadProfile(); }
      else { toast({ title: "Failed", description: res?.returnMessage, variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [toast, loadProfile]);
  const changePassword = useCallback(async (data: any) => {
      const res = await sendPostRequest("auth", "change-password", data);
      if (res?.returnCode === 200) toast({ title: "Password changed" });
      else toast({ title: "Failed", description: res?.returnMessage, variant: "destructive" });
  }, [toast]);
  return { t, isRtl, activeTab, setActiveTab, profile, loading, saving, updateProfile, changePassword };
}

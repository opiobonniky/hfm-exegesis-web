import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest, TOKEN_KEY } from "@/services/api";
import { useLanguage } from "@/components/languages/languageProvider";
import { useRTL } from "@/providers/RTLProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useTheme } from "@/hooks/useTheme";
import { routes } from "@/components/Routes/routes";
import { INITIAL_PROFILE, NOTIFICATION_KEYS } from "../constants";

export function useSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isRtl } = useRTL();
  const { isPayingUser, tierLabel, expiresLabel } = useSubscription();
  const { themeMode, setThemeMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sowerPortalLoading, setSowerPortalLoading] = useState(false);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    const n: Record<string, boolean> = {};
    NOTIFICATION_KEYS.forEach(k => { n[k] = localStorage.getItem(`notify_${k.replace("Reminder", "").replace("Notifications", "").toLowerCase()}`) !== "false"; });
    return n;
  });
  const [readingFontSize, setReadingFontSize] = useState(() => parseInt(localStorage.getItem("reading_font_size") || "18", 10));
  const [preferredTranslation, setPreferredTranslation] = useState(() => localStorage.getItem("preferred_translation") || "BSB");
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) { navigate("/login"); return; }
    (async () => {
      try {
        const res = await sendPostRequest("auth", "get-current-user", {});
        if (res.returnCode === 200 && res.returnData) {
          const d = res.returnData;
          setProfile({ ...INITIAL_PROFILE, id: d.id, username: d.username || "", email: d.email || "",
            firstName: d.firstName || "", lastName: d.lastName || "", middleName: d.middleName || "",
            phoneNumber: d.phoneNumber || "", dateOfBirth: d.dateOfBirth ? String(d.dateOfBirth).split("T")[0] : "",
            gender: d.gender || "", maritalStatus: d.maritalStatus || "", alternativePhone: d.alternativePhone || "",
            ministryGroup: d.ministryGroup || "", servicePosition: d.servicePosition || "", spiritualGifts: d.spiritualGifts || "",
            emergencyContactName: d.emergencyContactName || "", emergencyContactPhone: d.emergencyContactPhone || "",
            emergencyContactRelationship: d.emergencyContactRelationship || "",
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [navigate]);
  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    try {
      const res = await sendPostRequest("auth", "update-current-user", profile);
      if (res.returnCode === 200) toast({ title: t.settings?.profileUpdated || "Profile updated" });
      else toast({ title: res.returnMessage || "Failed", variant: "destructive" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSavingProfile(false); }
  }, [profile, toast, t]);
  const handlePasswordChange = useCallback(async (currentPassword: string, newPassword: string) => {
    setSavingPassword(true);
    try {
      const res = await sendPostRequest("auth", "update-password", { currentPassword, newPassword });
      if (res.returnCode === 200) toast({ title: t.settings?.passwordUpdated || "Password updated" });
    } catch (e: any) { toast({ title: e?.response?.data?.returnMessage || "Error", variant: "destructive" }); }
    finally { setSavingPassword(false); }
  }, [toast, t]);
  const handleNotificationChange = useCallback((key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    const storageKey = key.replace("Reminder", "").replace("Notifications", "").toLowerCase();
    localStorage.setItem(`notify_${storageKey}`, String(value));
    toast({ title: "Notification", description: value ? "Enabled" : "Disabled" });
  }, [toast]);
  const handleSowerAction = useCallback(async () => {
    if (isPayingUser) {
      setSowerPortalLoading(true);
      try {
        const res = await sendPostRequest("subscriptions", "create-portal-session", {});
        if (res.returnCode === 200 && res.returnData?.url) window.open(res.returnData.url, "_blank");
        else toast({ title: "Portal error", description: res.returnMessage, variant: "destructive" });
      } catch (err: any) { toast({ title: "Error", description: err?.message, variant: "destructive" }); }
      finally { setSowerPortalLoading(false); }
    } else { navigate(routes.sower.path); }
  }, [isPayingUser, toast, navigate]);
  const handleProfileChange = (field: string, value: any) => setProfile(p => ({ ...p, [field]: value }));
  const handleFontSizeChange = (v: number) => { setReadingFontSize(v); localStorage.setItem("reading_font_size", String(v)); };
  const handleTranslationChange = (id: string) => { setPreferredTranslation(id); localStorage.setItem("preferred_translation", id); };
  return {
    loading, isRtl, t, navigate, themeMode, setThemeMode,
    isPayingUser, tierLabel, expiresLabel,
    profile, handleProfileChange, savingProfile, handleSaveProfile, handleSowerAction, sowerPortalLoading,
    savingPassword, handlePasswordChange,
    notifications, handleNotificationChange,
    readingFontSize, handleFontSizeChange, preferredTranslation, handleTranslationChange,
  };
}

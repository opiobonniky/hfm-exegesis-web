import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import {
  getPushState,
  enablePush,
  disablePush,
  sendTestPush as sendTestPushLocal,
  savePushPreference,
  loadPushPreference,
  type PushSettingsState,
} from "../services/pushService";

export interface NotificationSettingsData {
  dailyVerseReminder: boolean; devotionReminder: boolean; streakReminder: boolean;
  emailNotifications: boolean; pushNotifications: boolean;
  reminderTime: string; timezone: string;
}
export function useNotificationSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettingsData>({
    dailyVerseReminder: true, devotionReminder: true, streakReminder: true,
    emailNotifications: false, pushNotifications: true,
    reminderTime: "08:00", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // ── Web push state ────────────────────────────────────────────────────────
  const [push, setPush] = useState<PushSettingsState>({
    supported: false,
    permission: "unsupported" as PushSettingsState["permission"],
    enabled: false,
  });
  const [pushBusy, setPushBusy] = useState(false);

  const refreshPushState = useCallback(async () => {
    setPush(await getPushState());
  }, []);

  const handleEnablePush = useCallback(async () => {
    setPushBusy(true);
    try {
      const result = await enablePush();
      if (result.enabled) {
        toast({ title: "Push enabled", description: "You'll now receive notifications on this device." });
        await savePushPreference(true);
      } else if (result.reason) {
        toast({ title: "Push not enabled", description: result.reason, variant: "destructive" });
      }
      await refreshPushState();
      return result.enabled;
    } finally {
      setPushBusy(false);
    }
  }, [toast, refreshPushState]);

  const handleDisablePush = useCallback(async () => {
    setPushBusy(true);
    try {
      await disablePush();
      await savePushPreference(false);
      toast({ title: "Push disabled", description: "Notifications are off for this device." });
      await refreshPushState();
    } finally {
      setPushBusy(false);
    }
  }, [toast, refreshPushState]);

  const handleTestPush = useCallback(async () => {
    const sent = await sendTestPushLocal();
    if (!sent) {
      // No SW/permission yet — running the enable flow first covers both.
      const enabled = await handleEnablePush();
      if (enabled) await sendTestPushLocal();
    }
  }, [handleEnablePush]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("user", "get-notification-settings", {});
      if (res.returnCode === 200 && res.returnData) setSettings((prev) => ({ ...prev, ...res.returnData }));
    } catch { /* ignore */ }

    // Merge web-push state (device capability + server preference).
    try {
      const [state, pref] = await Promise.all([getPushState(), loadPushPreference()]);
      setPush(state);
      setSettings((prev) => ({
        ...prev,
        pushNotifications: pref ?? state.enabled,
        timezone: prev.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      }));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);
  const handleToggle = useCallback((key: keyof NotificationSettingsData) => {
    // The push toggle drives the browser permission flow, not plain state.
    if (key === "pushNotifications") return;
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }, []);
  const updateSettings = useCallback((patch: Partial<NotificationSettingsData>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await sendPostRequest("user", "update-notification-settings", settings);
      if (res.returnCode === 200) {
        toast({ title: "Saved", description: "Notification settings updated" });
        navigate(routes.settings.path);
      } else {
        toast({ title: "Error", description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally { setSaving(false); }
  }, [settings, navigate, toast]);
  return {
    data: {
      loading, saving, settings, push, pushBusy,
    },
    actions: {
      handleToggle, updateSettings, handleSave, navigate,
      refreshPushState, handleEnablePush, handleDisablePush, handleTestPush,
    },
  };
}

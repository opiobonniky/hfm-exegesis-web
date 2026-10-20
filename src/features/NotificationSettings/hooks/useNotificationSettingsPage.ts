import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import {
  getPushState,
  enablePush,
  disablePush,
  sendTestPush as sendBackendTest,
  type PushSettingsState,
} from "../services/pushService";
import { tt } from '@/components/languages/hardcodedTranslate';

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
    const state = await getPushState();
    setPush(state);
    setSettings(previous => ({ ...previous, pushNotifications: state.enabled }));
  }, []);

  const handleEnablePush = useCallback(async () => {
    setPushBusy(true);
    try {
      const result = await enablePush();
      if (result.enabled) {
        toast({ title: tt("Push enabled"), description: tt("You'll now receive notifications on this device.") });
      } else if (result.reason) {
        toast({ title: tt("Push not enabled"), description: result.reason, variant: "destructive" });
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
      toast({ title: tt("Push disabled"), description: tt("Notifications are off for this device.") });
      await refreshPushState();
    } finally {
      setPushBusy(false);
    }
  }, [toast, refreshPushState]);

  const handleTestPush = useCallback(async () => {
    if (!push.enabled && !(await handleEnablePush())) return;
    setPushBusy(true);
    try {
      await sendBackendTest();
      toast({ title: tt('Browser test sent'), description: tt('Firebase accepted the push. Check your notification panel.') });
    } catch (error) {
      toast({ title: tt('Browser test failed'), description: error instanceof Error ? error.message : tt('Check backend Firebase configuration.'), variant: 'destructive' });
    } finally { setPushBusy(false); }
  }, [push.enabled, handleEnablePush, toast]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("push", "get-settings", {});
      if (res.returnCode === 200 && res.returnData) {
        const { dailyVerseReminder, reminderTime, timezone } = res.returnData;
        setSettings((prev) => ({
          ...prev,
          ...(typeof dailyVerseReminder === "boolean" && { dailyVerseReminder }),
          ...(typeof reminderTime === "string" && { reminderTime }),
          ...(typeof timezone === "string" && timezone && { timezone }),
        }));
      }
    } catch { /* ignore */ }

    // Merge web-push state (device capability + server preference).
    try {
      const state = await getPushState();
      setPush(state);
      setSettings((prev) => ({
        ...prev,
        pushNotifications: state.enabled,
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
      // Only the daily-verse reminder is persisted server-side; the other
      // toggles are device-local preferences.
      const res = await sendPostRequest("push", "update-settings", {
        dailyVerseReminder: settings.dailyVerseReminder,
        reminderTime: settings.reminderTime,
        timezone: settings.timezone,
      });
      if (res.returnCode === 200) {
        toast({ title: tt("Saved"), description: tt("Notification settings updated") });
        navigate(routes.settings.path);
      } else {
        toast({ title: tt("Error"), description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: tt("Error"), variant: "destructive" });
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

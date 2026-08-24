import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

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
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("user", "get-notification-settings", {});
      if (res.returnCode === 200 && res.returnData) setSettings((prev) => ({ ...prev, ...res.returnData }));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadSettings(); }, [loadSettings]);
  const handleToggle = useCallback((key: keyof NotificationSettingsData) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  const updateSettings = useCallback((patch: Partial<NotificationSettingsData>) => {
    setSettings((s) => ({ ...s, ...patch }));
  const handleSave = useCallback(async () => {
    setSaving(true);
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
  return { loading, saving, settings, handleToggle, updateSettings, handleSave, navigate };

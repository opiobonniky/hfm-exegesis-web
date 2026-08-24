// Settings useUserSettings — useUserSettings state and API logic
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";

export interface UserSettings {
  profile: any;
  voiceSettings: any;
  readingSettings: any;
  notificationSettings: any;
}
export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    profile: null,
    voiceSettings: null,
    readingSettings: null,
    notificationSettings: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [profile, voice, reading, notif] = await Promise.all([
        sendPostRequest("auth", "get-current-user", {}),
        sendPostRequest("user", "get-voice-settings", {}),
        sendPostRequest("user", "get-reading-settings", {}),
        sendPostRequest("user", "get-notification-settings", {}),
      ]);
      setSettings({
        profile: profile.returnCode === 200 ? profile.returnData : null,
        voiceSettings: voice.returnCode === 200 ? voice.returnData : null,
        readingSettings: reading.returnCode === 200 ? reading.returnData : null,
        notificationSettings: notif.returnCode === 200 ? notif.returnData : null,
      });
    } catch (e) {
      console.error("Failed to fetch settings", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  const updateProfile = useCallback(async (data: any) => {
    setSaving(true);
      await sendPostRequest("auth", "update-current-user", data);
      setSettings(s => ({ ...s, profile: { ...s.profile, ...data } }));
      setSaving(false);
  }, []);
  const updateVoiceSettings = useCallback(async (data: any) => {
      await sendPostRequest("user", "update-voice-settings", data);
      setSettings(s => ({ ...s, voiceSettings: { ...s.voiceSettings, ...data } }));
  const updateReadingSettings = useCallback(async (data: any) => {
      await sendPostRequest("user", "update-reading-settings", data);
      setSettings(s => ({ ...s, readingSettings: { ...s.readingSettings, ...data } }));
  const updateNotificationSettings = useCallback(async (data: any) => {
      await sendPostRequest("user", "update-notification-settings", data);
      setSettings(s => ({ ...s, notificationSettings: { ...s.notificationSettings, ...data } }));
  return {
    settings,
    loading,
    saving,
    updateProfile,
    updateVoiceSettings,
    updateReadingSettings,
    updateNotificationSettings,
    refresh: fetchSettings,
  };

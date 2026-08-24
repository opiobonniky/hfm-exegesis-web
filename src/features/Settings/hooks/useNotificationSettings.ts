// Settings useNotificationSettings — useNotificationSettings state and API logic
import { useState, useCallback } from "react";
import { settingsApi } from "../services/settingsApi";

import type { NotificationSettings } from "../types";
const DEFAULT: NotificationSettings = {
  dailyVerseEnabled: true, dailyVerseHour: 7, dailyVerseMinute: 0,
  planEnabled: true, planHour: 8, planMinute: 0,
  atRiskEnabled: false, atRiskHour: 18, atRiskMinute: 0,
  timeZone: "Africa/Nairobi",
};
export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getNotificationSettings();
      if (res.returnCode === 200 && res.returnData) setSettings(res.returnData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  const updateSettings = useCallback(async (data: Partial<NotificationSettings>) => {
    setSaving(true);
      const merged = { ...settings, ...data };
      const res = await settingsApi.updateNotificationSettings(merged);
      if (res.returnCode === 200) { setSettings(merged); return true; }
      return false;
    } catch (e) { console.error(e); return false; }
    finally { setSaving(false); }
  }, [settings]);
  return { settings, loading, saving, fetchSettings, updateSettings, setSettings };
}

// Settings useReadingSettings — useReadingSettings state and API logic
import { useState, useCallback } from "react";
import { settingsApi } from "../services/settingsApi";

export function useReadingSettings() {
  const [settings, setSettings] = useState({ fontSize: "medium" as const, theme: "system" as const, showVerseNumbers: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getReadingSettings();
      if (res.returnCode === 200 && res.returnData) setSettings(res.returnData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  const updateSettings = useCallback(async (data: Partial<typeof settings>) => {
    setSaving(true);
      const merged = { ...settings, ...data };
      const res = await settingsApi.updateReadingSettings(merged);
      if (res.returnCode === 200) { setSettings(merged); return true; }
      return false;
    } catch (e) { console.error(e); return false; }
    finally { setSaving(false); }
  }, [settings]);
  return { settings, loading, saving, fetchSettings, updateSettings };
}

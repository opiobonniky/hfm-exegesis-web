// Settings useSettingsProfile — useSettingsProfile state and API logic
import { useState, useCallback } from "react";
import { settingsApi } from "../services/settingsApi";
import type { UserProfile } from "../types";

export function useSettingsProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getProfile();
      if (res.returnCode === 200) setProfile(res.returnData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setSaving(true);
      const res = await settingsApi.updateProfile(data);
      if (res.returnCode === 200) {
        setProfile((prev) => prev ? { ...prev, ...data } : prev);
        return true;
      }
      return false;
    } catch (e) { console.error(e); return false; }
    finally { setSaving(false); }
  return { profile, loading, saving, fetchProfile, updateProfile };
}

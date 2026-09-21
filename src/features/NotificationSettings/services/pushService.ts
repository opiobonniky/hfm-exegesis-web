// Feature-level push service — wraps the global pushService with the
// NotificationSettings page's server-persisted preference flow.
import { sendPostRequest } from "@/services/api";
import {
  isPushSupported,
  getPushPermission,
  isWebPushEnabled,
  enableWebPush,
  disableWebPush,
  showLocalNotification,
  type PushPermissionState,
} from "@/services/pushService";

export type { PushPermissionState };

export interface PushSettingsState {
  supported: boolean;
  permission: PushPermissionState;
  enabled: boolean;
}

export const getPushState = async (): Promise<PushSettingsState> => ({
  supported: await isPushSupported(),
  permission: getPushPermission(),
  enabled: isWebPushEnabled(),
});

export const enablePush = () => enableWebPush();

export const disablePush = () => disableWebPush();

export const sendTestPush = async (): Promise<boolean> =>
  showLocalNotification("Exegesis", "Test notification — web push is working! 🎉");

/** Persist the push preference alongside the page's other settings. */
export const savePushPreference = async (pushEnabled: boolean) => {
  try {
    await sendPostRequest("push", "update-settings", { dailyVerseReminder: pushEnabled });
  } catch {
    // Preference persistence is best-effort; the token registration is the
    // source of truth for delivery.
  }
};

export const loadPushPreference = async (): Promise<boolean | null> => {
  try {
    const res = await sendPostRequest<{ dailyVerseReminder?: boolean }>(
      "push",
      "get-settings",
      {},
    );
    if (res.returnCode === 200 && res.returnData) {
      return !!res.returnData.dailyVerseReminder;
    }
  } catch {
    // fallthrough
  }
  return null;
};

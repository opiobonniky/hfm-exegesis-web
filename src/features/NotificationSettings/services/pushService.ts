// Browser registration/opt-out is separate from the daily-verse schedule.
import {
  isPushSupported,
  getPushPermission,
  isWebPushEnabled,
  enableWebPush,
  disableWebPush,
  sendWebPushTest,
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
  (await sendWebPushTest()) > 0;

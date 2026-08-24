// Settings settingsApi — API endpoints for settingsApi operations
import { sendPostRequest } from "@/services/api";

export const settingsApi = {
  getProfile: () =>
    sendPostRequest("auth", "get-current-user", {}),
  updateProfile: (data: any) =>
    sendPostRequest("auth", "update-current-user", data),
  updatePassword: (data: any) =>
    sendPostRequest("auth", "update-password", data),
  getVoiceSettings: () =>
    sendPostRequest("user", "get-voice-settings", {}),
  updateVoiceSettings: (data: any) =>
    sendPostRequest("user", "update-voice-settings", data),
  getReadingSettings: () =>
    sendPostRequest("user", "get-reading-settings", {}),
  updateReadingSettings: (data: any) =>
    sendPostRequest("user", "update-reading-settings", data),
  getNotificationSettings: () =>
    sendPostRequest("user", "get-notification-settings", {}),
  updateNotificationSettings: (data: any) =>
    sendPostRequest("user", "update-notification-settings", data),
};

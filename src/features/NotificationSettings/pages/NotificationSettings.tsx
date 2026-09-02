"use client";

import { useNotificationSettingsPage } from "../hooks/useNotificationSettingsPage";
import {
  NotificationSettingsLayout,
  NotificationHeader,
  NotificationToggle,
  NotificationTimePicker,
  NotificationCardContent,
  NotificationSettingsLoading,
} from "../components";

export default function NotificationSettings() {
  const h = useNotificationSettingsPage();

  if (h.loading) return (
    <NotificationSettingsLayout>
      <NotificationSettingsLoading />
    </NotificationSettingsLayout>
  );

  return (
    <NotificationSettingsLayout>
      <NotificationHeader
        backLabel="Back"
        onBack={() => h.navigate(-1)}
        title="Notifications"
        subtitle="Manage your notification preferences"
        saveLabel={h.saving ? "Saving..." : "Save"}
        loading={h.saving}
        onSave={h.handleSave}
      />

      <NotificationCardContent>
        <NotificationToggle label="Daily Verse Reminder" desc="Receive a daily Bible verse notification" checked={h.settings.dailyVerseReminder} onToggle={() => h.handleToggle("dailyVerseReminder")} />
        <NotificationToggle label="Devotion Reminder" desc="Get reminded to read your daily devotion" checked={h.settings.devotionReminder} onToggle={() => h.handleToggle("devotionReminder")} />
        <NotificationToggle label="Streak Reminder" desc="Don't break your reading streak" checked={h.settings.streakReminder} onToggle={() => h.handleToggle("streakReminder")} />
        <NotificationToggle label="Email Notifications" desc="Receive notifications via email" checked={h.settings.emailNotifications} onToggle={() => h.handleToggle("emailNotifications")} />
        <NotificationToggle label="Push Notifications" desc="Receive push notifications on your device" checked={h.settings.pushNotifications} onToggle={() => h.handleToggle("pushNotifications")} />
        <NotificationTimePicker label="Reminder Time" value={h.settings.reminderTime} onChange={(v) => h.updateSettings({ reminderTime: v })} />
      </NotificationCardContent>
    </NotificationSettingsLayout>
  );
}

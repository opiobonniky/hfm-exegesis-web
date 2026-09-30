"use client";

import { useNotificationSettingsPage } from "../hooks/useNotificationSettingsPage";
import {
  NotificationSettingsLayout,
  NotificationHeader,
  NotificationToggle,
  NotificationTimePicker,
  NotificationCardContent,
  NotificationSettingsLoading,
  PushNotificationCard,
} from "../components";
import { tt } from '@/components/languages/hardcodedTranslate';

export default function NotificationSettings() {
  const { data, actions } = useNotificationSettingsPage();
  const h = { ...data, ...actions };

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
        title={tt("Notifications")}
        subtitle={tt("Manage your notification preferences")}
        saveLabel={h.saving ? "Saving..." : "Save"}
        loading={h.saving}
        onSave={h.handleSave}
      />

      <NotificationCardContent>
        <NotificationToggle label={tt("Daily Verse Reminder")} desc="Receive a daily Bible verse notification" checked={h.settings.dailyVerseReminder} onToggle={() => h.handleToggle("dailyVerseReminder")} />
        <NotificationToggle label={tt("Devotion Reminder")} desc="Get reminded to read your daily devotion" checked={h.settings.devotionReminder} onToggle={() => h.handleToggle("devotionReminder")} />
        <NotificationToggle label={tt("Streak Reminder")} desc="Don't break your reading streak" checked={h.settings.streakReminder} onToggle={() => h.handleToggle("streakReminder")} />
        <NotificationToggle label={tt("Email Notifications")} desc="Receive notifications via email" checked={h.settings.emailNotifications} onToggle={() => h.handleToggle("emailNotifications")} />
        <PushNotificationCard
          supported={h.push.supported}
          permission={h.push.permission}
          enabled={h.push.enabled}
          busy={h.pushBusy}
          checked={h.settings.pushNotifications}
          onEnable={h.handleEnablePush}
          onDisable={h.handleDisablePush}
          onTest={h.handleTestPush}
        />
        <NotificationTimePicker label={tt("Reminder Time")} value={h.settings.reminderTime} onChange={(v) => h.updateSettings({ reminderTime: v })} />
      </NotificationCardContent>
    </NotificationSettingsLayout>
  );
}

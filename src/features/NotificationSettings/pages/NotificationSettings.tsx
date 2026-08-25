"use client";

import { Bell, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useNotificationSettingsPage } from "../hooks/useNotificationSettingsPage";

export default function NotificationSettings() {
  const h = useNotificationSettingsPage();

  if (h.loading) return (
    <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  );

  const Toggle = ({ label, desc, checked, onToggle }: { label: string; desc: string; checked: boolean; onToggle: () => void }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => h.navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
          </div>
        </div>
        <Button onClick={h.handleSave} disabled={h.saving}>
          {h.saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save
        </Button>
      </div>
      <Card>
        <CardContent className="divide-y">
          <Toggle label="Daily Verse Reminder" desc="Receive a daily Bible verse notification" checked={h.settings.dailyVerseReminder} onToggle={() => h.handleToggle("dailyVerseReminder")} />
          <Toggle label="Devotion Reminder" desc="Get reminded to read your daily devotion" checked={h.settings.devotionReminder} onToggle={() => h.handleToggle("devotionReminder")} />
          <Toggle label="Streak Reminder" desc="Don't break your reading streak" checked={h.settings.streakReminder} onToggle={() => h.handleToggle("streakReminder")} />
          <Toggle label="Email Notifications" desc="Receive notifications via email" checked={h.settings.emailNotifications} onToggle={() => h.handleToggle("emailNotifications")} />
          <Toggle label="Push Notifications" desc="Receive push notifications on your device" checked={h.settings.pushNotifications} onToggle={() => h.handleToggle("pushNotifications")} />
          <div className="py-3">
            <p className="font-medium text-sm mb-2">Reminder Time</p>
            <Input type="time" value={h.settings.reminderTime}
              onChange={(e) => h.updateSettings({ reminderTime: e.target.value })} className="w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Save } from "lucide-react";

interface NotificationSectionProps {
  settings: any;
  saving: boolean;
  onSave: (data: any) => void;
}
export function NotificationSection({ settings, saving, onSave }: NotificationSectionProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      dailyVerseReminder: fd.get("dailyVerseReminder") === "on",
      readingPlanReminder: fd.get("readingPlanReminder") === "on",
      streakReminder: fd.get("streakReminder") === "on",
      reminderTime: fd.get("reminderTime"),
      timezone: fd.get("timezone"),
    });
  };
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Daily Verse Reminder</Label>
            <Switch name="dailyVerseReminder" defaultChecked={settings?.dailyVerseReminder ?? true} />
          </div>
            <Label>Reading Plan Reminder</Label>
            <Switch name="readingPlanReminder" defaultChecked={settings?.readingPlanReminder ?? true} />
            <Label>Streak Reminder</Label>
            <Switch name="streakReminder" defaultChecked={settings?.streakReminder ?? false} />
          <div className="space-y-2">
            <Label>Reminder Time</Label>
            <Input name="reminderTime" type="time" defaultValue={settings?.reminderTime || "08:00"} />
            <Label>Timezone</Label>
            <Input name="timezone" defaultValue={settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone} />
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

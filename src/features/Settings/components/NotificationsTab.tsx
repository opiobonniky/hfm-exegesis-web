import { Bell, BookOpen, Heart, Flame, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { tt } from '@/components/languages/hardcodedTranslate';

interface NotificationsTabProps {
  notifications: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}
const items = [
  { key: "dailyVerseReminder", label: tt("Daily Verse"), desc: tt("Receive a daily Bible verse"), icon: BookOpen, color: "text-primary" },
  { key: "devotionReminder", label: tt("Devotion Reminder"), desc: tt("Daily devotion notification"), icon: Heart, color: "text-rose-500" },
  { key: "emailNotifications", label: tt("Email Notifications"), desc: tt("Receive updates via email"), icon: Mail, color: "text-blue-500" },
  { key: "pushNotifications", label: tt("Push Notifications"), desc: tt("In-app notifications"), icon: Bell, color: "text-violet-500" },
  { key: "studyReminders", label: tt("Study Reminders"), desc: tt("Reminders to study"), icon: Flame, color: "text-amber-500" },
];
export function NotificationsTab({ notifications, onToggle }: NotificationsTabProps) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <Bell className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold">{tt("Notification Preferences")}</h3>
          <p className="text-xs text-muted-foreground">{tt("Manage how you receive notifications")}</p>
        </div>
      </div>
      {items.map(({ key, label, desc, icon: Icon, color }) => (
        <div key={key} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
          <Switch checked={notifications[key] ?? false} onCheckedChange={(v) => onToggle(key, v)} />
        </div>
      ))}
    </div>
  );
}

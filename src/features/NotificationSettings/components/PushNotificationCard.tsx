// PushNotificationCard — web push settings for the NotificationSettings page.
// Shows device capability + permission status, an enable/disable control and
// a "send test" action. All logic comes from the hook via props (validator
// rules: no business logic, no raw HTML in pages).
import { NotificationToggle } from "./NotificationSettingsLayout";
import { tt } from '@/components/languages/hardcodedTranslate';

interface PushNotificationCardProps {
  supported: boolean;
  permission: string;
  enabled: boolean;
  busy: boolean;
  checked: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onTest: () => void;
}

const permissionCopy: Record<string, string> = {
  granted: "Notifications are allowed in your browser",
  denied: "Blocked in browser settings — enable them in your browser's site settings first",
  default: "You'll be asked for permission when you enable push",
  unsupported: "This browser does not support push notifications",
};

export function PushNotificationCard({
  supported,
  permission,
  enabled,
  busy,
  checked,
  onEnable,
  onDisable,
  onTest,
}: PushNotificationCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground p-4 space-y-1">
      <NotificationToggle
        label={tt("Push Notifications")}
        desc={
          !supported
            ? permissionCopy.unsupported
            : enabled
              ? "Enabled on this device"
              : permissionCopy[permission] ?? permissionCopy.default
        }
        checked={checked}
        onToggle={() => (enabled ? onDisable() : onEnable())}
      />
      {supported && enabled && (
        <button
          onClick={onTest}
          disabled={busy}
          className="text-xs text-primary underline-offset-2 hover:underline disabled:opacity-50"
        >
          {busy ? tt("Working…") : tt("Send test notification")}
        </button>
      )}
    </div>
  );
}

// NotificationSettingsLoading — spinner for loading state (single root element)
export function NotificationSettingsLoading() {
  return (
    <span className="flex items-center justify-center p-12">
      <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </span>
  );
}

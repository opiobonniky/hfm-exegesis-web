// NotificationSettings layout and sub-components
import { ReactNode } from "react";

interface NotificationSettingsLayoutProps {
  children: ReactNode;
}

export function NotificationSettingsLayout({ children }: NotificationSettingsLayoutProps) {
  return <div className="space-y-6 p-6 max-w-2xl mx-auto">{children}</div>;
}

interface NotificationHeaderProps {
  backLabel: string;
  onBack: () => void;
  title: string;
  subtitle: string;
  saveLabel: string;
  loading: boolean;
  onSave: () => void;
}

export function NotificationHeader({ backLabel, onBack, title, subtitle, saveLabel, loading, onSave }: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <button onClick={onSave} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
        {saveLabel}
      </button>
    </div>
  );
}

interface NotificationToggleProps {
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}

export function NotificationToggle({ label, desc, checked, onToggle }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

interface NotificationTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function NotificationTimePicker({ label, value, onChange }: NotificationTimePickerProps) {
  return (
    <div className="py-3">
      <p className="font-medium text-sm mb-2">{label}</p>
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)} className="w-40 px-3 py-2 border rounded-md bg-background text-sm" />
    </div>
  );
}

interface NotificationCardContentProps {
  children: ReactNode;
}

export function NotificationCardContent({ children }: NotificationCardContentProps) {
  return (
    <div className="rounded-lg border bg-card p-6 divide-y">
      {children}
    </div>
  );
}

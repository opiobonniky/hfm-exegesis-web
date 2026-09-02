// SettingsTabBar — renders settings tab triggers using Radix Tabs
// All className and rendering logic lives here, not in the page
import { User, Star, Lock, Sliders, Bell, type LucideIcon } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItem {
  value: string;
  label: string;
  short: string;
}

const TAB_ICONS: Record<string, LucideIcon> = {
  profile: User,
  additional: Star,
  password: Lock,
  preferences: Sliders,
  notifications: Bell,
};

export const SETTINGS_TABS: TabItem[] = [
  { value: "profile", label: "Profile", short: "Profile" },
  { value: "additional", label: "Details", short: "Details" },
  { value: "password", label: "Password", short: "Pass" },
  { value: "preferences", label: "Reading", short: "Read" },
  { value: "notifications", label: "Notifications", short: "Notify" },
];

export function SettingsTabBar() {
  return (
    <TabsList className="flex w-full max-w-2xl mb-6 bg-muted/50 p-1 rounded-xl overflow-x-auto">
      {SETTINGS_TABS.map(({ value, label, short }) => {
        const Icon = TAB_ICONS[value];
        return (
          <TabsTrigger key={value} value={value} className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm shrink-0">
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden text-[10px]">{short}</span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}

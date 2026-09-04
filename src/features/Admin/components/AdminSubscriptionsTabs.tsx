// AdminSubscriptionsTabs — tab list + content routing for admin subscriptions
import { ShieldCheck, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUBSCRIPTION_TABS } from "../constants";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Users,
};

interface Props {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: ReactNode;
}

export function AdminSubscriptionsTabs({ activeTab, onTabChange, children }: Props) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="overflow-x-auto flex-nowrap w-full justify-start">
        {SUBSCRIPTION_TABS.map((tab) => {
          const Icon = ICON_MAP[tab.icon] || Layers;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap">
              <Icon className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}

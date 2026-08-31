// AdminTriviaTabs — tab list + content routing for admin trivia
import { BarChart3, Users, HelpCircle, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRIVIA_TABS } from "../constants";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  Users,
  HelpCircle,
  TrendingUp,
};

interface Props {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: ReactNode;
}

export function AdminTriviaTabs({ activeTab, onTabChange, children }: Props) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsList className="overflow-x-auto flex-nowrap w-full justify-start">
        {TRIVIA_TABS.map((tab) => {
          const Icon = ICON_MAP[tab.icon] || BarChart3;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="whitespace-nowrap"
            >
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

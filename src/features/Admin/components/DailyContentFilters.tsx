// DailyContentFilters — tab switcher + date search for AdminDailyContent
import { CalendarDays, Sun, Sprout, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTENT_TABS } from "../constants";

const ICONS: Record<string, typeof Sun> = { Sun, Sprout, BookOpen };
interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchDate: string;
  onSearchDateChange: (v: string) => void;
  onClearDate: () => void;
  total: number;
}
export function DailyContentFilters({ activeTab, onTabChange, searchDate, onSearchDateChange, onClearDate, total }: Props) {
  return (
      <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
        <TabsList className="inline-flex w-auto gap-1 rounded-xl bg-muted/30 border border-border/40 p-1 backdrop-blur-sm">
          {CONTENT_TABS.map(tab => {
            const Icon = ICONS[tab.icon];
            return (
              <TabsTrigger key={tab.value} value={tab.value}
                className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 rounded-lg px-3 py-1.5 text-xs transition-all whitespace-nowrap">
                <Icon className="w-3.5 h-3.5 text-foreground/60" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    );
}
/** Tab content wrapper with header, search, and count */
export function ContentTabPanel({
  tab, total, searchDate, onSearchDateChange, onClearDate, onAdd,
  children,
}: {
  tab: string; total: number; searchDate: string;
  onSearchDateChange: (v: string) => void; onClearDate: () => void;
  onAdd: () => void; children: React.ReactNode;
}) {
  const tabConfig = CONTENT_TABS.find(t => t.value === tab);
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-base font-semibold">
          {tabConfig?.label || tab} <span className="text-muted-foreground font-normal ml-1">({total})</span>
        </h3>
        <Button size="sm" onClick={onAdd} className="gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> New {tabConfig?.label?.replace("Daily ", "") || "Entry"}
        </Button>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-[200px]">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-foreground/80" />
          <Input type="date" value={searchDate} onChange={e => onSearchDateChange(e.target.value)}
            className="pl-9 h-9 text-sm" />
        </div>
        {searchDate && (
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={onClearDate}>
            ✕ Clear
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}

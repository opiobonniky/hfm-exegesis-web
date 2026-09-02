import { StatCards } from "./StatCards";
import { DashboardMainContent } from "./DashboardMainContent";
import { DashboardSidebar } from "./DashboardSidebar";
import type { UserDashboardPageModel } from "../hooks/useUserDashboard";

interface Props {
  model: UserDashboardPageModel;
}

export function DashboardBody({ model }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <StatCards
        chaptersRead={model.stats.chaptersRead}
        highlights={model.stats.highlights}
        notes={model.stats.notes}
        journalEntries={model.stats.journalEntries}
        favorites={model.stats.favorites}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        <DashboardMainContent model={model} />
        <DashboardSidebar model={model} />
      </div>
      <div className="h-6" />
    </div>
  );
}

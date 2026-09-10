import { StatCards } from "./StatCards";
import { DashboardMainContent } from "./DashboardMainContent";
import { DashboardSidebar } from "./DashboardSidebar";
import type { UserDashboardPageModel } from "../hooks/useUserDashboard";

interface Props {
  model: UserDashboardPageModel;
}

export function DashboardBody({ model }: Props) {
  return (
    <main className="mx-auto max-w-7xl space-y-9 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <StatCards
        chaptersRead={model.stats.chaptersRead}
        highlights={model.stats.highlights}
        notes={model.stats.notes}
        journalEntries={model.stats.journalEntries}
        favorites={model.stats.favorites}
      />
      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardMainContent model={model} />
        <DashboardSidebar model={model} />
      </div>
      <div className="h-2" />
    </main>
  );
}

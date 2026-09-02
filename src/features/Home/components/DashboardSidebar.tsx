import { ContinueReadingCard } from "./ContinueReadingCard";
import { DailyExegesisCard } from "./DailyExegesisCard";
import { DailyDevotionCard } from "./DailyDevotionCard";
import { LatestJournalCard } from "./LatestJournalCard";
import QuickAccessIcons from "./QuickAccessIcons";
import RecentActivityList from "./RecentActivityList";
import { routes } from "@/components/Routes/routes";
import type { UserDashboardPageModel } from "../hooks/useUserDashboard";

interface Props {
  model: UserDashboardPageModel;
}

export function DashboardSidebar({ model }: Props) {
  return (
    <div className="space-y-6">
      <ContinueReadingCard model={model} />
      <QuickAccessIcons navigate={model.navigate} />
      <RecentActivityList
        activities={model.recentActivity}
        navigate={model.navigate}
        onSeeAll={() => model.navigate(routes.highlights.path)}
      />
      <DailyExegesisCard model={model} />
      <DailyDevotionCard model={model} />
      <LatestJournalCard model={model} />
    </div>
  );
}

import { ExploreGrid } from "./ExploreGrid";
import StudySessionCard from "./StudySessionCard";
import ReadingPlansSection from "./ReadingPlansSection";
import { routes } from "@/components/Routes/routes";
import type { UserDashboardPageModel } from "../hooks/useUserDashboard";

interface Props {
  model: UserDashboardPageModel;
}

export function DashboardMainContent({ model }: Props) {
  return (
    <div className="space-y-8">
      <ExploreGrid />
      {model.currentSession && (
        <StudySessionCard
          session={model.currentSession}
          onPress={() => model.navigate(`${routes.labFlow.path}?sessionId=${model.currentSession.id}`)}
        />
      )}
      <ReadingPlansSection
        plans={model.readingPlans}
        onSeeAll={() => model.navigate(routes.userPlans.path)}
        onPressPlan={() => model.navigate(routes.userPlans.path)}
      />
    </div>
  );
}

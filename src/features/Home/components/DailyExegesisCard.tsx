import ContentCard from "./ContentCard";
import { routes } from "@/components/Routes/routes";
import type { UserDashboardPageModel } from "../hooks/useUserDashboard";

interface Props {
  model: UserDashboardPageModel;
}

export function DailyExegesisCard({ model }: Props) {
  if (!model.dailyExegesis) return null;
  return (
    <ContentCard title="Daily Exegesis" cta="Study" onClick={() => model.navigate(routes.dailyExegesis.path)} onCta={() => model.navigate(routes.dailyExegesis.path)}>
      <div className="font-semibold text-sm text-foreground line-clamp-1">
        {model.dailyExegesis.title || "Daily Exegesis"}
      </div>
      {model.dailyExegesis.passageRef && (
        <div className="text-xs text-muted-foreground/60 mt-1 font-mono">
          {model.dailyExegesis.passageRef}
        </div>
      )}
    </ContentCard>
  );
}

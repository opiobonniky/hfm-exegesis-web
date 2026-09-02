import ContentCard from "./ContentCard";
import { routes } from "@/components/Routes/routes";
import type { UserDashboardPageModel } from "../hooks/useUserDashboard";

interface Props {
  model: UserDashboardPageModel;
}

export function DailyDevotionCard({ model }: Props) {
  if (!model.dailyDevotion) return null;
  return (
    <ContentCard title="Daily Devotion" cta="Read" onClick={() => model.navigate(routes.userDevotions.path)} onCta={() => model.navigate(routes.userDevotions.path)}>
      <div className="font-semibold text-sm text-foreground line-clamp-1">
        {model.dailyDevotion.title || "Daily Devotion"}
      </div>
      {model.dailyDevotion.content && (
        <div className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">
          {model.dailyDevotion.content}
        </div>
      )}
    </ContentCard>
  );
}

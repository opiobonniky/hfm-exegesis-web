import ContentCard from "./ContentCard";
import type { UserDashboardPageModel } from "../hooks/useUserDashboard";

interface Props {
  model: UserDashboardPageModel;
}

export function LatestJournalCard({ model }: Props) {
  if (!model.latestEntry) return null;
  return (
    <ContentCard title="Latest Journal" cta="Open" onClick={() => model.navigate(`/journal/view/${model.latestEntry.id}`)} onCta={() => model.navigate(`/journal/view/${model.latestEntry.id}`)}>
      <div className="font-semibold text-sm text-foreground line-clamp-1">
        {model.latestEntry.title || "Journal Entry"}
      </div>
      {(model.latestEntry.bookName || model.latestEntry.content) && (
        <div className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">
          {model.latestEntry.bookName
            ? `${model.latestEntry.bookName}${model.latestEntry.chapter ? ` ${model.latestEntry.chapter}` : ""}`
            : model.latestEntry.content}
        </div>
      )}
    </ContentCard>
  );
}

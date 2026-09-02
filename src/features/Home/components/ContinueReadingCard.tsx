import ContentCard from "./ContentCard";
import { routes } from "@/components/Routes/routes";
import type { UserDashboardPageModel } from "../hooks/useUserDashboard";

interface Props {
  model: UserDashboardPageModel;
}

export function ContinueReadingCard({ model }: Props) {
  if (!model.lastRead) return null;
  return (
    <ContentCard
      title="Continue Reading"
      onClick={() => model.navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(model.lastRead!.bookName)}&chapter=${model.lastRead!.chapter}`)}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          📖
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">{model.lastRead.bookName}</div>
          <div className="text-xs text-muted-foreground/60">Chapter {model.lastRead.chapter}</div>
        </div>
      </div>
    </ContentCard>
  );
}

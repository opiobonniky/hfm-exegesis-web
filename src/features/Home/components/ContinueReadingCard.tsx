import ContentCard from "./ContentCard";
import { BookOpen } from "lucide-react";
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ebe6da] text-[#785724] dark:bg-white/10 dark:text-[#d7aa62]">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-lg font-semibold text-[#173346] dark:text-[#f5f0e5]">{model.lastRead.bookName}</div>
          <div className="text-xs text-muted-foreground">Chapter {model.lastRead.chapter}</div>
        </div>
      </div>
    </ContentCard>
  );
}

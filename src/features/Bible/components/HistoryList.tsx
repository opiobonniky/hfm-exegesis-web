import type { HistoryItem } from "../hooks/useHistoryPage";
import { BibleGroupSection } from "./BibleGroupSection";
import { HistoryCard } from "./HistoryCard";

interface Props {
  grouped: Record<string, HistoryItem[]>;
  deleting: number | null;
  onGoToReader: (bookName: string, chapter: number) => void;
  onDelete: (item: HistoryItem) => void;
  formatTimeAgo: (date: string) => string;
}

export function HistoryList({ grouped, deleting, onGoToReader, onDelete, formatTimeAgo }: Props) {
  return (
    <>
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <BibleGroupSection key={dateLabel} label={dateLabel}>
          {items.map((item) => (
            <HistoryCard
              key={item.id}
              bookName={item.bookName}
              chapter={item.chapter}
              lastVerse={item.lastVerse || item.verseNumber}
              createdOn={item.createdOn}
              lastRead={item.lastRead}
              deleting={deleting === item.id}
              onGoToReader={() => onGoToReader(item.bookName, item.chapter)}
              onDelete={() => onDelete(item)}
              formatTimeAgo={formatTimeAgo}
            />
          ))}
        </BibleGroupSection>
      ))}
    </>
  );
}

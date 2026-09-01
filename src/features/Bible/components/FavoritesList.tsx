import type { FavoriteItem } from "../hooks/useFavoritesPage";
import { FavoriteCard } from "./FavoriteCard";

interface Props {
  items: FavoriteItem[];
  verseTextMap: Record<string, string>;
  deleting: number | null;
  onGoToReader: (bookName: string, chapter: number) => void;
  onDelete: (id: number) => void;
  formatDate: (date: string) => string;
}

export function FavoritesList({ items, verseTextMap, deleting, onGoToReader, onDelete, formatDate }: Props) {
  return (
    <>
      {items.map((item) => (
        <FavoriteCard
          key={item.id}
          bookName={item.bookName}
          chapter={item.chapter}
          verseNumber={item.verseNumber}
          verseText={verseTextMap[`${item.bookName} ${item.chapter}:${item.verseNumber}`]}
          createdOn={item.createdOn}
          deleting={deleting === item.id}
          onGoToReader={() => onGoToReader(item.bookName, item.chapter)}
          onDelete={() => onDelete(item.id)}
          formatDate={formatDate}
        />
      ))}
    </>
  );
}

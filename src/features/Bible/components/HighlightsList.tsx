import type { HighlightItem } from "../hooks/useHighlightsPage";
import { BibleGroupSection, BibleSubGroup } from "./BibleGroupSection";
import { HighlightCard } from "./HighlightCard";

interface Props {
  grouped: Record<string, Record<number, HighlightItem[]>>;
  verseTextMap: Record<string, string>;
  deleting: number | null;
  getColor: (colorId: number) => { color: string; label: string };
  onGoToReader: (bookName: string, chapter: number) => void;
  onDelete: (id: number) => void;
}

export function HighlightsList({ grouped, verseTextMap, deleting, getColor, onGoToReader, onDelete }: Props) {
  return (
    <>
      {Object.entries(grouped).map(([book, chapters]) => (
        <BibleGroupSection key={book} label={book}>
          {Object.entries(chapters).map(([chapter, verses]) => (
            <BibleSubGroup key={chapter} label={`Chapter ${chapter}`}>
              {verses.map((verse) => (
                <HighlightCard
                  key={verse.id}
                  bookName={verse.bookName}
                  chapter={verse.chapter}
                  verseNumber={verse.verseNumber}
                  verseText={verseTextMap[`${verse.bookName} ${verse.chapter}:${verse.verseNumber}`]}
                  color={getColor(verse.colorId)}
                  note={verse.note}
                  createdOn={verse.createdOn}
                  deleting={deleting === verse.id}
                  onGoToReader={() => onGoToReader(verse.bookName, verse.chapter)}
                  onDelete={() => onDelete(verse.id)}
                />
              ))}
            </BibleSubGroup>
          ))}
        </BibleGroupSection>
      ))}
    </>
  );
}

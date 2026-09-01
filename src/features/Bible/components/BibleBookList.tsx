/**
 * BibleBookList — list of BookCard components with spacing.
 */
import type { LibraryBookInfo } from "../types";
import BookCard from "./BookCard";

interface BibleBookListProps {
  books: LibraryBookInfo[];
  expandedBook: string | null;
  isRtl: boolean;
  onToggle: (bookName: string) => void;
  onChapterClick: (bookName: string, chapter: number) => void;
  onBookOverview: (bookName: string) => void;
}

export function BibleBookList({
  books,
  expandedBook,
  isRtl,
  onToggle,
  onChapterClick,
  onBookOverview,
}: BibleBookListProps) {
  return (
    <div className="space-y-2">
      {books.map((book) => (
        <BookCard
          key={book.bookName}
          bookNumber={book.bookNumber}
          bookName={book.bookName}
          testament={book.testament}
          chaptersCount={book.chaptersCount}
          totalVerses={book.totalVerses}
          expanded={expandedBook === book.bookName}
          onToggle={() => onToggle(book.bookName)}
          onChapterClick={(chapter) => onChapterClick(book.bookName, chapter)}
          onBookOverview={() => onBookOverview(book.bookName)}
          isRtl={isRtl}
        />
      ))}
    </div>
  );
}

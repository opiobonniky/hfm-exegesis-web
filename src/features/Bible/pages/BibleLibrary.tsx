// BibleLibrary — book browser with search and chapter navigation
import { useBibleLibrary } from "../hooks/useBibleLibrary";
import BookCard from "../components/BookCard";
import {
  BiblePageLayout, BibleLibraryHeader, BibleLibraryEmpty, BibleLibraryLoading, BibleLibraryFooter, BibleBookList,
} from "../components";

export default function BibleLibrary() {
  const h = useBibleLibrary();

  if (h.loading) return <BibleLibraryLoading />;

  return (
    <BiblePageLayout isRtl={h.isRtl} className="bg-gradient-to-b from-background via-background to-muted/20">
      <BibleLibraryHeader
        stats={h.stats}
        searchRef={h.searchRef}
        searchQuery={h.searchQuery}
        setSearchQuery={h.setSearchQuery}
        clearSearch={h.clearSearch}
        tabs={h.tabs}
        covenant={h.covenant}
        selectCovenant={h.selectCovenant}
      />

      <div className="px-4 sm:px-6 py-4 pb-24 max-w-4xl mx-auto">
        {h.filteredBooks.length === 0 ? (
          <BibleLibraryEmpty searchQuery={h.searchQuery} clearSearch={h.clearSearch} />
        ) : (
          <BibleBookList>
            {h.filteredBooks.map((book) => (
              <BookCard key={book.bookName} bookNumber={book.bookNumber} bookName={book.bookName} testament={book.testament}
                chaptersCount={book.chaptersCount} totalVerses={book.totalVerses}
                expanded={h.expandedBook === book.bookName} onToggle={() => h.toggleExpand(book.bookName)}
                onChapterClick={(ch) => h.goToChapter(book.bookName, ch)}
                onBookOverview={() => h.goToBookOverview(book.bookName)} isRtl={h.isRtl} />
            ))}
          </BibleBookList>
        )}

        {h.filteredBooks.length > 0 && (
          <BibleLibraryFooter filteredCount={h.filteredBooks.length} totalCount={h.books.length} />
        )}
      </div>
    </BiblePageLayout>
  );
}

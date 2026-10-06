import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from "@/components/languages/hardcodedTranslate";
import { BIBLE_SELECTION_BOOKS } from "../constants";
import type { BibleTestament } from "../types";

export function useBibleBookSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isRtl, t } = useLanguage();
  const selectedBook = searchParams.get("book");
  const selectedBookData = BIBLE_SELECTION_BOOKS.find(
    (book) => book.bookName === selectedBook,
  );
  const [activeTestament, setActiveTestament] = useState<BibleTestament>(
    selectedBookData?.testament ?? "Old",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0;

  const books = BIBLE_SELECTION_BOOKS.filter((book) =>
    isFiltering
      ? book.bookName.toLowerCase().includes(normalizedQuery)
      : book.testament === activeTestament,
  );

  const tabs = [
    { value: "Old" as const, label: tt("Old Testament"), count: 39 },
    { value: "New" as const, label: tt("New Testament"), count: 27 },
  ];

  const selectBook = useCallback(
    (bookName: string) => {
      navigate(`/book-overview?book=${encodeURIComponent(bookName)}`);
    },
    [navigate],
  );

  return {
    data: {
      books,
      tabs,
      activeTestament,
      selectedBook,
      searchQuery,
      isFiltering,
      isRtl,
      title: t.bibleReader.selectBook,
      subtitle: `${BIBLE_SELECTION_BOOKS.length} ${tt("books")} · 39 OT · 27 NT`,
      searchPlaceholder: t.bibleReader.filterBooks,
      noResultsLabel: tt("No books found"),
      chaptersLabel: tt("chapters"),
      currentBookLabel: tt("Current book"),
      backLabel: t.common.back,
    },
    actions: {
      goBack: () => navigate(-1),
      setSearchQuery,
      clearSearch: () => setSearchQuery(""),
      setActiveTestament,
      selectBook,
    },
  };
}

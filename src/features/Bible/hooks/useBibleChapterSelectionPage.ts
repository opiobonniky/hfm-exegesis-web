import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from "@/components/languages/hardcodedTranslate";
import {
  BIBLE_BOOK_CHAPTERS,
  clampChapter,
  isBibleBook,
} from "../constants";

export function useBibleChapterSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isRtl, t } = useLanguage();
  const requestedBook = searchParams.get("book");
  const bookName = isBibleBook(requestedBook) ? requestedBook : "Genesis";
  const maxChapters = BIBLE_BOOK_CHAPTERS[bookName];
  const requestedChapter = Number.parseInt(searchParams.get("chapter") ?? "1", 10);
  const currentChapter = clampChapter(bookName, requestedChapter);
  const chapters = Array.from({ length: maxChapters }, (_, index) => index + 1);

  const selectChapter = useCallback(
    (chapter: number) => {
      navigate(
        `/bible-reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}`,
      );
    },
    [bookName, navigate],
  );

  const selectBook = useCallback(() => {
    navigate(`/bible-books?book=${encodeURIComponent(bookName)}`);
  }, [bookName, navigate]);

  return {
    data: {
      chapters,
      currentChapter,
      isRtl,
      title: bookName,
      subtitle: t.bibleReader.selectChapter,
      summaryLabel: t.bibleReader.chOf
        .replace("{n}", String(currentChapter))
        .replace("{total}", String(maxChapters)),
      totalLabel: `${maxChapters} ${tt("chapters total")}`,
      chapterLabel: t.bibleReader.chapterLabel,
      selectBookLabel: t.bibleReader.selectBook,
      backLabel: t.common.back,
    },
    actions: {
      goBack: () => navigate(-1),
      selectBook,
      selectChapter,
    },
  };
}

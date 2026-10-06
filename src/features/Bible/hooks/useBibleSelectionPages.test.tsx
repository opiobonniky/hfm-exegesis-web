import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBibleBookSelectionPage } from "./useBibleBookSelectionPage";
import { useBibleChapterSelectionPage } from "./useBibleChapterSelectionPage";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  search: "",
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
  useSearchParams: () => [new URLSearchParams(mocks.search)],
}));

vi.mock("@/components/languages/languageProvider", () => ({
  useLanguage: () => ({
    isRtl: false,
    t: {
      common: { back: "Back" },
      bibleReader: {
        selectBook: "Select Book",
        selectChapter: "Select Chapter",
        filterBooks: "Filter books",
        chOf: "Ch. {n} of {total}",
        chapterLabel: "Chapter {n}",
      },
    },
  }),
}));

describe("Bible selection page hooks", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.search = "";
  });

  it("opens on the selected book's testament and routes a book to its overview", () => {
    mocks.search = "book=John";
    const { result } = renderHook(() => useBibleBookSelectionPage());

    expect(result.current.data.activeTestament).toBe("New");
    expect(result.current.data.books).toHaveLength(27);

    act(() => result.current.actions.selectBook("1 Corinthians"));

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/book-overview?book=1%20Corinthians",
    );
  });

  it("searches across both testaments", () => {
    const { result } = renderHook(() => useBibleBookSelectionPage());

    act(() => result.current.actions.setSearchQuery("john"));

    expect(result.current.data.books.map((book) => book.bookName)).toEqual([
      "John",
      "1 John",
      "2 John",
      "3 John",
    ]);
  });

  it("clamps the current chapter and routes chapter selection to the reader", () => {
    mocks.search = "book=Psalms&chapter=999";
    const { result } = renderHook(() => useBibleChapterSelectionPage());

    expect(result.current.data.currentChapter).toBe(150);
    expect(result.current.data.chapters).toHaveLength(150);

    act(() => result.current.actions.selectChapter(23));

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/bible-reader?book=Psalms&chapter=23",
    );
  });

  it("routes from chapter selection back to the current book picker", () => {
    mocks.search = "book=Song%20of%20Solomon&chapter=2";
    const { result } = renderHook(() => useBibleChapterSelectionPage());

    act(() => result.current.actions.selectBook());

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/bible-books?book=Song%20of%20Solomon",
    );
  });
});

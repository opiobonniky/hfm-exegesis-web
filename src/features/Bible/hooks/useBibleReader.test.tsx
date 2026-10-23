import type { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBibleReader } from "./useBibleReader";

const mocks = vi.hoisted(() => ({
  language: "en",
  getTranslations: vi.fn(),
  getVersesBatch: vi.fn(),
  getChapterHeadingsCached: vi.fn(),
  sendPostRequest: vi.fn(),
}));

vi.mock("@/components/languages/languageProvider", () => ({
  useLanguage: () => ({ lang: mocks.language }),
}));

vi.mock("@/services/bibleApi", () => ({
  bibleApi: {
    getTranslations: mocks.getTranslations,
    getVersesBatch: mocks.getVersesBatch,
  },
  mapTranslationId: (id: string) => (id === "BSB" ? "Berean" : id),
}));

vi.mock("@/services/chapterHeadings", () => ({
  getChapterHeadingsCached: mocks.getChapterHeadingsCached,
}));

vi.mock("@/services/api", () => ({
  API_BASE_URL: "https://example.test",
  sendPostRequest: mocks.sendPostRequest,
}));

const chapterResponse = (text: string) =>
  [1, 2, 3].map((chapterNumber) => ({
    chapterNumber,
    verses: [{ verseNumber: 1, text: `${text} ${chapterNumber}` }],
  }));

const wrapper =
  (entry = "/bible?book=Genesis&chapter=1") =>
  ({ children }: PropsWithChildren) => (
    <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
  );

describe("useBibleReader translation selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mocks.language = "en";
    mocks.getChapterHeadingsCached.mockResolvedValue([]);
    mocks.sendPostRequest.mockImplementation(
      (_module: string, action: string) =>
        Promise.resolve({
          returnCode: 200,
          returnData:
            action === "get-verse-note"
              ? []
              : action === "get-favorites"
                ? { favorites: [] }
                : { highlights: [] },
        }),
    );
  });

  it("loads the preferred Bible for the selected language without requesting English", async () => {
    mocks.language = "fr";
    mocks.getTranslations.mockResolvedValue([
      { id: "French", name: "French", language: "fr" },
    ]);
    mocks.getVersesBatch.mockResolvedValue(chapterResponse("Français"));

    const { result } = renderHook(() => useBibleReader(), {
      wrapper: wrapper(),
    });

    await waitFor(() => {
      expect(result.current.data.versionId).toBe("French");
      expect(result.current.data.chapters).toHaveLength(3);
    });

    expect(mocks.getTranslations).toHaveBeenCalledWith();
    expect(mocks.getVersesBatch).toHaveBeenCalledWith(
      "French",
      "Genesis",
      [1, 2, 3],
    );
    expect(mocks.getVersesBatch).not.toHaveBeenCalledWith(
      "Berean",
      expect.anything(),
      expect.anything(),
    );
  });

  it("keeps a valid translation supplied by the reader link", async () => {
    mocks.getTranslations.mockResolvedValue([
      { id: "Berean", name: "Berean", language: "en" },
      { id: "KJV", name: "King James Version", language: "en" },
    ]);
    mocks.getVersesBatch.mockResolvedValue(chapterResponse("KJV"));

    const { result } = renderHook(() => useBibleReader(), {
      wrapper: wrapper("/bible?book=Genesis&chapter=1&translation=KJV"),
    });

    await waitFor(() => {
      expect(result.current.data.versionId).toBe("KJV");
      expect(mocks.getVersesBatch).toHaveBeenCalledWith(
        "KJV",
        "Genesis",
        [1, 2, 3],
      );
    });
    expect(localStorage.getItem("preferred_translation")).toBe("KJV");
  });

  it("switches language and ignores the previous translation response", async () => {
    let resolveEnglish: (value: ReturnType<typeof chapterResponse>) => void;
    const pendingEnglish = new Promise<ReturnType<typeof chapterResponse>>(
      (resolve) => {
        resolveEnglish = resolve;
      },
    );

    mocks.getTranslations.mockImplementation(() =>
      Promise.resolve(
        mocks.language === "fr"
          ? [{ id: "French", name: "French", language: "fr" }]
          : [{ id: "Berean", name: "Berean", language: "en" }],
      ),
    );
    mocks.getVersesBatch.mockImplementation((translation: string) =>
      translation === "Berean"
        ? pendingEnglish
        : Promise.resolve(chapterResponse("Français")),
    );

    const { result, rerender } = renderHook(() => useBibleReader(), {
      wrapper: wrapper(),
    });

    await waitFor(() =>
      expect(mocks.getVersesBatch).toHaveBeenCalledWith(
        "Berean",
        "Genesis",
        [1, 2, 3],
      ),
    );

    act(() => {
      mocks.language = "fr";
      rerender();
    });

    await waitFor(() => {
      expect(result.current.data.versionId).toBe("French");
      expect(result.current.data.chapters[0]?.verses[0]?.text).toBe("Français 1");
    });

    await act(async () => {
      resolveEnglish!(chapterResponse("English"));
      await pendingEnglish;
    });

    expect(result.current.data.versionId).toBe("French");
    expect(result.current.data.chapters[0]?.verses[0]?.text).toBe("Français 1");
  });

  it("preserves loaded chapters when scrolling updates the visible chapter", async () => {
    mocks.getTranslations.mockResolvedValue([
      { id: "Berean", name: "Berean", language: "en" },
    ]);
    mocks.getVersesBatch.mockImplementation(
      (_translation: string, _book: string, chapters: number[]) =>
        Promise.resolve(
          chapters.map((chapterNumber) => ({
            chapterNumber,
            verses: [{ verseNumber: 1, text: `Verse ${chapterNumber}` }],
          })),
        ),
    );

    const { result } = renderHook(() => useBibleReader(), {
      wrapper: wrapper(
        "/bible-reader?book=Genesis&chapter=1&translation=Berean",
      ),
    });

    await waitFor(() =>
      expect(result.current.data.chapters.map((chapter) => chapter.chapter)).toEqual([
        1, 2, 3,
      ]),
    );

    await act(async () => {
      await result.current.actions.loadMore();
    });

    await waitFor(() =>
      expect(result.current.data.chapters.map((chapter) => chapter.chapter)).toEqual([
        1, 2, 3, 4, 5, 6,
      ]),
    );
    expect(mocks.getTranslations).toHaveBeenCalledTimes(1);

    act(() => result.current.actions.setVisibleChapter(3));

    await waitFor(() => expect(result.current.data.selectedChapter).toBe(3));
    expect(result.current.data.chapters.map((chapter) => chapter.chapter)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(mocks.getTranslations).toHaveBeenCalledTimes(1);
  });

  it('honors an explicit XML edition independently of the UI language', async () => {
    mocks.language = 'fr';
    mocks.getTranslations.mockResolvedValue([
      { id: 'French', language: 'fr' }, { id: 'KJV', language: 'en' },
    ]);
    mocks.getVersesBatch.mockResolvedValue(chapterResponse('KJV source wording'));
    const { result } = renderHook(() => useBibleReader(), {
      wrapper: wrapper('/bible?book=Genesis&chapter=1&translation=KJV'),
    });
    await waitFor(() => expect(result.current.data.chapters).toHaveLength(3));
    expect(result.current.data.versionId).toBe('KJV');
    expect(result.current.data.chapters[0].language).toBe('en');
    expect(result.current.data.chapters[0].verses[0].text).toBe('KJV source wording 1');
  });

  it('does not silently substitute another version for an unavailable edition link', async () => {
    mocks.getTranslations.mockResolvedValue([{ id: 'Berean', language: 'en' }]);
    const { result } = renderHook(() => useBibleReader(), {
      wrapper: wrapper('/bible?book=Genesis&chapter=1&translation=Unavailable'),
    });
    await waitFor(() => expect(result.current.data.loadError).toBeTruthy());
    expect(result.current.data.chapters).toEqual([]);
    expect(mocks.getVersesBatch).not.toHaveBeenCalled();
    expect(result.current.data.loading).toBe(false);
  });

  it('shows a retryable error instead of certifying missing chapter data', async () => {
    mocks.getTranslations.mockResolvedValue([{ id: 'Berean', language: 'en' }]);
    mocks.getVersesBatch.mockResolvedValue([{ chapterNumber: 1, verses: [] }]);
    const { result } = renderHook(() => useBibleReader(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.data.loadError).toBeTruthy());
    expect(result.current.data.chapters).toEqual([]);
    expect(result.current.data.loadError).not.toContain('Backend:');
    mocks.getVersesBatch.mockResolvedValue(chapterResponse('Recovered'));
    act(() => result.current.actions.retryLoad());
    await waitFor(() => expect(result.current.data.chapters).toHaveLength(3));
    expect(result.current.data.loadError).toBeNull();
  });

  it('retains the current verses when the current edition is selected again', async () => {
    mocks.getTranslations.mockResolvedValue([{ id: 'Berean', language: 'en' }]);
    mocks.getVersesBatch.mockResolvedValue(chapterResponse('Original'));
    const { result } = renderHook(() => useBibleReader(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.data.chapters).toHaveLength(3));
    act(() => result.current.actions.selectTranslation('Berean'));
    expect(result.current.data.chapters).toHaveLength(3);
    expect(mocks.getVersesBatch).toHaveBeenCalledTimes(1);
  });
});

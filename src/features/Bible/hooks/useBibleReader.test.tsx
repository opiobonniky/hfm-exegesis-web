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

    expect(mocks.getTranslations).toHaveBeenCalledWith("fr");
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

    await waitFor(() => expect(result.current.data.versionId).toBe("KJV"));

    expect(mocks.getVersesBatch).toHaveBeenCalledWith(
      "KJV",
      "Genesis",
      [1, 2, 3],
    );
    expect(localStorage.getItem("preferred_translation")).toBe("KJV");
  });

  it("switches language and ignores the previous translation response", async () => {
    let resolveEnglish: (value: ReturnType<typeof chapterResponse>) => void;
    const pendingEnglish = new Promise<ReturnType<typeof chapterResponse>>(
      (resolve) => {
        resolveEnglish = resolve;
      },
    );

    mocks.getTranslations.mockImplementation((language: string) =>
      Promise.resolve(
        language === "fr"
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
});

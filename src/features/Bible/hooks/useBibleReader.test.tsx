import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockSendPostRequest, resetMocks } from "@/test/test-utils";

const { mockGetVersesBatch } = vi.hoisted(() => ({
  mockGetVersesBatch: vi.fn(),
}));
vi.mock("@/services/bibleApi", () => ({
  bibleApi: {
    getVersesBatch: mockGetVersesBatch,
  },
const { useBibleReader } = await import("./useBibleReader");
function wrapper(initialEntry = "/bible-reader") {
  return function RouterWrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  };
}
function chapter(bookName: string, chapterNumber: number, verseCount = 1) {
  return {
    bookNumber: 1,
    bookName,
    chapterNumber,
    verses: Array.from({ length: verseCount }, (_, index) => ({
      verseNumber: index + 1,
      text: `${bookName} ${chapterNumber}:${index + 1}`,
    })),
describe("useBibleReader", () => {
  beforeEach(() => {
    resetMocks();
    mockGetVersesBatch.mockReset();
    mockSendPostRequest.mockResolvedValue({ returnCode: 200, returnData: [] });
  });
  it("validates deep links and loads only chapters inside the book boundary", async () => {
    mockGetVersesBatch.mockResolvedValue([chapter("Psalms", 149, 2), chapter("Psalms", 150)]);
    const { result } = renderHook(() => useBibleReader(), {
      wrapper: wrapper("/bible-reader?book=Psalms&chapter=149&verse=2&translation=KJV"),
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockGetVersesBatch).toHaveBeenCalledWith("KJV", "Psalms", [149, 150]);
    expect(result.current.selectedVerse).toBe(2);
    expect(result.current.chapters.map((item) => item.chapter)).toEqual([149, 150]);
    expect(result.current.hasMore).toBe(false);
  it("reloads the current passage when the translation changes", async () => {
    mockGetVersesBatch
      .mockResolvedValueOnce([chapter("Genesis", 1), chapter("Genesis", 2), chapter("Genesis", 3)])
      .mockResolvedValueOnce([chapter("Genesis", 1), chapter("Genesis", 2), chapter("Genesis", 3)]);
    const { result } = renderHook(() => useBibleReader(), { wrapper: wrapper() });
    act(() => result.current.selectTranslation("KJV"));
    await waitFor(() => expect(mockGetVersesBatch).toHaveBeenLastCalledWith("KJV", "Genesis", [1, 2, 3]));
    expect(result.current.versionId).toBe("KJV");
  it("updates the visible chapter without reloading the rendered passage", async () => {
    mockGetVersesBatch.mockResolvedValue([
      chapter("Genesis", 1),
      chapter("Genesis", 2),
      chapter("Genesis", 3),
    ]);
    act(() => result.current.setVisibleChapter(2));
    expect(result.current.selectedChapter).toBe(2);
    expect(result.current.chapters.map((item) => item.chapter)).toEqual([1, 2, 3]);
    expect(mockGetVersesBatch).toHaveBeenCalledTimes(1);
  it("ignores a stale passage response after navigation", async () => {
    let resolveGenesis!: (value: ReturnType<typeof chapter>[]) => void;
    const genesisRequest = new Promise<ReturnType<typeof chapter>[]>((resolve) => {
      resolveGenesis = resolve;
      .mockReturnValueOnce(genesisRequest)
      .mockResolvedValueOnce([chapter("Exodus", 1), chapter("Exodus", 2), chapter("Exodus", 3)]);
    await waitFor(() => expect(mockGetVersesBatch).toHaveBeenCalledTimes(1));
    act(() => result.current.navigateTo("Exodus", 1));
    await waitFor(() => expect(result.current.chapters[0]?.book).toBe("Exodus"));
    await act(async () => resolveGenesis([chapter("Genesis", 1)]));
    expect(result.current.chapters.every((item) => item.book === "Exodus")).toBe(true);
});

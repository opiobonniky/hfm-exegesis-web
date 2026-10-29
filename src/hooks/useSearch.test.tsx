import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSearch } from "./useSearch";
import { searchApi, type SearchResponse } from "@/services/searchApi";

vi.mock("@/services/searchApi", () => ({ searchApi: {
  search: vi.fn(), getPopularSearches: vi.fn(), logSearch: vi.fn(),
} }));
const response = (verse = 1, total = 12): SearchResponse => ({
  success: true, query: "faith", total, page: 1, limit: 5,
  data: [{ book_number: 43, book_name: "John", chapter: 1, verse, verse_text: "Faith and hope." }],
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
async function tick() { await act(async () => { await vi.advanceTimersByTimeAsync(300); }); }

describe("Bible-only search state", () => {
  beforeEach(() => {
    vi.useFakeTimers(); localStorage.clear(); vi.clearAllMocks();
    vi.mocked(searchApi.search).mockResolvedValue(response());
    vi.mocked(searchApi.getPopularSearches).mockResolvedValue([]);
    vi.mocked(searchApi.logSearch).mockResolvedValue();
  });
  afterEach(() => vi.useRealTimers());

  it("debounces typing, enforces the minimum, and uses five results in the active edition", async () => {
    const { result } = renderHook(() => useSearch("Hindi"));
    act(() => result.current.setQuery("fa")); await tick();
    expect(searchApi.search).not.toHaveBeenCalled();
    act(() => result.current.setQuery("faith"));
    expect(searchApi.search).not.toHaveBeenCalled(); await tick();
    expect(searchApi.search).toHaveBeenCalledExactlyOnceWith("faith", { translation: "Hindi", covenant: "all", bookName: undefined, limit: 5, offset: 0 });
  });
  it("submits immediately without issuing a duplicate debounced request", async () => {
    const { result } = renderHook(() => useSearch("Berean"));
    await act(async () => result.current.searchImmediate("faith")); await tick();
    expect(searchApi.search).toHaveBeenCalledTimes(1);
    expect(result.current.results).toHaveLength(1);
    await act(async () => result.current.searchImmediate("faith")); await tick();
    expect(searchApi.search).toHaveBeenCalledTimes(2);
  });
  it("keeps book/testament filters for submit, then resets the book when changing testament", async () => {
    const { result } = renderHook(() => useSearch("KJV"));
    act(() => { result.current.setCovenant("nt"); result.current.setBookFilter("John"); });
    await act(async () => result.current.searchImmediate("faith"));
    expect(searchApi.search).toHaveBeenLastCalledWith("faith", expect.objectContaining({ bookName: "John", covenant: "nt" }));
    act(() => result.current.setCovenant("ot")); await tick();
    expect(result.current.bookName).toBeUndefined();
    expect(searchApi.search).toHaveBeenLastCalledWith("faith", expect.objectContaining({ bookName: undefined, covenant: "ot" }));
  });
  it("clearing or shortening a query invalidates in-flight responses", async () => {
    for (const text of ["", "fa"]) {
      const pending = deferred<SearchResponse>();
      vi.mocked(searchApi.search).mockReturnValueOnce(pending.promise);
      const { result, unmount } = renderHook(() => useSearch("Berean"));
      act(() => result.current.searchImmediate("faith"));
      act(() => result.current.setQuery(text));
      await act(async () => pending.resolve(response()));
      expect(result.current.results).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.total).toBe(0); unmount();
    }
  });
  it("ignores an old result during the new query's debounce window", async () => {
    const pending = deferred<SearchResponse>();
    vi.mocked(searchApi.search).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useSearch("Berean"));
    act(() => result.current.searchImmediate("faith"));
    act(() => result.current.setQuery("peace"));
    await act(async () => pending.resolve(response()));
    expect(result.current.results).toEqual([]); await tick();
    expect(searchApi.search).toHaveBeenLastCalledWith("peace", expect.anything());
  });
  it("paginates by the returned offset and blocks duplicate load-more calls", async () => {
    const { result } = renderHook(() => useSearch("Berean"));
    await act(async () => result.current.searchImmediate("faith"));
    const pending = deferred<SearchResponse>();
    vi.mocked(searchApi.search).mockReturnValueOnce(pending.promise);
    act(() => { result.current.loadMore(); result.current.loadMore(); });
    expect(searchApi.search).toHaveBeenCalledTimes(2);
    expect(searchApi.search).toHaveBeenLastCalledWith("faith", expect.objectContaining({ offset: 1, limit: 5 }));
    await act(async () => pending.resolve(response(2, 2)));
    expect(result.current.results).toHaveLength(2);
    act(() => result.current.loadMore());
    expect(searchApi.search).toHaveBeenCalledTimes(2);
  });
  it("ignores stale pagination after a version change and researches the new edition", async () => {
    const { result, rerender } = renderHook(({ version }) => useSearch(version), { initialProps: { version: "Berean" } });
    await act(async () => result.current.searchImmediate("faith"));
    const pending = deferred<SearchResponse>();
    vi.mocked(searchApi.search).mockReturnValueOnce(pending.promise);
    act(() => result.current.loadMore()); rerender({ version: "KJV" });
    await act(async () => pending.resolve(response(99)));
    expect(result.current.results).toEqual([]); await tick();
    expect(searchApi.search).toHaveBeenLastCalledWith("faith", expect.objectContaining({ translation: "KJV", offset: 0 }));
  });
  it("does not search while the translation catalogue is unresolved", async () => {
    const { result, rerender } = renderHook(({ version }: { version: string | null }) => useSearch(version), { initialProps: { version: null as string | null } });
    act(() => result.current.searchImmediate("faith")); await tick();
    expect(searchApi.search).not.toHaveBeenCalled(); rerender({ version: "Berean" }); await tick();
    expect(searchApi.search).toHaveBeenCalledTimes(1);
  });
  it("reports unsuccessful responses without logging them or saving history", async () => {
    vi.mocked(searchApi.search).mockResolvedValue({ ...response(), success: false });
    const { result } = renderHook(() => useSearch("Berean"));
    await act(async () => result.current.searchImmediate("faith"));
    expect(result.current.error).toContain("unavailable");
    expect(result.current.searchHistory).toEqual([]);
    expect(searchApi.logSearch).not.toHaveBeenCalled();
  });
  it("deduplicates successful history and removes or clears entries", async () => {
    const { result } = renderHook(() => useSearch("Berean"));
    await act(async () => result.current.searchImmediate("faith"));
    await act(async () => result.current.searchImmediate("Faith"));
    expect(result.current.searchHistory).toEqual(["Faith"]);
    act(() => result.current.removeHistoryItem("Faith"));
    expect(result.current.searchHistory).toEqual([]);
    await act(async () => result.current.searchImmediate("peace"));
    act(() => result.current.clearHistory());
    expect(result.current.searchHistory).toEqual([]);
  });
  it("filters popular items to Bible scope and persists hiding them", async () => {
    vi.mocked(searchApi.getPopularSearches).mockResolvedValue([
      { query: "faith", scope: "bible", count: 5 }, { query: "journal", scope: "journal", count: 6 },
    ]);
    const { result, unmount } = renderHook(() => useSearch("Berean")); await tick();
    expect(result.current.popularSearches.map(item => item.query)).toEqual(["faith"]);
    act(() => result.current.clearPopularSearches());
    expect(result.current.popularSearches).toEqual([]); unmount();
    vi.mocked(searchApi.getPopularSearches).mockClear();
    renderHook(() => useSearch("Berean")); await tick();
    expect(searchApi.getPopularSearches).not.toHaveBeenCalled();
  });
  it("handles corrupt storage without using legacy multi-scope history", async () => {
    localStorage.setItem("exegesis_search_history", '["old journal search"]');
    localStorage.setItem("exegesis_bible_search_history", '[null,4,"faith"]');
    const { result } = renderHook(() => useSearch("Berean"));
    expect(result.current.searchHistory).toEqual(["faith"]);
    await tick();
  });
});

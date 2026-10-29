import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSearchPage } from "./useSearchPage";
import type { SearchResult } from "@/services/searchApi";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(), params: "", allowed: true,
  immediate: vi.fn(), setQuery: vi.fn(),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => mocks.navigate, useSearchParams: () => [new URLSearchParams(mocks.params)] }));
vi.mock("@/components/Routes/routes", () => ({ routes: { bibleReader: { path: "/bible-reader" }, labFlow: { path: "/bible-study" }, sower: { path: "/sower" } } }));
vi.mock("@/components/languages/languageProvider", () => ({ useLanguage: () => ({ lang: "en", isRtl: false }) }));
vi.mock("@/hooks/useSubscription", () => ({ useSubscription: () => ({ hasAccess: () => mocks.allowed }) }));
vi.mock("./useSearchTranslation", () => ({ useSearchTranslation: () => ({ translation: "KJV", versionName: "King James Version", versionLabel: "KJV" }) }));
vi.mock("./useSearchSectionHeadings", () => ({ useSearchSectionHeadings: () => ({}) }));
vi.mock("@/hooks/useSearch", () => ({ MIN_QUERY_LENGTH: 3, useSearch: () => ({
  query: "", results: [], covenant: "all", loading: false, searchImmediate: mocks.immediate, setQuery: mocks.setQuery,
}) }));
const item: SearchResult = { book_number: 43, book_name: "John", chapter: 3, verse: 16, verse_text: "For God so loved" };
function lastUrl() { return new URL(mocks.navigate.mock.calls.at(-1)![0], "https://example.test"); }

describe("Bible search page wiring", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.params = ""; mocks.allowed = true; });
  it("opens verses in the exact edition being searched", () => {
    const { result } = renderHook(() => useSearchPage());
    act(() => result.current.actions.handleSelect(item));
    expect(lastUrl().pathname).toBe("/bible-reader");
    expect(lastUrl().searchParams.get("translation")).toBe("KJV");
    expect(lastUrl().searchParams.get("verse")).toBe("16");
  });
  it("routes save and note actions to the reader, not journal search", () => {
    const { result } = renderHook(() => useSearchPage());
    act(() => result.current.actions.handleSave(item));
    expect(lastUrl().searchParams.get("action")).toBe("highlight");
    act(() => result.current.actions.handleAddNote(item));
    expect(lastUrl().searchParams.get("action")).toBe("note");
  });
  it("preserves the study tier gate and single-verse Look stage", () => {
    const { result } = renderHook(() => useSearchPage());
    act(() => result.current.actions.handleStudy(item));
    expect(lastUrl().searchParams.get("verseEnd")).toBe("16");
    expect(lastUrl().searchParams.get("requestedStage")).toBe("look");
    mocks.allowed = false;
    act(() => result.current.actions.handleStudy(item));
    expect(mocks.navigate).toHaveBeenLastCalledWith("/sower");
  });
  it("runs deep-link word searches once and clears their contextual label on new typing", () => {
    mocks.params = "word=faith&scope=journal";
    const { result, rerender } = renderHook(() => useSearchPage());
    expect(mocks.immediate).toHaveBeenCalledExactlyOnceWith("faith");
    expect(result.current.data.searchContext).toBe('All uses of “faith”');
    rerender(); expect(mocks.immediate).toHaveBeenCalledTimes(1);
    act(() => result.current.actions.handleInputChange("peace"));
    expect(result.current.data.searchContext).toBeNull();
    expect(mocks.setQuery).toHaveBeenCalledWith("peace");
  });
  it("suggestions, history and popular terms always submit Bible queries immediately", () => {
    const { result } = renderHook(() => useSearchPage());
    act(() => {
      result.current.actions.handleSuggestion("hope");
      result.current.actions.handleHistoryTap("faith");
      result.current.actions.handlePopularTap({ query: "peace" });
    });
    expect(mocks.immediate.mock.calls).toEqual([["hope"], ["faith"], ["peace"]]);
  });
});

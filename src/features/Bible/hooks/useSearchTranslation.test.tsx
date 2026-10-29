import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bibleApi, type Translation } from "@/services/bibleApi";
import { useSearchTranslation } from "./useSearchTranslation";

vi.mock("@/services/bibleApi", () => ({ bibleApi: { getTranslations: vi.fn() }, mapTranslationId: (id: string) => id === "BSB" ? "Berean" : id }));
const catalog: Array<Translation & { abbreviation: string }> = [
  { id: "Berean", name: "Berean Standard Bible", language: "en", abbreviation: "BSB" },
  { id: "KJV", name: "King James Version", language: "en", abbreviation: "KJV" },
  { id: "Hindi", name: "Hindi Bible", language: "hi", languageName: "Hindi", abbreviation: "HHBD" },
].map(entry => ({ shortName: entry.abbreviation, description: null, copyright: null, link: null, ...entry }));
describe("Search edition catalogue", () => {
  beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); vi.mocked(bibleApi.getTranslations).mockResolvedValue(catalog); });
  it("uses the saved reader edition and live version metadata", async () => {
    localStorage.setItem("preferred_translation", "KJV");
    const { result } = renderHook(() => useSearchTranslation("en", null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.translation).toBe("KJV");
    expect(result.current.translations.map(item => item.id)).toEqual(["Berean", "KJV"]);
  });
  it("respects explicit version links across interface languages and exposes language labels", async () => {
    const { result } = renderHook(() => useSearchTranslation("en", "Hindi"));
    await waitFor(() => expect(result.current.translation).toBe("Hindi"));
    expect(result.current.versionLabel).toBe("Hindi · HHBD");
    expect(result.current.showSuggestions).toBe(false);
    expect(result.current.translations[0].id).toBe("Hindi");
  });
  it("switches to the new interface language's edition instead of silently searching English", async () => {
    const { result, rerender } = renderHook(({ language }) => useSearchTranslation(language, null), { initialProps: { language: "en" } });
    await waitFor(() => expect(result.current.translation).toBe("Berean"));
    rerender({ language: "hi" });
    await waitFor(() => expect(result.current.translation).toBe("Hindi"));
    expect(result.current.showSuggestions).toBe(false);
  });
  it("rejects unavailable explicit editions, but allows selection of a real edition", async () => {
    const { result } = renderHook(() => useSearchTranslation("en", "Missing"));
    await waitFor(() => expect(result.current.error).toContain("unavailable"));
    expect(result.current.translation).toBeNull();
    act(() => result.current.setTranslation("Missing"));
    expect(result.current.translation).toBeNull();
    act(() => result.current.setTranslation("KJV"));
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem("preferred_translation")).toBe("KJV");
  });
  it("does not fall back to English if the current language has no Bible", async () => {
    const { result } = renderHook(() => useSearchTranslation("as", null));
    await waitFor(() => expect(result.current.error).toContain("No Bible edition"));
    expect(result.current.translation).toBeNull();
  });
  it("can retry a failed catalogue request", async () => {
    vi.mocked(bibleApi.getTranslations).mockRejectedValueOnce(new Error("Offline"));
    const { result } = renderHook(() => useSearchTranslation("en", null));
    await waitFor(() => expect(result.current.error).toBe("Offline"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.translation).toBe("Berean"));
    expect(result.current.error).toBeNull();
  });
});

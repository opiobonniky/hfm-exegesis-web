import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSearchReaderAction } from "./useSearchReaderAction";
import type { ChapterData } from "../types";

const chapters: ChapterData[] = [{ book: "John", chapter: 1, testament: "New", verses: [{ verse: 1, text: "In the beginning" }] }];
describe("Search result reader actions", () => {
  it.each(["note", "highlight"])("opens %s only once, after the matching edition and verse are loaded", action => {
    const onAction = vi.fn();
    const params = new URLSearchParams(`action=${action}&book=John&chapter=1&verse=1&translation=KJV`);
    const { rerender } = renderHook(({ loading, versionId, data }) => useSearchReaderAction({ params, chapters: data, loading, versionId, onAction }), {
      initialProps: { loading: true, versionId: "Berean", data: [] as ChapterData[] },
    });
    expect(onAction).not.toHaveBeenCalled();
    rerender({ loading: false, versionId: "Berean", data: chapters });
    expect(onAction).not.toHaveBeenCalled();
    rerender({ loading: false, versionId: "KJV", data: chapters });
    expect(onAction).toHaveBeenCalledExactlyOnceWith(action, "John", 1, 1);
    rerender({ loading: false, versionId: "KJV", data: [...chapters] });
    expect(onAction).toHaveBeenCalledTimes(1);
  });
  it.each(["delete", "note&verse=99", "note&verse=-1"])("does not execute invalid or nonexistent targets: %s", action => {
    const onAction = vi.fn();
    const params = new URLSearchParams(`action=${action}&book=John&chapter=1`);
    if (!params.has("verse")) params.set("verse", "1");
    renderHook(() => useSearchReaderAction({ params, chapters, loading: false, versionId: "Berean", onAction }));
    expect(onAction).not.toHaveBeenCalled();
  });
});

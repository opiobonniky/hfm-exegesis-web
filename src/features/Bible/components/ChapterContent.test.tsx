import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { MutableRefObject } from "react";
import ChapterContent from "./ChapterContent";
import type { ChapterData } from "../types";

// ── Helpers ──

const chapters: ChapterData[] = [
  {
    book: "John",
    chapter: 3,
    testament: "new",
    verses: [
      { verse: 16, text: "For God so loved the world…" },
      { verse: 17, text: "For God didn't send his Son…" },
    ],
  },
];

/** The toolbar is the only element carrying these aria-labels. */
function getToolbars(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll('[aria-label^="More actions for"]');
}

/** The reader hook seeds these refs with empty records, not null. */
function emptyRecordRef<T>(): MutableRefObject<Record<string, T>> {
  return { current: {} };
}

function renderChapterContent(toolbarHidden: boolean) {
  const props = {
    chapters,
    selectedVerses: [] as string[],
    highlights: {},
    favorites: new Set<string>(),
    verseNotes: {},
    onToggleVerse: () => {},
    onToggleHighlight: () => {},
    onToggleFavorite: () => {},
    onExplainVerse: () => {},
    onOpenVerseActions: () => {},
    chapterRefs: emptyRecordRef<HTMLDivElement>(),
    verseRefs: emptyRecordRef<HTMLSpanElement | null>(),
  };
  return render(<ChapterContent {...props} toolbarHidden={toolbarHidden} />);
}

// ── Tests ──

describe("ChapterContent verse toolbar visibility", () => {
  it("renders a toolbar for every verse while no overlay is open", () => {
    const { container } = renderChapterContent(false);
    expect(getToolbars(container)).toHaveLength(chapters[0].verses.length);
  });

  it("renders no toolbar at all while a verse overlay is open", () => {
    const { container } = renderChapterContent(true);
    expect(getToolbars(container)).toHaveLength(0);
  });

  it("still renders the verse text while the toolbar is hidden", () => {
    const { container } = renderChapterContent(true);
    expect(container.textContent).toContain("For God so loved the world");
  });

  it("restores the toolbars when the overlay closes", () => {
    const { container, rerender } = renderChapterContent(true);
    expect(getToolbars(container)).toHaveLength(0);

    rerender(
      <ChapterContent
        chapters={chapters}
        selectedVerses={[]}
        highlights={{}}
        favorites={new Set<string>()}
        verseNotes={{}}
        onToggleVerse={() => {}}
        onToggleHighlight={() => {}}
        onToggleFavorite={() => {}}
        onExplainVerse={() => {}}
        onOpenVerseActions={() => {}}
        chapterRefs={emptyRecordRef<HTMLDivElement>()}
        verseRefs={emptyRecordRef<HTMLSpanElement | null>()}
        toolbarHidden={false}
      />,
    );
    expect(getToolbars(container)).toHaveLength(chapters[0].verses.length);
  });
});

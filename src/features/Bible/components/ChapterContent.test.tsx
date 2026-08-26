import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MutableRefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import ChapterContent from "./ChapterContent";

describe("ChapterContent", () => {
  it("exposes verse selection to keyboard and assistive technology", async () => {
    const onToggleVerse = vi.fn();
    render(
      <ChapterContent
        chapters={[{
          book: "Genesis",
          chapter: 1,
          testament: "OT",
          verses: [{ verse: 1, text: "In the beginning" }],
        }]}
        selectedVerses={[]}
        highlights={{}}
        favorites={new Set()}
        verseNotes={{}}
        onToggleVerse={onToggleVerse}
        onToggleHighlight={vi.fn()}
        onToggleFavorite={vi.fn()}
        onExplainVerse={vi.fn()}
        chapterRefs={{ current: {} } as MutableRefObject<Record<string, HTMLDivElement>>}
        verseRefs={{ current: {} } as MutableRefObject<Record<string, HTMLSpanElement | null>>}
      />,
    );

    const verse = screen.getByRole("button", { name: /^Genesis 1:1\. In the beginning$/ });
    expect(verse.getAttribute("aria-pressed")).toBe("false");

    verse.focus();
    await userEvent.keyboard("{Enter}");
    expect(onToggleVerse).toHaveBeenCalledWith("Genesis-1-1");
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { StrongsWord } from "../hooks/useStrongsDictionaryPage";
import { WordDetail } from "./WordDetail";

vi.mock("@/components/Routes/routes", () => ({ routePaths: { bibleReader: "/bible-reader" } }));
vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (text: string) => text }));

const studyWord: StrongsWord = {
  strongsNumber: "H1121", language: "hebrew", hebrewWord: "", transliteration: "",
  pronunciation: "", meaning: "", strongsDef: "", kjvOccurrences: 0,
  contextualStudies: [{
    surfaceText: "Sons", customDefinition: "Gad’s descendants", sortOrder: 0, themes: [],
    reference: { bookName: "Numbers", chapter: 1, verseNumber: 24, verseEnd: 25, bibleVersion: "BSB" },
  }],
};

describe("Strong’s word detail", () => {
  it("separates the general definition from notes for a clickable passage", () => {
    render(<MemoryRouter><WordDetail word={{ ...studyWord, strongsDef: "Son, child, or descendant" }}
      isFavorited={false} onToggleFavorite={vi.fn()} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Dictionary definition" })).toBeInTheDocument();
    expect(screen.getByText("Son, child, or descendant")).toBeInTheDocument();
    expect(screen.getByText("Gad’s descendants")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Numbers 1:24–25" })).toHaveAttribute("href", "/bible-reader?book=Numbers&chapter=1&verse=24");
  });

  it("shows the verse explanation even without a dictionary entry", () => {
    render(<MemoryRouter><WordDetail word={{ ...studyWord, hasDictionaryEntry: false }}
      isFavorited={false} onToggleFavorite={vi.fn()} /></MemoryRouter>);
    expect(screen.getByText(/No dictionary entry is available/)).toBeInTheDocument();
    expect(screen.getByText("Gad’s descendants")).toBeInTheDocument();
  });
});

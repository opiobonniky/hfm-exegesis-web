import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SearchHeader } from "./SearchHeader";
import SearchInitialState from "./SearchInitialState";
import SearchResultCard from "./SearchResultCard";
import { createRef } from "react";

afterEach(cleanup);
describe("Bible-only search interface", () => {
  it("has no multi-scope tabs, mirrors RTL controls and submits on Enter", () => {
    const onSubmit = vi.fn();
    render(<SearchHeader isRtl inputRef={createRef<HTMLInputElement>()} query="faith" onChange={vi.fn()} onSubmit={onSubmit}
      onClear={vi.fn()} onBack={vi.fn()} translation="Berean" translations={[]} versionLabel="BSB" onTranslationChange={vi.fn()}
      versionLoading={false} books={["John"]} bookName="John" onBookChange={vi.fn()} covenant="nt" onCovenantChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("dir", "rtl");
    expect(screen.queryByText("Journal")).not.toBeInTheDocument();
    expect(screen.queryByText("Lemma")).not.toBeInTheDocument();
    expect(screen.queryByText("Strong's")).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole("search"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Clear search" })).toHaveClass("left-2.5");
  });
  it("hides English suggestion chips for non-English Bibles and permits clearing popular terms", () => {
    const onClearPopular = vi.fn();
    render(<SearchInitialState searchHistory={[]} popularSearches={[{ query: "प्रेम" }]} versionName="Hindi Bible" showSuggestions={false}
      onHistoryTap={vi.fn()} onRemoveHistory={vi.fn()} onClearHistory={vi.fn()} onPopularTap={vi.fn()} onSuggestion={vi.fn()} onClearPopular={onClearPopular} />);
    expect(screen.queryByRole("button", { name: "faith" })).not.toBeInTheDocument();
    expect(screen.getByText(/Hindi Bible/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear popular searches" }));
    expect(onClearPopular).toHaveBeenCalledTimes(1);
  });
  it("exposes Open, Study, Add Note and Save without executing markup in a headline", () => {
    const onOpen = vi.fn(), onStudy = vi.fn(), onSave = vi.fn(), onAddNote = vi.fn();
    render(<SearchResultCard ref_="John 3:16" verseText="Love" headline={'<mark>Love</mark> <img src=x onerror=alert(1)>'}
      translationAbbr="BSB" onOpen={onOpen} onStudy={onStudy} onSave={onSave} onAddNote={onAddNote} />);
    expect(document.querySelector("img")).toBeNull();
    expect(screen.getByText("Love").closest('[translate="no"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open John 3:16" }));
    fireEvent.click(screen.getByRole("button", { name: "Study" }));
    fireEvent.click(screen.getByRole("button", { name: "Add Note" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    for (const callback of [onOpen, onStudy, onSave, onAddNote]) expect(callback).toHaveBeenCalledTimes(1);
  });
});

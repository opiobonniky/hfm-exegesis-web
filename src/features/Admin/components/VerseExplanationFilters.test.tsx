import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { VerseExplanationFilters } from "./VerseExplanationFilters";

vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (text: string) => text }));

afterEach(cleanup);

it("offers book, chapter and creator/updater name filters", () => {
  const onBookChange = vi.fn();
  const onChapterChange = vi.fn();
  const onCreatorNameChange = vi.fn();
  const onClear = vi.fn();

  render(
    <VerseExplanationFilters
      bookName="John"
      chapter="3"
      creatorName="John"
      onBookChange={onBookChange}
      onChapterChange={onChapterChange}
      onCreatorNameChange={onCreatorNameChange}
      onClear={onClear}
    />,
  );

  fireEvent.change(screen.getByLabelText("Filter by book"), { target: { value: "Romans" } });
  expect(onBookChange).toHaveBeenCalledWith("Romans");

  fireEvent.change(screen.getByLabelText("Filter by chapter"), { target: { value: "8" } });
  expect(onChapterChange).toHaveBeenCalledWith("8");

  fireEvent.change(screen.getByLabelText("Filter by creator or updater name"), {
    target: { value: "Ada" },
  });
  expect(onCreatorNameChange).toHaveBeenCalledWith("Ada");

  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(onClear).toHaveBeenCalledTimes(1);
});

it("hides the clear button when nothing is filtered", () => {
  render(
    <VerseExplanationFilters
      bookName=""
      chapter=""
      creatorName=""
      onBookChange={vi.fn()}
      onChapterChange={vi.fn()}
      onCreatorNameChange={vi.fn()}
      onClear={vi.fn()}
    />,
  );
  expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
});

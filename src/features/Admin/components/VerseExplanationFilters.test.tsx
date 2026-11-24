import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { VerseExplanationFilters } from "./VerseExplanationFilters";

vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (text: string) => text }));
vi.mock("@/components/ui/combobox", () => ({
  Combobox: ({
    options,
    value,
    onChange,
    disabled,
    ariaLabel,
    searchPlaceholder,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    ariaLabel?: string;
    searchPlaceholder: string;
  }) => (
    <select
      aria-label={ariaLabel || searchPlaceholder}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

afterEach(cleanup);

function renderFilters(
  overrides: Partial<Parameters<typeof VerseExplanationFilters>[0]> = {},
) {
  const handlers = {
    onBookChange: vi.fn(),
    onChapterChange: vi.fn(),
    onCreatorNameChange: vi.fn(),
    onClear: vi.fn(),
  };
  render(
    <VerseExplanationFilters
      bookName="John"
      chapter="3"
      creatorName="John"
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

it("uses searchable book and chapter selectors plus a name filter", () => {
  const handlers = renderFilters();

  const book = screen.getByLabelText("Filter by book") as HTMLSelectElement;
  expect(book.value).toBe("John");
  expect([...book.options].some((option) => option.value === "Romans")).toBe(true);
  fireEvent.change(book, { target: { value: "Romans" } });
  expect(handlers.onBookChange).toHaveBeenCalledWith("Romans");

  const chapter = screen.getByLabelText("Filter by chapter") as HTMLSelectElement;
  expect(chapter.disabled).toBe(false);
  expect([...chapter.options].some((option) => option.value === "3")).toBe(true);
  fireEvent.change(chapter, { target: { value: "8" } });
  expect(handlers.onChapterChange).toHaveBeenCalledWith("8");

  fireEvent.change(screen.getByLabelText("creator or updater name"), {
    target: { value: "Ada" },
  });
  expect(handlers.onCreatorNameChange).toHaveBeenCalledWith("Ada");

  fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
  expect(handlers.onClear).toHaveBeenCalledTimes(1);
});

it("disables chapter until a book is selected", () => {
  renderFilters({ bookName: "", chapter: "", creatorName: "" });
  expect((screen.getByLabelText("Filter by chapter") as HTMLSelectElement).disabled).toBe(true);
  expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
});

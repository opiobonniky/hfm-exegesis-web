import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JournalEntryCard } from "./JournalEntryCard";
vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (v: string) => v }));
const entry = { id: 7, userId: "owner", title: "A prayer", content: "Reflection", isPublished: false };
describe("Journal card gestures and actions", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal("PointerEvent", MouseEvent); });
  afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
  it("starts selection on a hold without opening the entry", () => {
    const select = vi.fn(), view = vi.fn(); render(<JournalEntryCard entry={entry} onBeginSelection={select} onView={view} />);
    const card = screen.getByRole("button", { name: "A prayer" });
    fireEvent.pointerDown(card, { button: 0, clientX: 10, clientY: 10 }); act(() => vi.advanceTimersByTime(450));
    fireEvent.pointerUp(card); fireEvent.click(card);
    expect(select).toHaveBeenCalledWith(7); expect(view).not.toHaveBeenCalled();
  });
  it("cancels a hold when scrolling and supports keyboard selection", () => {
    const select = vi.fn(); render(<JournalEntryCard entry={entry} onBeginSelection={select} onView={vi.fn()} />);
    const card = screen.getByRole("button", { name: "A prayer" });
    fireEvent.pointerDown(card, { button: 0, clientX: 0, clientY: 0 }); fireEvent.pointerMove(card, { clientX: 20, clientY: 20 }); act(() => vi.advanceTimersByTime(500));
    expect(select).not.toHaveBeenCalled(); fireEvent.keyDown(card, { key: " " }); expect(select).toHaveBeenCalledWith(7);
  });
  it("shows privacy and separate PDF/share actions without opening the card", () => {
    const action = vi.fn(), view = vi.fn(); render(<JournalEntryCard entry={entry} onAction={action} onView={view} />);
    expect(screen.getByText("Private")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Download PDF" })); fireEvent.click(screen.getByRole("button", { name: "Share entry" }));
    expect(action.mock.calls.map(c => c[0])).toEqual(["pdf", "share"]); expect(view).not.toHaveBeenCalled(); expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});

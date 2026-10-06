import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import VerseActionSheet from "./VerseActionSheet";

vi.mock("../hooks/useResourceSectionCounts", () => ({
  useResourceSectionCounts: () => ({ countOf: () => null }),
}));

const renderSheet = () => {
  const onOpenChange = vi.fn();
  const onStartLab = vi.fn();
  const noop = vi.fn();

  render(
    <VerseActionSheet
      open
      onOpenChange={onOpenChange}
      target={{ book: "John", chapter: 1, verse: 1, text: "In the beginning" }}
      isRtl={false}
      labels={{}}
      onExplain={noop}
      onStartLab={onStartLab}
      onOpenResources={noop}
      onDevotional={noop}
      onStudyTools={noop}
      onStrongs={noop}
      onTrivia={noop}
      onListen={noop}
      onHighlight={noop}
      onNote={noop}
      onJournal={noop}
      onFavorite={noop}
      onSearch={noop}
      onShare={noop}
      onCopy={noop}
    />,
  );

  return { onOpenChange, onStartLab };
};

describe("VerseActionSheet Lab steps", () => {
  it("renders the app-style Lab card, numbered steps, and described action rows", () => {
    renderSheet();

    expect(screen.getByText("Lab project")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Open Verse in Lab/i })).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();
    expect(screen.getByText("Hear this verse read aloud.")).toBeInTheDocument();
    expect(screen.getByText("Copy the verse text and reference.")).toBeInTheDocument();
  });

  it("starts Look directly", async () => {
    const user = userEvent.setup();
    const { onOpenChange, onStartLab } = renderSheet();

    await user.click(screen.getByText("Look").closest("button")!);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onStartLab).toHaveBeenCalledWith("look");
  });

  it("navigates to a later step without a pre-navigation modal", async () => {
    const user = userEvent.setup();
    const { onOpenChange, onStartLab } = renderSheet();

    await user.click(screen.getByRole("button", { name: /Abide/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onStartLab).toHaveBeenCalledWith("abide");
    expect(screen.queryByText("Start with Step 1")).not.toBeInTheDocument();
  });
});

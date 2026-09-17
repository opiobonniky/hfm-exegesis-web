import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RichText from "./RichText";

describe("RichText", () => {
  it("renders null for empty text", () => {
    const { container } = render(<RichText text="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders plain text as a paragraph", () => {
    render(<RichText text="God is love." />);
    expect(screen.getByText("God is love.").tagName).toBe("P");
  });

  it("renders ## section headers as headings", () => {
    render(<RichText text={"## Introduction\nJohn presents Jesus as the Word."} />);
    expect(screen.getByRole("heading", { name: "Introduction" })).toBeInTheDocument();
    expect(screen.getByText("John presents Jesus as the Word.")).toBeInTheDocument();
  });

  it("renders ### sub-headers as sub-headings", () => {
    render(<RichText text="### Original Language" />);
    expect(screen.getByRole("heading", { name: "Original Language" })).toBeInTheDocument();
  });

  it("renders **bold** markers as <strong>", () => {
    render(<RichText text="**Passage context:** the verse speaks to the heart." />);
    const strong = screen.getByText("Passage context:");
    expect(strong.tagName).toBe("STRONG");
    expect(screen.getByText(/the verse speaks to the heart/)).toBeInTheDocument();
  });

  it("renders *italic* markers as <em>", () => {
    render(<RichText text={'The verse opens with *"I can do all things…"*'} />);
    const em = screen.getByText('"I can do all things…"');
    expect(em.tagName).toBe("EM");
  });

  it("keeps the rest of a mixed line as plain text", () => {
    render(<RichText text={"**Key terms to observe:** ἀγαπάω (agapaō) — to love"} />);
    expect(screen.getByText("Key terms to observe:")).toBeInTheDocument();
    expect(screen.getByText(/agapaō/)).toBeInTheDocument();
  });

  it("renders bullet list items as <li> inside a <ul>", () => {
    render(<RichText text={"**Commands to obey:**\n• Believe in the Son\n• Love one another"} />);
    const list = document.querySelector("ul");
    expect(list).not.toBeNull();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain("Believe in the Son");
    expect(items[1].textContent).toContain("Love one another");
    // The bold label stays a paragraph, not part of the list
    expect(screen.getByText("Commands to obey:")).toBeInTheDocument();
  });

  it("renders numbered list items as <li> inside an <ol>", () => {
    render(<RichText text={"1. **About God —** what does He reveal?\n2. **About humanity —** our need and hope."} />);
    const ol = document.querySelector("ol");
    expect(ol).not.toBeNull();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain("About God —");
  });

  it("splits paragraphs on blank lines and keeps single line breaks", () => {
    render(
      <RichText
        text={"**See it in context** — the verses around Philippians 4:13:\nVerse 10: I rejoice in the Lord.\nVerse 11: You were concerned.\n\nThis final note lands with weight."}
      />,
    );
    expect(screen.getByText("This final note lands with weight.")).toBeInTheDocument();
    expect(screen.getByText(/See it in context/)).toBeInTheDocument();
    expect(screen.getByText(/Verse 10: I rejoice in the Lord/)).toBeInTheDocument();
    expect(screen.getByText(/Verse 11: You were concerned/)).toBeInTheDocument();
  });

  it("applies the className to the wrapper", () => {
    const { container } = render(<RichText text="Hello" className="text-sm text-foreground/80" />);
    expect(container.firstChild).toHaveClass("text-sm");
    expect(container.firstChild).toHaveClass("text-foreground/80");
  });

  it("handles a full structured study-notes payload end to end", () => {
    render(
      <RichText
        text={
          "## Introduction\nJohn presents Jesus as the eternal Word.\n\n" +
          "## Teaching\nJesus is the divine Son of God.\n\n" +
          '**Directives in the text:** the verse contains *"believe"* — a response is asked of us.'
        }
      />,
    );
    expect(screen.getByRole("heading", { name: "Introduction" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Teaching" })).toBeInTheDocument();
    expect(screen.getByText("Directives in the text:")).toBeInTheDocument();
    expect(screen.getByText(/a response is asked of us/)).toBeInTheDocument();
  });
});

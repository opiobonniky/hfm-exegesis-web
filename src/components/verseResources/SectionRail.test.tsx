import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionRail, SectionPager } from "./SectionRail";
import { RESOURCE_SECTIONS, sectionHasContent } from "./constants";

// ── sectionHasContent ──

describe("sectionHasContent", () => {
  it("is false only when the count is known to be zero", () => {
    expect(sectionHasContent(0)).toBe(false);
  });

  it("is true for positive counts and unknown counts", () => {
    expect(sectionHasContent(3)).toBe(true);
    expect(sectionHasContent(1)).toBe(true);
    expect(sectionHasContent(null)).toBe(true);
    expect(sectionHasContent(undefined)).toBe(true);
  });
});

// ── SectionRail ──

describe("SectionRail", () => {
  it("renders every section when counts are unknown", () => {
    render(<SectionRail activeSection="explanation" onSectionChange={() => {}} />);
    expect(screen.getAllByRole("tab")).toHaveLength(RESOURCE_SECTIONS.length);
  });

  it("hides sections whose count is zero", () => {
    render(
      <SectionRail
        activeSection="explanation"
        onSectionChange={() => {}}
        counts={{ commentaries: 0, crossReferences: 0, explanation: 1 }}
      />,
    );
    const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(tabs.some((label) => label?.includes("Commentaries"))).toBe(false);
    expect(tabs.some((label) => label?.includes("Cross Refs"))).toBe(false);
    expect(tabs.some((label) => label?.includes("Explanation"))).toBe(true);
  });

  it("keeps the active section visible even when it is empty", () => {
    render(
      <SectionRail
        activeSection="commentaries"
        onSectionChange={() => {}}
        counts={{ commentaries: 0 }}
      />,
    );
    const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(tabs.some((label) => label?.includes("Commentaries"))).toBe(true);
  });

  it("keeps uncounted sections visible (null/undefined counts)", () => {
    render(
      <SectionRail
        activeSection="explanation"
        onSectionChange={() => {}}
        counts={{ explanation: 2 }}
      />,
    );
    expect(screen.getAllByRole("tab")).toHaveLength(RESOURCE_SECTIONS.length);
  });
});

// ── SectionPager ──

describe("SectionPager", () => {
  it("skips empty sections when stepping forward", () => {
    // Rail order: explanation, commentaries, crossReferences, … — with
    // commentaries empty, "next" from explanation must be crossReferences.
    render(
      <SectionPager
        activeSection="explanation"
        onSectionChange={() => {}}
        counts={{ commentaries: 0, crossReferences: 4 }}
      />,
    );
    expect(screen.getByText("Cross References")).toBeInTheDocument();
    expect(screen.queryByText("Commentaries")).not.toBeInTheDocument();
  });

  it("steps into the active section even when it is empty", () => {
    render(
      <SectionPager
        activeSection="commentaries"
        onSectionChange={() => {}}
        counts={{ commentaries: 0, crossReferences: 4 }}
      />,
    );
    // "Previous" (explanation) and "Next" (crossReferences) both border the
    // empty-but-active commentaries section.
    expect(screen.getByText("Cross References")).toBeInTheDocument();
  });

  it("renders nothing when no section has content and none is active", () => {
    const { container } = render(
      <SectionPager
        activeSection="explanation"
        onSectionChange={() => {}}
        counts={Object.fromEntries(
          RESOURCE_SECTIONS.filter((s) => s.id !== "explanation").map((s) => [s.id, 0]),
        )}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});

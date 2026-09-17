import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RESOURCE_SECTIONS,
  getResourceSection,
  sectionHasContent,
} from "./constants";
import type { ResourceSection } from "./constants";

/** Counts come from the backend; `null`/`undefined` means "not counted yet". */
export type SectionCounts = Record<string, number | null | undefined>;

/**
 * Sections that are worth showing: everything without a known-zero count.
 * The active section is always included, so the reader never loses the tab
 * they came in on even if it turns out to be empty (it then shows its own
 * empty state instead of vanishing mid-read).
 */
function visibleSections(counts: SectionCounts | undefined, activeSection?: string): ResourceSection[] {
  return RESOURCE_SECTIONS.filter(
    (section) =>
      section.id === activeSection || sectionHasContent(counts?.[section.id]),
  );
}

// ── SectionRail ───────────────────────────────────────────────────────────

export function SectionRail({
  activeSection,
  onSectionChange,
  counts,
}: {
  activeSection: string;
  onSectionChange: (id: string) => void;
  counts?: SectionCounts;
}) {
  return (
    <div
      role="tablist"
      aria-label="Study sections"
      className="flex items-center gap-1.5 overflow-x-auto scrollbar-none"
    >
      {visibleSections(counts, activeSection).map((section) => {
        const isActive = section.id === activeSection;
        const count = counts?.[section.id];
        const IconComp = section.icon;
        return (
          <button
            key={section.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-[0.97]",
              isActive
                ? "border-transparent text-white shadow-sm"
                : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-muted",
            )}
            style={isActive ? { backgroundColor: section.color } : undefined}
          >
            <IconComp className="size-3.5" strokeWidth={2.4} />
            {section.label}
            {typeof count === "number" && count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-extrabold tabular-nums",
                  isActive ? "bg-white/25" : "bg-muted text-foreground/70",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── SectionIntro ──────────────────────────────────────────────────────────

/** Heading shown above the active section's content. */
export function SectionIntro({
  sectionId,
  count,
}: {
  sectionId: string;
  count?: number;
}) {
  const section = getResourceSection(sectionId);
  const Icon = section.icon;

  return (
    <div className="mb-3 flex items-start gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${section.color}18` }}
      >
        <Icon className="size-4" style={{ color: section.color }} strokeWidth={2.3} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground">{section.heading}</h2>
          {typeof count === "number" && count > 0 && (
            <span
              className="rounded-full px-1.5 text-[10px] font-extrabold tabular-nums"
              style={{ backgroundColor: `${section.color}18`, color: section.color }}
            >
              {count}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {section.description}
        </p>
      </div>
    </div>
  );
}

// ── SectionPager ──────────────────────────────────────────────────────────

/**
 * Prev/next section navigation, so a section feels like a page you read.
 * Steps through the sections that actually have content for this verse —
 * empty ones are skipped rather than dead-ending in an empty state.
 */
export function SectionPager({
  activeSection,
  onSectionChange,
  counts,
}: {
  activeSection: string;
  onSectionChange: (id: string) => void;
  counts?: SectionCounts;
}) {
  const sections = visibleSections(counts, activeSection);
  const index = sections.findIndex((s) => s.id === activeSection);
  const previous: ResourceSection | undefined = sections[index - 1];
  const next: ResourceSection | undefined = sections[index + 1];
  if (!previous && !next) return null;

  return (
    <div className="mt-6 grid grid-cols-2 gap-2 border-t border-border/50 pt-4">
      {previous ? (
        <button
          onClick={() => onSectionChange(previous.id)}
          className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.2} />
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Previous
            </span>
            <span className="block truncate text-xs font-bold text-foreground">
              {previous.heading}
            </span>
          </span>
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button
          onClick={() => onSectionChange(next.id)}
          className="flex min-w-0 items-center justify-end gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-right transition-colors hover:bg-muted"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Next
            </span>
            <span className="block truncate text-xs font-bold text-foreground">
              {next.heading}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}

// ── SectionEmpty ──────────────────────────────────────────────────────────

/** Empty state that still tells the reader what the section is for. */
export function SectionEmpty({
  sectionId,
  loading,
  error,
}: {
  sectionId: string;
  loading?: boolean;
  error?: string | null;
}) {
  const section = getResourceSection(sectionId);
  const Icon = section.icon;

  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <span
        className="mb-3 flex size-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${section.color}14` }}
      >
        <Icon className="size-5" style={{ color: section.color }} strokeWidth={2} />
      </span>
      <p className="text-sm font-bold text-foreground">
        {loading ? `Loading ${section.heading.toLowerCase()}…` : `No ${section.heading.toLowerCase()}`}
      </p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {error || section.emptyHint}
      </p>
    </div>
  );
}

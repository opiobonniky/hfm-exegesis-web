// useResourceSectionCounts — how much study content exists for a verse.
//
// The reader's verse menu shows a count beside each resource action so the
// reader knows what is there before tapping. Counts come from the lightweight
// `verse-resources/section-counts` endpoint (no section payload is built), and
// are cached per verse for the session so reopening the menu is instant.
import { useCallback, useEffect, useState } from "react";
import { getResourceSectionCounts } from "@/services/verseResourcesApi";
import type { ResourceSectionCounts } from "@/services/verseResourcesApi";

const countsCache = new Map<string, ResourceSectionCounts>();

const cacheKey = (bookName: string, chapter: number, verse: number) =>
  `${bookName}:${chapter}:${verse}`;

export function useResourceSectionCounts({
  enabled,
  bookName,
  chapter,
  verse,
}: {
  /** Only fetch while the menu is actually open. */
  enabled: boolean;
  bookName?: string;
  chapter?: number;
  verse?: number;
}) {
  const key =
    bookName && chapter && verse ? cacheKey(bookName, chapter, verse) : "";

  const [counts, setCounts] = useState<ResourceSectionCounts | null>(
    key ? countsCache.get(key) ?? null : null,
  );

  useEffect(() => {
    if (!enabled || !bookName || !chapter || !verse) return;

    const cached = countsCache.get(cacheKey(bookName, chapter, verse));
    if (cached) {
      setCounts(cached);
      return;
    }

    let cancelled = false;
    getResourceSectionCounts(bookName, chapter, verse).then((result) => {
      if (cancelled || !result) return;
      countsCache.set(cacheKey(bookName, chapter, verse), result);
      setCounts(result);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, bookName, chapter, verse]);

  // Drop stale counts when the target verse changes.
  useEffect(() => {
    setCounts(key ? countsCache.get(key) ?? null : null);
  }, [key]);

  /**
   * Entry count for one section, ready to feed straight into a badge.
   * Returns `null` when the count isn't known — either it hasn't loaded yet
   * or the backend doesn't count that section (translations, book context) —
   * so callers can leave those actions alone rather than calling them empty.
   */
  const countOf = useCallback(
    (section: string): number | null => {
      if (!counts || !(section in counts)) return null;
      return counts[section] ?? 0;
    },
    [counts],
  );

  return { counts, countOf };
}

// useSearchSectionHeadings — resolves the section heading for bible-scope
// search results so cards can show reading context (e.g. "The Seventh Day")
// consistent with the Bible reader.
import { useEffect, useState } from "react";
import type { SearchResult } from "@/services/searchApi";
import { getHeadingForVerse } from "@/services/chapterHeadings";

export function useSearchSectionHeadings(
  results: SearchResult[],
  translation: string,
  lang?: string,
) {
  const [headingMap, setHeadingMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const bibleResults = results.filter((r) => r?.book_name && r?.chapter);
    if (bibleResults.length === 0) {
      setHeadingMap({});
      return;
    }

    let cancelled = false;
    // Dedup by Book-Chapter-Verse; each card's heading covers from its verse
    // until the next heading, so per-verse resolution is correct.
    const unique = new Map(
      bibleResults.map((r) => [
        `${r.book_name}|${r.chapter}|${r.verse}`,
        r,
      ]),
    );

    Promise.all(
      [...unique.entries()].map(async ([key, r]) => {
        const heading = await getHeadingForVerse(
          translation,
          r.book_name,
          r.chapter,
          r.verse,
          lang,
        );
        return [key, heading] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const [key, heading] of entries) {
        if (heading) next[key] = heading;
      }
      setHeadingMap(next);
    });

    return () => {
      cancelled = true;
    };
  }, [results, translation, lang]);

  return headingMap;
}

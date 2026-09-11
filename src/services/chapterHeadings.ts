// chapterHeadings — cached access to Bible chapter section headings.
//
// A module-level cache means:
//  - Back-navigation to a previously read chapter renders headings instantly
//    (no network round-trip), matching the instant verse render.
//  - Multiple consumers (Bible reader, Search results, Verse Resources) share
//    one request per Book-Chapter-language combination via in-flight dedup.
//
// The backend dataset is BSB-derived public-domain covering all 66 books and
// is translated server-side when `lang` is provided. Headings are decorative:
// failures resolve to [] and are cached so we never retry-spin.
import { bibleApi } from "./bibleApi";
import type { ChapterHeading } from "./bibleApi";

const cache = new Map<string, ChapterHeading[]>();
const inFlight = new Map<string, Promise<ChapterHeading[]>>();

const cacheKey = (
  translationId: string,
  bookName: string,
  chapter: number,
  lang?: string,
) => `${translationId}|${bookName}|${chapter}|${lang || "en"}`;

export const getChapterHeadingsCached = async (
  translationId: string,
  bookName: string,
  chapter: number,
  lang?: string,
): Promise<ChapterHeading[]> => {
  if (!bookName || !chapter) return [];
  const key = cacheKey(translationId, bookName, chapter, lang);

  const cached = cache.get(key);
  if (cached) return cached;

  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = bibleApi
    .getChapterHeadings(translationId, bookName, chapter, lang)
    .then((headings) => {
      cache.set(key, headings || []);
      inFlight.delete(key);
      return headings || [];
    })
    .catch(() => {
      cache.set(key, []);
      inFlight.delete(key);
      return [];
    });
  inFlight.set(key, promise);
  return promise;
};

/** Clear the cache (e.g. logout, or language change in tests). */
export const clearChapterHeadingsCache = () => {
  cache.clear();
  inFlight.clear();
};

/**
 * The section heading that applies to a verse: the last heading whose verse
 * number is <= the target (headings apply from their verse until the next).
 * Returns null when the chapter has no heading covering the verse.
 */
export const getHeadingForVerse = async (
  translationId: string,
  bookName: string,
  chapter: number,
  verse: number,
  lang?: string,
): Promise<string | null> => {
  const headings = await getChapterHeadingsCached(
    translationId,
    bookName,
    chapter,
    lang,
  );
  let heading: string | null = null;
  for (const h of headings) {
    if (h.verse <= verse) heading = h.heading;
    else break;
  }
  return heading;
};

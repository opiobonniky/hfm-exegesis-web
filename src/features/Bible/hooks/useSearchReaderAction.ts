import { useEffect, useRef } from "react";
import type { ChapterData } from "../types";

interface SearchReaderActionOptions {
  params: URLSearchParams;
  chapters: ChapterData[];
  loading: boolean;
  versionId: string;
  onAction: (action: "note" | "highlight", book: string, chapter: number, verse: number) => void;
}

/** Search result actions open the reader's existing editors, never silently mutate data. */
export function useSearchReaderAction({ params, chapters, loading, versionId, onAction }: SearchReaderActionOptions) {
  const consumed = useRef<string | null>(null);
  useEffect(() => {
    const action = params.get("action");
    if (action !== "note" && action !== "highlight") { consumed.current = null; return; }
    const signature = params.toString();
    if (consumed.current === signature || loading) return;
    const requestedVersion = params.get("translation");
    if (requestedVersion && versionId !== requestedVersion) return;
    const book = params.get("book");
    const chapter = Number(params.get("chapter"));
    const verse = Number(params.get("verse"));
    if (!book || !Number.isInteger(chapter) || !Number.isInteger(verse) || chapter < 1 || verse < 1) return;
    if (!chapters.some(item => item.book === book && item.chapter === chapter && item.verses.some(item => item.verse === verse))) return;
    consumed.current = signature;
    onAction(action, book, chapter, verse);
  }, [params, chapters, loading, versionId, onAction]);
}

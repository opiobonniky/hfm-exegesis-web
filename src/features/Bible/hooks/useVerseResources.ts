// useVerseResources — state, effects, and logic for the VerseResources page.
//
// The page shows one section at a time ("commentaries", "cross references",
// the explanation, …). The backend accepts a `section` param and returns only
// that section's content, so switching sections is a small, targeted request
// that gets cached for the rest of the visit.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getTranslationComparison,
  getVerseResources,
} from "@/services/verseResourcesApi";
import type {
  CommentaryEntry,
  Crossref,
  DictionaryEntry,
  ExplanationSection,
  InterlinearWord,
  StudyToolResource,
  TranslationComparisonEntry,
  VerseReferenceEntry,
  WordStudyEntry,
} from "@/services/verseResourcesApi";
import { getBookPrologue } from "@/services/bookProloguesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import { getHeadingForVerse } from "@/services/chapterHeadings";
import { DEFAULT_RESOURCE_SECTION, resolveSectionId } from "@/components/verseResources";

/** The content each section needs, already narrowed to the active section. */
export interface ResourceSectionData {
  explanation: ExplanationSection | null;
  commentaries: CommentaryEntry[];
  crossReferences: Crossref[];
  wordStudies: WordStudyEntry[];
  dictionary: DictionaryEntry[];
  interlinear: InterlinearWord[];
  topics: string[];
  verseReferences: VerseReferenceEntry[];
  studyTools: StudyToolResource[];
}

const EMPTY_SECTION_DATA: ResourceSectionData = {
  explanation: null,
  commentaries: [],
  crossReferences: [],
  wordStudies: [],
  dictionary: [],
  interlinear: [],
  topics: [],
  verseReferences: [],
  studyTools: [],
};

/** Extract the requested section's payload from a (partial) API response. */
function pickSection(section: string, payload: any): ResourceSectionData {
  if (!payload) return EMPTY_SECTION_DATA;
  switch (section) {
    case "explanation":
      return { ...EMPTY_SECTION_DATA, explanation: payload.explanation ?? null };
    case "commentaries":
      return { ...EMPTY_SECTION_DATA, commentaries: payload.commentaries ?? [] };
    case "crossReferences":
      return { ...EMPTY_SECTION_DATA, crossReferences: payload.crossReferences ?? [] };
    case "wordStudies":
      return { ...EMPTY_SECTION_DATA, wordStudies: payload.wordStudies ?? [] };
    case "dictionary":
      return {
        ...EMPTY_SECTION_DATA,
        dictionary: payload.dictionaryTerms ?? payload.dictionary ?? [],
      };
    case "interlinear":
      return {
        ...EMPTY_SECTION_DATA,
        interlinear: payload.interlinearWords ?? payload.interlinear ?? [],
      };
    case "topics": {
      const topics: string[] =
        payload.themes
        ?? payload.topics
        ?? (payload.relatedTopics ?? []).map((topic: any) =>
          typeof topic === "string" ? topic : topic?.name,
        ).filter(Boolean);
      return { ...EMPTY_SECTION_DATA, topics };
    }
    case "verseReferences":
      return { ...EMPTY_SECTION_DATA, verseReferences: payload.verseReferences ?? [] };
    case "studyTools":
      return { ...EMPTY_SECTION_DATA, studyTools: payload.studyTools ?? [] };
    default:
      return EMPTY_SECTION_DATA;
  }
}

export function useVerseResources() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const bookName = searchParams.get("book") || "";
  const chapter = parseInt(searchParams.get("chapter") || "0", 10);
  const verseNumber = parseInt(searchParams.get("verse") || "1", 10);
  const section = resolveSectionId(searchParams.get("tab"));

  const [sectionData, setSectionData] = useState<ResourceSectionData>(EMPTY_SECTION_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [translations, setTranslations] = useState<TranslationComparisonEntry[] | null>(null);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [translationsError, setTranslationsError] = useState<string | null>(null);

  const [prologue, setPrologue] = useState<BookPrologue | null>(null);
  const [prologueLoading, setPrologueLoading] = useState(false);

  const [sectionHeading, setSectionHeading] = useState<string | null>(null);
  const verseRef = `${bookName} ${chapter}:${verseNumber}`;

  // Cache keyed by section so re-visiting a section during the same visit is
  // instant and never re-hits the network.
  const cacheRef = useRef<{ key: string; sections: Record<string, ResourceSectionData> }>({
    key: "",
    sections: {},
  });

  useEffect(() => {
    cacheRef.current = { key: `${bookName}:${chapter}:${verseNumber}`, sections: {} };
  }, [bookName, chapter, verseNumber]);

  useEffect(() => {
    let cancelled = false;
    if (!bookName || !chapter) return;
    getHeadingForVerse("Berean", bookName, chapter, verseNumber).then((heading) => {
      if (!cancelled) setSectionHeading(heading);
    });
    return () => {
      cancelled = true;
    };
  }, [bookName, chapter, verseNumber]);

  // ── Fetch the active section ────────────────────────────────────────────
  useEffect(() => {
    if (!bookName || !chapter) return;
    // These two sections load through their own effects below, so clear the
    // content loading flag here — otherwise landing on them directly would
    // leave the page stuck on the skeleton.
    if (section === "prologue" || section === "translations") {
      setLoading(false);
      setError(null);
      return;
    }

    const cached = cacheRef.current.sections[section];
    if (cached) {
      setSectionData(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getVerseResources(bookName, chapter, verseNumber, section)
      .then((payload) => {
        if (cancelled || !payload) return;
        const picked = pickSection(section, payload);
        cacheRef.current.sections[section] = picked;
        if (payload.sections) setCounts(payload.sections);
        setSectionData(picked);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load this section.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookName, chapter, verseNumber, section]);

  // ── Translations (loaded only when its section is open) ─────────────────
  useEffect(() => {
    if (section !== "translations" || !bookName || !chapter) return;
    if (translations) return;

    let cancelled = false;
    setTranslationsLoading(true);
    setTranslationsError(null);
    getTranslationComparison(bookName, chapter, verseNumber)
      .then((result) => {
        if (cancelled) return;
        setTranslations(result);
        setCounts((prev) => ({ ...prev, translations: result?.length ?? 0 }));
      })
      .catch(() => {
        if (!cancelled) setTranslationsError("No translations available");
      })
      .finally(() => {
        if (!cancelled) setTranslationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section, bookName, chapter, verseNumber, translations]);

  // ── Book prologue (loaded only when its section is open) ────────────────
  useEffect(() => {
    if (section !== "prologue" || !bookName) return;
    if (prologue !== null) return;

    let cancelled = false;
    setPrologueLoading(true);
    getBookPrologue(bookName)
      .then((result) => {
        if (!cancelled) setPrologue(result);
      })
      .catch(() => {
        if (!cancelled) setPrologue(null);
      })
      .finally(() => {
        if (!cancelled) setPrologueLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section, bookName, prologue]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleSectionChange = useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("tab", id);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const goToReader = useCallback(() => {
    navigate(
      `/bible-reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseNumber}`,
    );
  }, [navigate, bookName, chapter, verseNumber]);

  const countsWithTranslations = useMemo(
    () => ({ ...counts, translations: counts.translations ?? translations?.length ?? null }),
    [counts, translations],
  );

  return {
    data: {
      bookName,
      chapter,
      verseNumber,
      verseRef,
      sectionHeading,
      section,
      defaultSection: DEFAULT_RESOURCE_SECTION,
      counts: countsWithTranslations as Record<string, number | null | undefined>,
      sectionData,
      loading,
      error,
      translations,
      translationsLoading,
      translationsError,
      prologue,
      prologueLoading,
    },
    actions: { handleSectionChange, goToReader },
  };
}

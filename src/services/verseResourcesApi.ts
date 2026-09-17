import { sendPostRequest } from "./api";

export interface CommentaryEntry {
  author: string;
  title: string;
  text: string;
}

/** One verse of the resolved passage shown around a cross reference. */
export interface ContextVerse {
  verse: number;
  text: string;
  /** True for the verse the cross reference actually points at. */
  isFocus: boolean;
}

export interface Crossref {
  /** Legacy display reference, e.g. "Romans 5:8". */
  ref: string;
  /** The authored note explaining the connection. */
  text: string;
  bookName?: string;
  chapter?: number;
  verse?: number;
  /** The actual verse text, resolved from the Bible translation. */
  verseText?: string;
  /** The referenced verse plus its surrounding verses, resolved server-side. */
  contextVerses?: ContextVerse[];
  /** Optional commentary attached to the cross reference. */
  commentary?: string;
}

export interface DictionaryEntry {
  term: string;
  pronunciation: string;
  definition: string;
  description: string;
}

export interface WordStudyEntry {
  word: string;
  transliteration: string;
  meaning: string;
  strongs?: string;
  surfaceText?: string;
  originalWord?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  language?: string;
  definition?: string;
  fullDefinition?: string;
}

export interface TopicEntry {
  name: string;
}

export interface InterlinearWord {
  original?: string;
  strongs?: string;
  transliteration?: string;
  translation?: string;
  word?: string;
  grammar?: string;
  lemma?: string;
}

/** A verse in which one of this verse's Strong's words also appears. */
export interface VerseReferenceEntry {
  strongs: string;
  originalWord?: string;
  transliteration?: string;
  definition?: string;
  surfaceText?: string;
  bookName: string;
  chapter: number;
  verse: number;
  translation?: string;
  ref: string;
}

export interface ExplanationSection {
  explanation: string;
  application: string;
  introduction: string;
  backgroundAuthor: string;
  backgroundBook: string;
  backgroundContext: string;
  finalThoughts: string;
  takeaways: string[];
  practicalApplications: string[];
}

export interface StudyToolWord {
  id: number;
  surfaceText?: string;
  strongsId?: string;
  morphology?: string | null;
  verseNumber?: number;
  strongs?: {
    transliteration?: string;
    shortDefinition?: string;
    originalWord?: string;
    adminExplanation?: string;
  } | null;
  adminExplanation?: string | null;
}

export interface StudyToolResource {
  id: number;
  toolType: string;
  label: string;
  description?: string | null;
  bookName?: string | null;
  chapter?: number | null;
  verseRefs?: {
    verse: number;
    excerpt?: string;
  }[];
  studyToolWords?: StudyToolWord[];
}

/** Entry count per section, keyed by section id. */
export type ResourceSectionCounts = Record<string, number>;

export interface VerseResourceData {
  id: number;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  /** Section this payload carries. `null` means every section was returned. */
  section?: string | null;
  /** Counts for every section so the reader can build its section rail. */
  sections?: ResourceSectionCounts;
  /** Verses shown on each side of a cross reference (0-3). */
  contextRadius?: number;
  explanation?: ExplanationSection | null;
  commentaries: CommentaryEntry[];
  crossReferences: Crossref[];
  dictionaryTerms: DictionaryEntry[];
  wordStudies: WordStudyEntry[];
  interlinearWords: InterlinearWord[];
  relatedTopics: TopicEntry[];
  themes?: string[];
  verseReferences?: VerseReferenceEntry[];
  studyTools?: StudyToolResource[];
  // Newer, more descriptive aliases returned alongside the legacy keys.
  dictionary?: DictionaryEntry[];
  interlinear?: InterlinearWord[];
  topics?: string[];
}

export interface TranslationComparisonEntry {
  version: string;
  abbreviation: string;
  id?: string;
  text: string;
}

/**
 * Entry counts per section for a verse — lets the reader's verse menu show
 * what study content exists before the reader opens anything.
 */
export const getResourceSectionCounts = async (
  bookName: string,
  chapter: number,
  verseNumber: number,
): Promise<ResourceSectionCounts | null> => {
  try {
    const res = await sendPostRequest<{ sections?: ResourceSectionCounts }>(
      "verse-resources",
      "section-counts",
      { bookName, chapter, verseNumber },
    );
    if (res.returnCode === 200 && res.returnData) {
      return res.returnData.sections ?? null;
    }
    return null;
  } catch {
    return null;
  }
};

export const getTranslationComparison = async (
  bookName: string,
  chapter: number,
  verseNumber: number,
): Promise<TranslationComparisonEntry[] | null> => {
  try {
    const res = await sendPostRequest<TranslationComparisonEntry[]>(
      "verse-resources",
      "compare-translations",
      { bookName, chapter, verseNumber },
    );
    if (res.returnCode === 200 && res.returnData) {
      return res.returnData;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Fetch verse resources. Pass `section` to receive only that one section's
 * content; omit it to receive everything (used by the admin tooling).
 */
export const getVerseResources = async (
  bookName: string,
  chapter: number,
  verseNumber: number,
  section?: string,
): Promise<VerseResourceData | null> => {
  try {
    const res = await sendPostRequest<VerseResourceData>(
      "verse-resources",
      "get",
      { bookName, chapter, verseNumber, ...(section ? { section } : {}) },
    );
    if (res.returnCode === 200 && res.returnData) {
      return res.returnData;
    }
    return null;
  } catch {
    return null;
  }
};

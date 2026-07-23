import { sendPostRequest } from "./api";

export interface CommentaryEntry {
  author: string;
  title: string;
  text: string;
}

export interface Crossref {
  ref: string;
  text: string;
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

export interface VerseResourceData {
  id: number;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  commentaries: CommentaryEntry[];
  crossReferences: Crossref[];
  dictionaryTerms: DictionaryEntry[];
  wordStudies: WordStudyEntry[];
  interlinearWords: any[];
  relatedTopics: TopicEntry[];
  studyTools?: StudyToolResource[];
}

export interface TranslationComparisonEntry {
  version: string;
  abbreviation: string;
  text: string;
}

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

export const getVerseResources = async (
  bookName: string,
  chapter: number,
  verseNumber: number,
): Promise<VerseResourceData | null> => {
  try {
    const res = await sendPostRequest<VerseResourceData>(
      "verse-resources",
      "get",
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

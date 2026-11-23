import api from "@/services/api";
import type { ContextualStudy, StrongsWord } from "../hooks/useStrongsDictionaryPage";

export interface StrongsSearchParams {
  query: string;
  language?: string;
  lang: string;
  limit: number;
  offset: number;
}

interface EntryDto {
  strongsId: string;
  originalWord?: string;
  transliteration?: string;
  pronunciation?: string;
  shortDefinition?: string;
  fullDefinition?: string;
  usageCount?: number;
  language?: string;
  adminExplanation?: string;
  hasDictionaryEntry?: boolean;
  contextualStudies?: ContextualStudy[];
  contextualStudyCount?: number;
  nextStudyOffset?: number | null;
  contentLanguage?: string;
}

interface WordsPage {
  data: EntryDto[];
  total: number;
  hasNext: boolean;
  nextOffset?: number | null;
  contentLanguage: string;
}

type Envelope<T> = { returnCode: number; returnData?: T; returnMessage?: string };

export function toStrongsWord(word: EntryDto, contentLanguage: string, browseBook?: string): StrongsWord {
  return {
    strongsNumber: word.strongsId, hasDictionaryEntry: word.hasDictionaryEntry,
    hebrewWord: word.originalWord || "", transliteration: word.transliteration || "",
    pronunciation: word.pronunciation || "", meaning: word.shortDefinition || "",
    strongsDef: word.fullDefinition || word.shortDefinition || "",
    kjvOccurrences: word.usageCount || 0, language: word.language?.toLowerCase() === "greek" ? "greek" : "hebrew",
    bdbEntry: word.adminExplanation || undefined, contextualStudies: word.contextualStudies || [],
    contextualStudyCount: word.contextualStudyCount, nextStudyOffset: word.nextStudyOffset,
    contentLanguage, browseBook,
  };
}

const translatedPage = (response: Envelope<WordsPage>, lang: string) => {
  const page = response.returnData;
  if (response.returnCode !== 200 || page?.contentLanguage !== lang || !Array.isArray(page.data) ||
    page.data.some(word => word.contentLanguage && word.contentLanguage !== lang)) {
    throw new Error(response.returnMessage || "Strong’s translation is incomplete");
  }
  return page;
};

export async function browseBookWords(book: string, language: string, lang: string, offset: number, signal: AbortSignal) {
  const { data } = await api.get<Envelope<WordsPage>>(`/strongs/book-words/${encodeURIComponent(book)}`, {
    params: { language, lang, offset, limit: 6, view: "preview" }, signal,
  });
  return translatedPage(data, lang);
}

export async function browseWordDetails(id: string, bookName: string, lang: string, studyOffset: number, signal: AbortSignal) {
  const { data } = await api.get<Envelope<EntryDto>>(`/strongs/${encodeURIComponent(id)}`, {
    params: { bookName, lang, studyOffset }, signal,
  });
  if (data.returnCode !== 200 || data.returnData?.contentLanguage !== lang) {
    throw new Error(data.returnMessage || "Strong’s translation is incomplete");
  }
  return toStrongsWord(data.returnData, lang, bookName);
}

const inFlightSearches = new Map<string, Promise<any>>();
const recentSearches = new Map<string, { expiresAt: number; response: any }>();
const SEARCH_CACHE_TTL = 15_000;

export function searchStrongs({
  query,
  language,
  lang,
  limit,
  offset,
}: StrongsSearchParams) {
  const key = JSON.stringify({
    query: query.trim().toLowerCase(),
    language: language || "all",
    lang,
    limit,
    offset,
  });

  const existingRequest = inFlightSearches.get(key);
  if (existingRequest) return existingRequest;

  const cached = recentSearches.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.response);
  }

  const request = api.get<Envelope<WordsPage>>("/strongs/search", {
    params: { q: query.trim(), language, lang, limit, offset },
  }).then(({ data }) => {
    translatedPage(data, lang);
    return data;
  }).then((response) => {
    recentSearches.set(key, { expiresAt: Date.now() + SEARCH_CACHE_TTL, response });
    return response;
  }).finally(() => inFlightSearches.delete(key));

  inFlightSearches.set(key, request);
  return request;
}

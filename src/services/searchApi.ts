import { sendPostRequest, sendGetRequest } from "./api";

export interface SearchResult {
  book_number: number;
  book_name: string;
  chapter: number;
  verse: number;
  verse_text: string;
  rank?: number;
  headline?: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  total: number;
  page: number;
  limit: number;
  data: SearchResult[];
}

export interface StrongsResult {
  id: string;
  strongsId: string;
  originalWord: string | null;
  transliteration: string | null;
  shortDefinition: string;
  language: string;
  usageCount: number | null;
}

export interface JournalSearchResult {
  id: number;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  tags?: string;
  createdAt: string;
}

export interface TopicResult {
  id: number;
  topicName: string;
  description: string | null;
  verseRefs: string | null;
}

export interface LemmaResult {
  strongsId: string;
  originalWord: string | null;
  transliteration: string | null;
  shortDefinition: string;
  language: string;
  usageCount: number | null;
}

export interface CrossTranslationResult {
  translation: string;
  translationAbbr: string;
  book_number: number;
  book_name: string;
  chapter: number;
  verse: number;
  verse_text: string;
  rank: number;
}

export interface CrossTranslationResponse {
  success: boolean;
  query: string;
  total: number;
  page: number;
  limit: number;
  data: CrossTranslationResult[];
}

export interface PopularSearchItem {
  query: string;
  scope: SearchScope;
  count: number;
}

export type SearchScope = "bible" | "strongs" | "journal" | "topics" | "lemma";

export const searchApi = {
  search: async (
    query: string,
    options?: {
      translation?: string;
      bookName?: string;
      covenant?: "all" | "ot" | "nt";
      limit?: number;
      offset?: number;
    },
  ): Promise<SearchResponse> => {
    const translationId = options?.translation || "Berean";
    const response = await sendPostRequest("translations", "search-fts", {
      query,
      translationId,
      bookName: options?.bookName || undefined,
      covenant: options?.covenant === "all" ? undefined : options?.covenant,
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
    });
    if (response.returnCode === 200 && response.returnData) {
      const rd = response.returnData;
      return {
        success: true,
        query: rd?.query || query,
        total: rd.total ?? 0,
        page: rd.page ?? 1,
        limit: rd.limit ?? 50,
        data: rd.data || [],
      };
    }
    return { success: false, query, total: 0, page: 1, limit: 50, data: [] };
  },

  searchStrongs: async (
    query: string,
    _options?: { limit?: number; offset?: number },
  ): Promise<{ data: StrongsResult[]; total: number }> => {
    try {
      const response = await sendGetRequest("strongs", "search", {
        q: query,
        limit: _options?.limit ?? 50,
        offset: _options?.offset ?? 0,
      });
      if (response.returnCode === 200 && response.returnData) {
        const rd = response.returnData;
        return { data: rd?.data ?? [], total: rd?.total ?? (rd?.data?.length ?? 0) };
      }
      return { data: [], total: 0 };
    } catch {
      return { data: [], total: 0 };
    }
  },

  searchJournal: async (
    query: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ data: JournalSearchResult[]; total: number }> => {
    const pageSize = options?.limit ?? 50;
    const page = ((options?.offset ?? 0) / pageSize) + 1;
    const res = await sendPostRequest("journal", "get-all", {
      search: query,
      page,
      pageSize,
    });
    if (res.returnCode === 200 && res.returnData) {
      const rd = res.returnData;
      const entries = (rd.entries ?? []).map((e: Record<string, unknown>) => ({
        id: e.id as number,
        title: (e.title as string) || "",
        content: (e.content as string) || (e.reflection as string) || "",
        bookName: e.bookName as string | undefined,
        chapter: e.chapter as number | undefined,
        verseNumber: e.verseNumber as number | undefined,
        tags: e.tags as string | undefined,
        createdAt: (e.createdAt as string) || (e.createdOn as string) || "",
      }));
      return { data: entries, total: rd?.totalCount ?? entries.length };
    }
    return { data: [], total: 0 };
  },

  searchTopics: async (
    query: string,
    options?: { limit?: number },
  ): Promise<{ data: TopicResult[]; total: number }> => {
    try {
      const response = await sendGetRequest("strongs", "topics/search", {
        q: query,
        limit: options?.limit ?? 50,
      });
      if (response.returnCode === 200 && response.returnData) {
        const rd = response.returnData;
        return { data: rd?.data ?? [], total: rd?.total ?? (rd?.data?.length ?? 0) };
      }
      return { data: [], total: 0 };
    } catch {
      return { data: [], total: 0 };
    }
  },

  searchLemma: async (
    query: string,
  ): Promise<{ data: LemmaResult[]; total: number }> => {
    // Lemma search reuses the strongs/search endpoint
    return searchApi.searchStrongs(query, { limit: 50 });
  },

  searchCross: async (
    query: string,
    options?: {
      translations?: string[];
      bookName?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<CrossTranslationResponse> => {
    const response = await sendPostRequest("translations", "search-cross", {
      query,
      translations: options?.translations,
      bookName: options?.bookName,
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
    });
    if (response.returnCode === 200 && response.returnData) {
      const rd = response.returnData;
      return {
        success: true,
        query: rd?.query || query,
        total: rd.total ?? 0,
        page: rd.page ?? 1,
        limit: rd.limit ?? 50,
        data: rd.data || [],
      };
    }
    return { success: false, query, total: 0, page: 1, limit: 50, data: [] };
  },

  searchRelatedWords: async (
    strongsId: string,
  ): Promise<LemmaResult[]> => {
    try {
      const response = await sendGetRequest("strongs", `search-related/${strongsId}`, {});
      if (response.returnCode === 200 && response.returnData) {
        return response.returnData as LemmaResult[];
      }
      return [];
    } catch {
      return [];
    }
  },

  logSearch: async (
    query: string,
    scope: SearchScope = "bible",
  ): Promise<void> => {
    try {
      await sendPostRequest("popular-searches", "log", { query, scope });
    } catch {
      // Silently fail
    }
  },

  getPopularSearches: async (
    options?: {
      scope?: SearchScope;
      limit?: number;
      days?: number;
    },
  ): Promise<PopularSearchItem[]> => {
    try {
      const response = await sendGetRequest("popular-searches", "", {
        scope: options?.scope,
        limit: options?.limit ?? 12,
        days: options?.days ?? 7,
      });
      if (response.returnCode === 200 && response.returnData) {
        return response.returnData as PopularSearchItem[];
      }
      return [];
    } catch {
      return [];
    }
  },
};

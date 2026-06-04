import api from "./api";

export interface Translation {
  id: string;
  name: string;
  shortName: string;
  year?: string | null;
  description: string | null;
  copyright: string | null;
  link: string | null;
}

export interface BibleBook {
  bookNumber: number;
  bookName: string;
  testament: string;
  chaptersCount: number;
  totalVerses: number;
}

export interface Chapter {
  chapterNumber: number;
  versesCount: number;
}

export interface Verse {
  verseNumber: number;
  text: string;
}

export interface VerseData {
  bookNumber: number;
  bookName: string;
  chapterNumber: number;
  verses: Verse[];
}

export interface SearchResult {
  bookNumber: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BookChapterData {
  bookNumber: number;
  bookName: string;
  chapters: Chapter[];
}

export interface BookInfo {
  bookNumber: number;
  bookName: string;
  testament: string;
  chaptersCount: number;
  totalVerses: number;
}

export interface BookWithMaxChapter extends BookInfo {
  maxChapter: number;
}

export interface BookNames {
  [key: number]: string;
}

export interface ChapterVerseData {
  bookNumber: number;
  bookName: string;
  chapterNumber: number;
  verses: Verse[];
}

const BASE_URL = "/translations";

export const bibleApi = {
  getTranslations: async (): Promise<Translation[]> => {
    const response = await api.post(`${BASE_URL}/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch translations");
  },

  getTranslation: async (translationId: string): Promise<Translation> => {
    const response = await api.post(`${BASE_URL}/${translationId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch translation");
  },

  getBooks: async (translationId: string): Promise<BookInfo[]> => {
    const response = await api.post(`${BASE_URL}/${translationId}/books`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch books");
  },

  getBooksWithMaxChapters: async (translationId: string): Promise<BookWithMaxChapter[]> => {
    const response = await api.post(`${BASE_URL}/${translationId}/books-with-max`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch books with max chapters");
  },

  getBookNames: async (): Promise<BookNames> => {
    const response = await api.get(`${BASE_URL}/books/names`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch book names");
  },

  getChapters: async (
    translationId: string,
    bookName: string
  ): Promise<BookChapterData> => {
    const response = await api.post(`${BASE_URL}/${translationId}/chapters`, {
      bookName,
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch chapters");
  },

  getVersesBatch: async (
    translationId: string,
    bookName: string,
    chapters: number[]
  ): Promise<ChapterVerseData[]> => {
    const response = await api.post(`${BASE_URL}/${translationId}/verses-batch`, {
      bookName,
      chapters,
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch verses batch");
  },

  getVerses: async (
    translationId: string,
    bookName: string,
    chapter: number
  ): Promise<VerseData> => {
    const response = await api.post(`${BASE_URL}/${translationId}/verses`, {
      bookName,
      chapter,
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch verses");
  },

  getVerse: async (
    translationId: string,
    bookName: string,
    chapter: number,
    verseNumber: number
  ): Promise<Verse> => {
    const response = await api.post(`${BASE_URL}/${translationId}/verse`, {
      bookName,
      chapter,
      verseNumber,
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch verse");
  },

  search: async (
    translationId: string,
    query: string,
    limit?: number
  ): Promise<{ count: number; query: string; data: SearchResult[] }> => {
    const response = await api.post(`${BASE_URL}/${translationId}/search`, {
      query,
      limit,
    });
    if (response.data.success) {
      return {
        count: response.data.count,
        query: response.data.query,
        data: response.data.data,
      };
    }
    throw new Error(response.data.message || "Search failed");
  },

  getChapterRange: async (
    translationId: string,
    bookName: string,
    startChapter: number,
    endChapter: number
  ): Promise<{ bookNumber: number; bookName: string; verses: Verse[] }> => {
    const response = await api.post(
      `${BASE_URL}/${translationId}/chapter-range`,
      {
        bookName,
        startChapter,
        endChapter,
      }
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch chapter range");
  },

  getReading: async (
    translationId: string,
    startBook: string,
    startChapter: number,
    endBook: string,
    endChapter: number
  ): Promise<any> => {
    const response = await api.post(`${BASE_URL}/${translationId}/reading`, {
      startBook,
      startChapter,
      endBook,
      endChapter,
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch reading");
  },
};

export const mapTranslationId = (frontendId: string): string => {
  const mapping: Record<string, string> = {
    Berean: "Berean",
    BSB: "Berean",
    KJV: "KJV",
    WEB: "GW",
    ASV: "ASV",
    YLT: "YLT",
    DARBY: "Darby",
    WEBSTER: "Amplified",
    BBE: "EASY",
    NIV: "NIV",
    ESV: "ESV",
    NASB: "NASB",
    NKJ: "NKJ",
    NLT: "NLT",
    CSB: "CSB",
    HCSB: "HCSB",
    GNT: "GNT",
    NIRV: "NIRV",
    RSV: "RSV",
    NRSV: "NRSV",
    NET: "NET",
    MEV: "MEV",
    LSB: "LSB",
    NASU: "NASU",
    AMPClassic: "AmplifiedClassic",
    EASY: "EASY",
    Passion: "Passion",
    TL: "TL",
    Tyndale: "Tyndale",
    ERV: "ERV",
  };
  return mapping[frontendId] || frontendId;
};

export const mapFrontendId = (backendId: string): string => {
  const mapping: Record<string, string> = {
    Berean: "BSB",
    KJV: "KJV",
    GW: "WEB",
    ASV: "ASV",
    YLT: "YLT",
    Darby: "DARBY",
    Amplified: "WEBSTER",
    EASY: "BBE",
    NIV: "NIV",
    ESV: "ESV",
    NASB: "NASB",
    NKJ: "NKJ",
    NLT: "NLT",
    CSB: "CSB",
    HCSB: "HCSB",
    GNT: "GNT",
    NIRV: "NIRV",
    RSV: "RSV",
    NRSV: "NRSV",
    NET: "NET",
    MEV: "MEV",
    LSB: "LSB",
    NASU: "NASU",
    AmplifiedClassic: "AMPClassic",
    Passion: "Passion",
    TL: "TL",
    Tyndale: "Tyndale",
    ERV: "ERV",
  };
  return mapping[backendId] || backendId;
};

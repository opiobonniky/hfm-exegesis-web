import { sendGetRequest, sendPostRequest } from "@/services/api";
import type { StrongsEntry } from "@/services/strongsApi";
import { LAB_BROWSE_PAGE_SIZE } from "../constants";

export const useLabDictionary = () => {
  const searchWords = async (query: string) => {
    const res = await sendGetRequest("strongs", "search", { q: query.trim(), limit: 50, offset: 0 });
    if (res.returnCode === 200 && res.returnData) {
      return {
        words: (res.returnData as any).data || [],
        total: (res.returnData as any).total ?? 0,
      };
    }
    return { words: [], total: 0 };
  };

  const loadBookWords = async (book: string, page = 0) => {
    const res = await sendGetRequest("strongs", `book-words/${encodeURIComponent(book)}`, { 
      limit: LAB_BROWSE_PAGE_SIZE, 
      offset: page * LAB_BROWSE_PAGE_SIZE 
    });
    if (res.returnCode === 200 && res.returnData) {
      const rd = res.returnData as any;
      return {
        words: rd.data || [],
        total: rd.total ?? 0,
        hasNext: !!rd.hasNext,
      };
    }
    return { words: [], total: 0, hasNext: false };
  };

  const loadVerseWords = async (book: string, chapter: number, verse: number) => {
    const res = await sendPostRequest("strongs", "verse-unique-words", { 
      bookName: book, chapter, verse, translation: "BSB" 
    });
    if (res.returnCode === 200 && res.returnData) {
      const rd = res.returnData as any;
      return {
        words: rd.data || [],
        total: rd.total ?? 0,
      };
    }
    return { words: [], total: 0 };
  };

  const getWordDetail = async (strongsId: string) => {
    const res = await sendGetRequest("strongs", strongsId, {});
    if (res.returnCode === 200 && res.returnData) return res.returnData as StrongsEntry;
    throw new Error("Failed to load word details");
  };

  return { searchWords, loadBookWords, loadVerseWords, getWordDetail };
};

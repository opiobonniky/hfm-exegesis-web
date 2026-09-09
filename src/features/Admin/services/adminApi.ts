import { sendPostRequest } from "@/services/api";
import { bibleApi } from "@/services/bibleApi";

/** Admin-only boundary for backend and Bible API access. */
export const adminApi = {
  request<T = any>(route: string, action: string, payload: any = {}) {
    return sendPostRequest<T>(route, action, payload);
  },
  getVerse(version: string, book: string, chapter: number, verse: number) {
    return bibleApi.getVerse(version, book, chapter, verse);
  },
  getVerses(version: string, book: string, chapter: number) {
    return bibleApi.getVerses(version, book, chapter);
  },
};

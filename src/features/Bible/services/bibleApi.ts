// Bible bibleApi — API endpoints for bibleApi operations
import { sendPostRequest } from "@/services/api";

export const bibleApi = {
  getHighlights: (page = 0, size = 50) =>
    sendPostRequest("bible", "get-highlights", { pageSize: size }),
  getNotes: (page = 0, size = 50) =>
    sendPostRequest("bible", "get-verse-note", { page, size }),
  getFavorites: (page = 0, size = 50) =>
    sendPostRequest("bible", "get-favorites", { pageSize: size }),
  getReadHistory: (page = 0, size = 50) =>
    sendPostRequest("bible", "get-read-history", { pageSize: size }),
  search: (query: string, page = 0, size = 20) =>
    sendPostRequest("bible", "search", { query, page, size }),
  getVerseResources: (book: string, chapter: number, verse: number) =>
    sendPostRequest("bible", "get-verse-resources", { bookName: book, chapter, verseStart: verse }),
  getTranslations: () =>
    sendPostRequest("bible", "get-translations", {}),
  getTodaysVerse: () =>
    sendPostRequest("bible", "get-todays-verse", {}),
  getTodaysDevotion: () =>
    sendPostRequest("bible", "get-todays-devotion", {}),
  getTodaysExegesis: () =>
    sendPostRequest("bible", "get-todays-exegesis", {}),
  getVerseExplanation: (book: string, chapter: number, verse: number) =>
    sendPostRequest("bible", "get-verse-explanation", { bookName: book, chapter, verseNumber: verse }),
  toggleHighlight: (book: string, chapter: number, verse: number, colorId: string) =>
    sendPostRequest("bible", "toggle-highlight", { bookName: book, chapter, verseNumber: verse, colorId }),
  toggleFavorite: (book: string, chapter: number, verse: number) =>
    sendPostRequest("bible", "toggle-favorite", { bookName: book, chapter, verseNumber: verse }),
  saveNote: (book: string, chapter: number, verse: number, note: string) =>
    sendPostRequest("bible", "save-note", { bookName: book, chapter, verseNumber: verse, note }),
  getHomeStats: () =>
    sendPostRequest("bible", "get-home-stats", {}),
  deleteHighlight: (id: string) =>
    sendPostRequest("bible", "delete-highlight", { highlightId: id }),
  deleteNote: (id: string) =>
    sendPostRequest("bible", "delete-verse-note", { noteId: id }),
  deleteFavorite: (id: string) =>
    sendPostRequest("bible", "delete-favorite", { favoriteId: id }),
  deleteReadHistory: (ids: string[]) =>
    sendPostRequest("bible", "delete-read-history", { readHistoryIds: ids }),
};

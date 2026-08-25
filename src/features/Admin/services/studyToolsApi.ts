// Admin studyToolsApi — API endpoints for study tools
import { sendPostRequest } from "@/services/api";

export const wordStudyApi = {
  search: (query: string, language?: string, page = 0, size = 20) =>
    sendPostRequest("strongs", "admin/search-words", { query, language, page, size }),
  getDetail: (strongsNumber: string) =>
    sendPostRequest("strongs", "get-word-detail", { strongsNumber }),
  create: (data: any) =>
    sendPostRequest("strongs", "admin/add-word", data),
  update: (data: any) =>
    sendPostRequest("strongs", "admin/update-word", data),
  delete: (id: number) =>
    sendPostRequest("strongs", "admin/delete-word", { id }),
};

export const verseResourcesApi = {
  getByReference: (book: string, chapter: number, verse: number) =>
    sendPostRequest("strongs", "admin/get-verse-resource", { bookName: book, chapter, verseStart: verse }),
  upsert: (data: any) =>
    sendPostRequest("strongs", "admin/upsert-verse-resource", data),
  delete: (id: number) =>
    sendPostRequest("strongs", "admin/delete-verse-resource", { id }),
  list: (page = 0, size = 20, search = "") =>
    sendPostRequest("strongs", "admin/list-resources", { page, size, search }),
};

export const prologuesApi = {
  list: (page = 0, size = 20, search = "") =>
    sendPostRequest("book-prologues", "admin/get-all", { page, size, search }),
  upsert: (data: any) =>
    sendPostRequest("book-prologues", "admin/upsert", data),
  delete: (id: number) =>
    sendPostRequest("book-prologues", "admin/delete", { id }),
  getByBook: (bookName: string) =>
    sendPostRequest("book-prologues", "get-by-book", { bookName }),
};

export const exegesisApi = {
  list: (page = 0, size = 20, search = "") =>
    sendPostRequest("admin", "get-all-daily-exegesis", { page, size, search }),
  add: (data: any) =>
    sendPostRequest("admin", "add-daily-exegesis", data),
  delete: (id: number) =>
    sendPostRequest("admin", "delete-daily-exegesis", { id }),
};

// Admin studyToolsApi — API endpoints for studyToolsApi operations
import { sendPostRequest } from "@/services/api";

// ─── Word Study API ───────────────────────────────────────────────────────────
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
// ─── Verse Resources API ──────────────────────────────────────────────────────
export const verseResourcesApi = {
  getByReference: (book: string, chapter: number, verse: number) =>
    sendPostRequest("strongs", "admin/get-verse-resource", { bookName: book, chapter, verseStart: verse }),
  upsert: (data: any) =>
    sendPostRequest("strongs", "admin/upsert-verse-resource", data),
    sendPostRequest("strongs", "admin/delete-verse-resource", { id }),
  list: (page = 0, size = 20, search = "") =>
    sendPostRequest("strongs", "admin/list-resources", { page, size, search }),
// ─── Book Prologues API ───────────────────────────────────────────────────────
export const prologuesApi = {
    sendPostRequest("book-prologues", "admin/get-all", { page, size, search }),
    sendPostRequest("book-prologues", "admin/upsert", data),
    sendPostRequest("book-prologues", "admin/delete", { id }),
  getByBook: (bookName: string) =>
    sendPostRequest("book-prologues", "get-by-book", { bookName }),
// ─── Exegesis Studies API ─────────────────────────────────────────────────────
export const exegesisApi = {
    sendPostRequest("admin", "get-all-daily-exegesis", { page, size, search }),
  add: (data: any) =>
    sendPostRequest("admin", "add-daily-exegesis", data),
    sendPostRequest("admin", "delete-daily-exegesis", { id }),

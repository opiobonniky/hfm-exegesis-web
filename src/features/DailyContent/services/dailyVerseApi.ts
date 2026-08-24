// DailyContent dailyVerseApi — API endpoints for dailyVerseApi operations
import { sendPostRequest } from "@/services/api";

export const dailyVerseApi = {
  getToday: () =>
    sendPostRequest("bible", "get-daily-verse", {}),
  getAll: (page = 0, size = 6, filters?: Record<string, any>) =>
    sendPostRequest("admin", "get-all-daily-verses", { page, size, smartDefault: true, futureDays: 2, ...filters }),
  add: (data: any) =>
    sendPostRequest("admin", "add-daily-verse", data),
  update: (data: any) =>
    sendPostRequest("admin", "update-daily-verse", data),
  delete: (id: number) =>
    sendPostRequest("admin", "delete-daily-verse", { id }),
};
export const dailyDevotionApi = {
  getAll: (page = 0, size = 20, filters?: Record<string, any>) =>
    sendPostRequest("admin", "get-all-daily-devotions", { page, size, ...filters }),
    sendPostRequest("admin", "add-daily-devotion", data),
    sendPostRequest("admin", "update-daily-devotion", data),
    sendPostRequest("admin", "delete-daily-devotion", { id }),
export const verseExplanationApi = {
  getAll: (page = 0, size = 20, search = "") =>
    sendPostRequest("bible", "get-all-verses-explanation", { page, size, search }),
    sendPostRequest("bible", "add-verse-explanation", data),
    sendPostRequest("bible", "delete-verse-explanation", { id }),

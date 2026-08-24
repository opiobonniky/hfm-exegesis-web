// Home homeApi — API endpoints for homeApi operations
import { sendPostRequest } from "@/services/api";

export const homeApi = {
  getDashboardStats: () =>
    sendPostRequest("admin", "get-admin-dashboard-stats", {}),
  getRecentUsers: (page = 0, size = 10) =>
    sendPostRequest("admin", "get-users-by-admin", { page, pageSize: size }),
  getUserDashboard: () =>
    sendPostRequest("bible", "get-home-stats", {}),
  getTodaysVerse: () =>
    sendPostRequest("bible", "get-todays-verse", {}),
  getUserPlans: () =>
    sendPostRequest("reading-plans", "get-user-plans", {}),
  getJournalStats: () =>
    sendPostRequest("journal", "stats", {}),
  getReadHistory: (page = 0, pageSize = 1) =>
    sendPostRequest("bible", "get-read-history", { page, pageSize }),
  getLatestJournal: (page = 0, pageSize = 1) =>
    sendPostRequest("journal", "get-all", { page, pageSize }),
  getTodaysExegesis: () =>
    sendPostRequest("bible", "get-todays-exegesis", {}),
  getTodaysDevotion: () =>
    sendPostRequest("bible", "get-todays-devotion", {}),
};

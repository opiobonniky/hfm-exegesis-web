// Trivia triviaApi — API endpoints for triviaApi operations
import { sendPostRequest } from "@/services/api";

export const triviaApi = {
  getOverview: () =>
    sendPostRequest("trivia", "admin/overview", {}),
  listQuestions: (page = 0, size = 20, filters?: Record<string, any>) =>
    sendPostRequest("trivia", "get-all", { page, pageSize: size, ...filters }),
  getQuestions: (page = 0, size = 20) =>
    sendPostRequest("trivia", "get-questions", { page, size }),
  addQuestion: (data: any) =>
    sendPostRequest("trivia", "add-question", data),
  updateQuestion: (data: any) =>
    sendPostRequest("trivia", "update-question", data),
  deleteQuestion: (id: number) =>
    sendPostRequest("trivia", "delete", { id }),
  getUserPerformance: (userId: string) =>
    sendPostRequest("trivia", "admin/user-performance", { userId }),
  getLeaderboard: (page = 0, size = 20) =>
    sendPostRequest("trivia", "admin/leaderboard", { page, size }),
};

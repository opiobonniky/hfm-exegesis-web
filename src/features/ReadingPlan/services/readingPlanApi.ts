// ReadingPlan readingPlanApi — API endpoints for readingPlanApi operations
import { sendPostRequest } from "@/services/api";

export const readingPlanApi = {
  list: (page = 0, size = 20, filters?: Record<string, any>) =>
    sendPostRequest("reading-plans", "get-all", { page, size, ...filters }),
  getDetail: (planId: string) =>
    sendPostRequest("reading-plans", "plan-detail", { planId }),
  getMyPlans: (page = 0, size = 20) =>
    sendPostRequest("reading-plans", "my-plans", { page, size }),
  getUserPlans: () =>
    sendPostRequest("reading-plans", "get-user-plans", {}),
  create: (data: any) =>
    sendPostRequest("reading-plans", "create", data),
  update: (data: any) =>
    sendPostRequest("reading-plans", "update", data),
  delete: (planId: string) =>
    sendPostRequest("reading-plans", "delete", { planId }),
  getAdminStats: (planId: string) =>
    sendPostRequest("reading-plans", "admin-stats", { planId }),
  getDailyReading: (planId: string, day: number) =>
    sendPostRequest("reading-plans", "daily-reading", { planId, day }),
  markDayComplete: (planId: string, day: number) =>
    sendPostRequest("reading-plans", "mark-complete", { planId, day }),
};

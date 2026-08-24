// UserManagement userManagementApi — API endpoints for userManagementApi operations
import { sendPostRequest } from "@/services/api";

export const userManagementApi = {
  list: (page = 0, size = 20, filters?: Record<string, any>) =>
    sendPostRequest("admin", "get-users-by-admin", { page, pageSize: size, ...filters }),

  getDetail: (userId: string) =>
    sendPostRequest("admin", "get-user-detail", { userId }),

  updateRole: (userId: string, role: string) =>
    sendPostRequest("admin", "update-user-role", { userId, role }),

  toggleActive: (userId: string) =>
    sendPostRequest("admin", "toggle-user-active", { userId }),
};

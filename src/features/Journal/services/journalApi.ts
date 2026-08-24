// Journal journalApi — API endpoints for journalApi operations
import { sendPostRequest } from "@/services/api";

export const journalApi = {
  list: (page = 0, size = 20, filters?: Record<string, any>) =>
    sendPostRequest("journal", "get-all", { page, pageSize: size, ...filters }),
  getDetail: (entryId: string) =>
    sendPostRequest("journal", "get-detail", { entryId }),
  create: (data: any) =>
    sendPostRequest("journal", "create", data),
  update: (entryId: string, data: any) =>
    sendPostRequest("journal", "update", { entryId, ...data }),
  delete: (entryId: string) =>
    sendPostRequest("journal", "delete", { entryId }),
  getTemplates: () =>
    sendPostRequest("journal", "templates/get-all", {}),
  getPrompts: () =>
    sendPostRequest("journal", "prompts/get-all", {}),
  getStats: () =>
    sendPostRequest("journal", "stats", {}),
};

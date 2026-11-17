// Admin studyToolsApi — API endpoints for study tools
import { sendGetRequest, sendPostRequest } from "@/services/api";

export const wordStudyApi = {
  search: (query: string, language?: string, page = 0, size = 20) =>
    sendPostRequest("strongs", "admin/list-entries", { search: query, language, page, pageSize: size }),
  getDetail: (strongsNumber: string) =>
    sendGetRequest("strongs", encodeURIComponent(strongsNumber), {}),
  create: (data: Record<string, unknown>) =>
    sendPostRequest("strongs", "admin/update-entry", data),
  update: (data: Record<string, unknown>) =>
    sendPostRequest("strongs", "admin/update-entry", data),
  delete: (strongsId: string) =>
    sendPostRequest("strongs", "admin/delete-entry", { strongsId }),
  attachments: (strongsId: string, page = 0) =>
    sendPostRequest("strongs", "admin/list-all-verse-word-studies", { strongsId, page, pageSize: 20 }),
  saveAttachment: (data: Record<string, unknown>) =>
    sendPostRequest("strongs", "admin/upsert-verse-word-study", data),
  removeAttachment: (id: string | number) =>
    sendPostRequest("strongs", "admin/delete-verse-word-study", { id }),
};

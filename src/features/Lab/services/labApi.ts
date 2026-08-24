// Lab labApi — API endpoints for labApi operations
import { sendPostRequest } from "@/services/api";

export const labApi = {
  getCurrentSession: () =>
    sendPostRequest("exegesis", "get-current-session", {}),
  getSessionHistory: (page = 0, size = 20) =>
    sendPostRequest("exegesis", "get-session-history", { page, size }),
  getSessionDetail: (sessionId: string) =>
    sendPostRequest("exegesis", "get-session-detail", { sessionId }),
  startSession: (data: any) =>
    sendPostRequest("exegesis", "start-session", data),
  saveStage: (sessionId: string, stage: string, content: string) =>
    sendPostRequest("exegesis", "save-stage", { sessionId, stage, content }),
  completeSession: (sessionId: string) =>
    sendPostRequest("exegesis", "complete-session", { sessionId }),
  getDictionaryWords: (query: string, book?: string) =>
    sendPostRequest("strongs", "verse-unique-words", { query, book }),
};

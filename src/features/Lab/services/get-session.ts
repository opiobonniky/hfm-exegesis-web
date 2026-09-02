import { sendPostRequest } from "@/services/api";

export const useLabSession = () => {
  const getLabSession = async (sessionId: string) => {
    try {
      const res = await sendPostRequest("exegesis", "get-session", { sessionId });
      if (res?.returnCode === 200 && res.returnData) return res.returnData;
      throw new Error(res?.returnMessage || "Failed to load session");
    } catch (error) {
      console.error("Error fetching lab session:", error);
      throw error;
    }
  };

  const getActiveSession = async () => {
    try {
      const res = await sendPostRequest("exegesis", "get-active-session", {});
      if (res?.returnCode === 200 && res.returnData) return res.returnData;
      return null;
    } catch (error) {
      console.error("Error fetching active session:", error);
      throw error;
    }
  };

  const getSessions = async (page: number, size: number) => {
    try {
      const res = await sendPostRequest("exegesis", "get-sessions", { page, size });
      if (res?.returnCode === 200 && res.returnData) return res.returnData;
      throw new Error(res?.returnMessage || "Failed to load sessions");
    } catch (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }
  };

  return { 
    getLabSession, 
    getActiveSession, 
    getSessions 
  };
};

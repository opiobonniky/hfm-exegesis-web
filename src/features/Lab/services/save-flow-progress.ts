import { sendPostRequest } from "@/services/api";

export async function saveAbideProgress(
  sessionId: string,
  payload: {
    reflection: string;
    prayer: string;
    application: string;
    tags: string;
    isPublic: boolean;
  },
) {
  const response = await sendPostRequest("exegesis", `${sessionId}/abide`, payload);
  if (response?.returnCode !== 200) {
    throw new Error(response?.returnMessage || "Failed to save abide progress");
  }
  return response.returnData;
}

export async function saveApplyProgress(
  sessionId: string,
  payload: { challengeText: string; resultsText: string },
) {
  const response = await sendPostRequest("exegesis", `${sessionId}/apply`, payload);
  if (response?.returnCode !== 200) {
    throw new Error(response?.returnMessage || "Failed to save application progress");
  }
  return response.returnData;
}

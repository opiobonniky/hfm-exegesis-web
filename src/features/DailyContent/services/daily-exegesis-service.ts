import { sendPostRequest } from "@/services/api";
import type { DailyExegesisFull } from "../types";

interface DailyExegesisListResponse {
  content?: DailyExegesisFull[];
}

export async function getDailyExegesis(): Promise<{
  item: DailyExegesisFull | null;
  series: DailyExegesisFull[];
}> {
  const [todayResponse, listResponse] = await Promise.all([
    sendPostRequest("bible", "get-todays-exegesis", {}),
    sendPostRequest("bible", "get-daily-exegesis-list", { page: 0, size: 10 }),
  ]);

  return {
    item: todayResponse?.returnCode === 200 ? todayResponse.returnData ?? null : null,
    series:
      listResponse?.returnCode === 200
        ? ((listResponse.returnData as DailyExegesisListResponse | undefined)?.content ?? [])
        : [],
  };
}

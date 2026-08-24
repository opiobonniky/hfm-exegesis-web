// DailyContent useDailyDevotions — useDailyDevotions state and API logic
import { useState, useCallback } from "react";
import { dailyDevotionApi } from "../services/dailyVerseApi";

export function useDailyDevotions() {
  const [devotions, setDevotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDevotions = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const res = await dailyDevotionApi.getAll(page, 20, filters);
      if (res.returnCode === 200) {
        setDevotions(res.returnData?.content || []);
        setTotalPages(res.returnData?.totalPages || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  return { devotions, loading, page, totalPages, setPage, fetchDevotions };
}

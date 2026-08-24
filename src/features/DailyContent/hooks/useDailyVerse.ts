// DailyContent useDailyVerse — useDailyVerse state and API logic
import { useState, useCallback } from "react";
import { dailyVerseApi } from "../services/dailyVerseApi";
import type { DailyVerseItem } from "../types";

export function useDailyVerse() {
  const [verses, setVerses] = useState<DailyVerseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchVerses = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await dailyVerseApi.getAll(page, 6, filters);
      if (res.returnCode === 200 && res.returnData) {
        setVerses(res.returnData.content || []);
        setTotalPages(res.returnData.totalPages || 0);
      }
    } catch (e) {
      console.error("Failed to load verses:", e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  return { verses, loading, page, totalPages, setPage, fetchVerses };
}

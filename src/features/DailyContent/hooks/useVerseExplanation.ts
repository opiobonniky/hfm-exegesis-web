// DailyContent useVerseExplanation — useVerseExplanation state and API logic
import { useState, useCallback } from "react";
import { verseExplanationApi } from "../services/dailyVerseApi";

export function useVerseExplanation() {
  const [explanations, setExplanations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchExplanations = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const res = await verseExplanationApi.getAll(page, 20, search);
      if (res.returnCode === 200) {
        setExplanations(res.returnData?.content || []);
        setTotalPages(res.returnData?.totalPages || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  return { explanations, loading, page, totalPages, setPage, fetchExplanations };
}

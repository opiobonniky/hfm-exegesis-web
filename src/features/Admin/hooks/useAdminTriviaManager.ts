// Admin useAdminTriviaManager — useAdminTriviaManager state and API logic
import { useState, useCallback } from "react";
import { triviaApi } from "../../Trivia/services/triviaApi";

export function useAdminTriviaManager() {
  const [overview, setOverview] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await triviaApi.getOverview();
      if (res.returnCode === 200) setOverview(res.returnData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  const loadQuestions = useCallback(async (filters?: any) => {
      const res = await triviaApi.listQuestions(page, 20, filters);
      if (res.returnCode === 200) {
        setQuestions(res.returnData?.content || []);
        setTotalPages(res.returnData?.totalPages || 0);
      }
  }, [page]);
  return { overview, questions, loading, page, totalPages, setPage, loadOverview, loadQuestions };
}

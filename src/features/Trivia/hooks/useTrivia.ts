// Trivia useTrivia — useTrivia state and API logic
import { useState, useCallback } from "react";
import { triviaApi } from "../services/triviaApi";
import type { TriviaQuestion } from "../types";

export function useTrivia() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchQuestions = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await triviaApi.listQuestions(page, 20, filters);
      if (res.returnCode === 200 && res.returnData) {
        setQuestions(res.returnData.content || []);
        setTotalPages(res.returnData.totalPages || 0);
      }
    } catch (e) {
      console.error("Failed to load questions:", e);
    } finally {
      setLoading(false);
    }
  }, [page]);

  return { questions, loading, page, totalPages, setPage, fetchQuestions };
}

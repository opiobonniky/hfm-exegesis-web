import { useCallback, useEffect, useState } from "react";
import { TRIVIA_HISTORY_PAGE_SIZE } from "../constants";
import { triviaApi } from "../services/triviaApi";
import type { TriviaAnswerHistory, TriviaPerformanceStats } from "../types";

const EMPTY_STATS: TriviaPerformanceStats = {
  totalAnswered: 0,
  correct: 0,
  incorrect: 0,
  percentage: 0,
};

export function useTriviaPerformance() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [answers, setAnswers] = useState<TriviaAnswerHistory[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(
    async (nextPage: number, append: boolean, query = search) => {
      append ? setLoadingMore(true) : setLoading(true);
      setError(null);
      try {
        const response = await triviaApi.getPerformance(
          nextPage,
          TRIVIA_HISTORY_PAGE_SIZE,
          query,
        );
        if (response.returnCode !== 200 || !response.returnData)
          throw new Error(
            response.returnMessage || "Unable to load trivia performance",
          );
        setStats(response.returnData.stats);
        setAnswers((current) =>
          append
            ? [...current, ...response.returnData.answers]
            : response.returnData.answers,
        );
        setPage(nextPage);
        setHasNext(response.returnData.hasNext);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load trivia performance",
        );
      } finally {
        append ? setLoadingMore(false) : setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(0, false);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [load]);
  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };
  return {
    data: {
      stats,
      answers,
      hasNext,
      loading,
      loadingMore,
      error,
      search,
    },
    actions: {
      setSearch: updateSearch,
      retry: () => load(0, false),
      loadMore: () => load(page + 1, true),
    },
  };
}

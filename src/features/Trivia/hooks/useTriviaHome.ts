import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTriviaPage } from "./useTriviaPage";

const TRIVIA_START_MODE_KEY = "exegesis_trivia_start_mode";

export function useTriviaHome() {
  const { data, actions } = useTriviaPage();
  const navigate = useNavigate();

  const startQuiz = useCallback(() => {
    sessionStorage.setItem(TRIVIA_START_MODE_KEY, "normal");
    navigate("/trivia/questions");
  }, [navigate]);

  const startDailyChallenge = useCallback(() => {
    sessionStorage.setItem(TRIVIA_START_MODE_KEY, "daily");
    navigate("/trivia/questions");
  }, [navigate]);

  const openPerformance = useCallback(() => {
    navigate("/trivia/performance");
  }, [navigate]);

  return {
    data,
    actions: {
      ...actions,
      startQuiz,
      startDailyChallenge,
      openPerformance,
    },
  };
}

export { TRIVIA_START_MODE_KEY };

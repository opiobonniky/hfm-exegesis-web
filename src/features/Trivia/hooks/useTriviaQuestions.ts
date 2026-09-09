import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTriviaPage } from "./useTriviaPage";
import { TRIVIA_START_MODE_KEY } from "./useTriviaHome";

export function useTriviaQuestions() {
  const page = useTriviaPage();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = sessionStorage.getItem(TRIVIA_START_MODE_KEY);
    if (!mode) return;

    sessionStorage.removeItem(TRIVIA_START_MODE_KEY);
    if (mode === "daily") {
      page.actions.startDailyChallenge();
    } else if (page.data.phase === "plan") {
      page.actions.startQuiz();
    }
  }, [page.actions, page.data.phase]);

  const exitQuiz = useCallback(() => {
    navigate("/trivia");
  }, [navigate]);

  const exitDailyChallenge = useCallback(() => {
    page.actions.handleDailyBackToPlan();
    navigate("/trivia");
  }, [navigate, page.actions]);

  return {
    data: page.data,
    actions: {
      ...page.actions,
      exitQuiz,
      exitDailyChallenge,
    },
  };
}

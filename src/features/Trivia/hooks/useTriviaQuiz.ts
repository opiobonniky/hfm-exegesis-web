// Trivia useTriviaQuiz — useTriviaQuiz state and API logic
import { useState, useCallback } from "react";
import { sendPostRequest } from "@/services/api";

export function useTriviaQuiz() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("trivia", "get-questions", { page: 0, size: 20 });
      if (res.returnCode === 200) setQuestions(res.returnData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  const answer = useCallback((idx: number) => {
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === questions[currentIndex]?.correctAnswer) {
      setScore((s) => s + 1);
    }
  }, [currentIndex, questions]);
  const next = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
  }, [currentIndex, questions.length]);
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  return {
    questions, currentIndex, selectedAnswer, showResult, score,
    loading, completed, loadQuestions, answer, next, reset,
    total: questions.length,
    current: questions[currentIndex],
  };
}

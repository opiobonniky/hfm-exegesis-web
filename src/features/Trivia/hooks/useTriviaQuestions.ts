// Trivia useTriviaQuestions — useTriviaQuestions state and API logic
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: string;
  explanation?: string;
  book?: string;
  chapter?: number;
  verse?: number;
}
export function useTriviaQuestions() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = { page, pageSize: 20 };
      if (searchQuery) filters.search = searchQuery;
      if (selectedCategory !== "all") filters.category = selectedCategory;
      if (selectedDifficulty !== "all") filters.difficulty = selectedDifficulty;
      const res = await sendPostRequest("trivia", "get-all", filters);
      if (res.returnCode === 200) {
        setQuestions(res.returnData?.content || []);
      }
    } catch (e) {
      console.error("Failed to fetch trivia questions", e);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory, selectedDifficulty]);
  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);
  const createQuestion = useCallback(async (data: Partial<TriviaQuestion>) => {
      await sendPostRequest("trivia", "add-question", data);
      await fetchQuestions();
      console.error("Failed to create question", e);
  }, [fetchQuestions]);
  const deleteQuestion = useCallback(async (id: string) => {
      await sendPostRequest("trivia", "delete", { id });
      setQuestions(prev => prev.filter(q => q.id !== id));
      console.error("Failed to delete question", e);
  }, []);
  return {
    questions,
    loading,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    createQuestion,
    deleteQuestion,
    refresh: fetchQuestions,
  };
}

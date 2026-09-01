// useTriviaDetail — fetch a single trivia question
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface TriviaQuestionDetail {
  id: number;
  question: string;
  options?: string[];
  optionsJson?: string;
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  category: string;
  isActive: boolean;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  createdOn: string;
  updatedOn: string;
}

export function useTriviaDetail() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<TriviaQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) return;
    setLoading(true);
    sendPostRequest("trivia", "get", { id: questionId })
      .then((res) => {
        if (res?.returnCode === 200 && res.returnData) {
          setQuestion(res.returnData);
        } else {
          toast({ title: "Question not found", variant: "destructive" });
          navigate("/admin/trivia");
        }
      })
      .catch(() => {
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/trivia");
      })
      .finally(() => setLoading(false));
  }, [questionId, toast, navigate]);

  return { question, loading, navigate };
}

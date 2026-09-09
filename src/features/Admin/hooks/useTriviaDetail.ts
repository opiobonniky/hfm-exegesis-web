// useTriviaDetail — fetch a single trivia question
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/adminApi";
import type { TriviaQuestionDetail } from "../types";

export function useTriviaDetail() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<TriviaQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) return;
    setLoading(true);
    adminApi.request("trivia", "get", { id: questionId })
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

  return { data: { question, loading }, actions: { navigate } };
}

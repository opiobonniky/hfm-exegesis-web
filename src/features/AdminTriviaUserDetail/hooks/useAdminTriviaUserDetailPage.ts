import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

export interface TriviaUserDetail {
  userId: number; username: string; email: string; score: number;
  questionsAnswered: number; correctAnswers: number;
  recentAnswers: { questionId: number; question: string; isCorrect: boolean; answeredAt: string; }[];
}
export function useAdminTriviaUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [detail, setDetail] = useState<TriviaUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchDetail = useCallback(async () => {
    try {
      const res = await sendPostRequest("trivia", "admin-user-detail", { userId });
      if (res.returnCode === 200) setDetail(res.returnData);
      else { toast({ title: "Error", variant: "destructive" }); navigate(-1); }
    } catch { toast({ title: "Error", variant: "destructive" }); navigate(-1); }
    finally { setLoading(false); }
  }, [userId, toast, navigate]);
  useEffect(() => { fetchDetail(); }, [fetchDetail]);
  const goBack = useCallback(() => {
    navigate(routes.adminTrivia.path);
  }, [navigate]);
  return { detail, loading, navigate, goBack };
}

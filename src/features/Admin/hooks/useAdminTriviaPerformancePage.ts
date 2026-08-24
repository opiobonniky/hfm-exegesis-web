import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

interface OverviewStats { totalUsers: number; totalQuestions: number; avgScore: number; }
interface UserPerf { id: number; username: string; email: string; score: number; questionsAnswered: number; }
interface QuestionPerf { id: number; question: string; correctAnswers: number; totalAnswers: number; }
export function useAdminTriviaPerformancePage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [users, setUsers] = useState<UserPerf[]>([]);
  const [questions, setQuestions] = useState<QuestionPerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("trivia", "admin-performance", {});
      if (res.data?.returnCode === 200 && res.data.returnData) {
        const d = res.data.returnData;
        setOverview(d.overview || null);
        setUsers(d.users || []);
        setQuestions(d.questions || []);
      }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { loadAll(); }, [loadAll]);
  return { tab, setTab, overview, users, questions, loading, search, setSearch, loadAll };
}

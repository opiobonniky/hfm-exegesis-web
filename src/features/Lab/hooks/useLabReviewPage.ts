import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { sendPostRequest } from "@/services/api";

export function useLabReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) { setLoading(false); setError(true); return; }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await sendPostRequest("exegesis", "get-session", { sessionId });
        if (cancelled) return;
        if (res?.returnCode === 200 && res.returnData) setSession(res.returnData);
        else setError(true);
      } catch { if (!cancelled) setError(true); }
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [sessionId]);

  const goBack = useCallback(() => navigate(-1), [navigate]);
  return { goBack, sessionId, session, loading, error, activeStage, setActiveStage };
}

export type LabReviewPageModel = ReturnType<typeof useLabReviewPage>;

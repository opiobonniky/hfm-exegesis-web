import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLabSession } from "../services/get-session";

export function useLabReview() {
  const navigate = useNavigate(); 
  const { getLabSession } = useLabSession();
  
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError(true);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getLabSession(sessionId);
        if (cancelled) return;
        setSession(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId, getLabSession]);

  const goBack = useCallback(() => navigate(-1), [navigate]);
  return {
    data: {
      session,
      loading,
      error,
      activeStage,
    },
    actions: {
      goBack,
      setActiveStage,
    },
  };
}

export type LabReviewPageModel = ReturnType<typeof useLabReview>;


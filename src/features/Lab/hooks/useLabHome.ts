import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

interface ExegesisSession { id: string; bookName: string; chapter: number; verseStart: number; verseEnd: number; currentStage: string; completed: boolean; createdAt: string; updatedAt: string; }
export function useLabHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSession, setActiveSession] = useState<ExegesisSession | null>(null);
  const [history, setHistory] = useState<ExegesisSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  useEffect(() => {
    const dismissed = localStorage.getItem("lab_onboarding_dismissed");
    if (!dismissed) setShowOnboarding(true);
  }, []);
  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem("lab_onboarding_dismissed", "true");
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        sendPostRequest("exegesis", "get-active-session", {}),
        sendPostRequest("exegesis", "get-sessions", { page: 0, size: 20 }),
      ]);
      if (activeRes?.returnCode === 200 && activeRes.returnData) setActiveSession(activeRes.returnData);
      if (historyRes?.returnCode === 200 && historyRes.returnData?.content) setHistory(historyRes.returnData.content);
    } catch {} finally { setLoading(false); }
  useEffect(() => { loadData(); }, [loadData]);
  const handleResumeStudy = useCallback((sessionId: string) => {
    navigate(`/lab/flow?sessionId=${sessionId}`);
  }, [navigate]);
  const handleReviewStudy = useCallback((sessionId: string) => {
    navigate(`/lab/review?sessionId=${sessionId}`);
  const handleNewStudy = useCallback((book?: string, chapter?: number, verse?: number) => {
    const params = new URLSearchParams();
    if (book) params.set("book", book);
    if (chapter) params.set("chapter", String(chapter));
    if (verse) params.set("verseStart", String(verse));
    navigate(`/lab/flow?${params.toString()}`);
  }, [navigate]);
  return {
    navigate, activeSession, history, loading, showOnboarding, onboardingStep, setOnboardingStep,
    dismissOnboarding, handleResumeStudy, handleReviewStudy, handleNewStudy, refresh: loadData,
  };
}

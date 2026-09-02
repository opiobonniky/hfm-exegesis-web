import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { routes } from "@/components/Routes/routes";
import type { LabSession } from "../types";
import { useLabSession } from "../services/get-session";

export function useLabHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getActiveSession, getSessions } = useLabSession();
  const [activeSession, setActiveSession] = useState<LabSession | null>(null);
  const [history, setHistory] = useState<LabSession[]>([]);
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
  }, []);
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, historyRes] = await Promise.all([
        getActiveSession(),
        getSessions(0, 20),
      ]);
      if (activeRes) setActiveSession(activeRes);
      if (historyRes?.content) setHistory(historyRes.content);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [getActiveSession, getSessions]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const handleResumeStudy = useCallback(
    (sessionId: string) => {
      navigate(`/lab/flow?sessionId=${sessionId}`);
    },
    [navigate],
  );
  const handleReviewStudy = useCallback(
    (sessionId: string) => {
      navigate(`/lab/review?sessionId=${sessionId}`);
    },
    [navigate],
  );
  const handleNewStudy = useCallback(
    (book?: string, chapter?: number, verse?: number) => {
      const params = new URLSearchParams();
      if (book) params.set("book", book);
      if (chapter) params.set("chapter", String(chapter));
      if (verse) params.set("verseStart", String(verse));
      navigate(`/lab/flow?${params.toString()}`);
    },
    [navigate],
  );
  const goBack = useCallback(() => navigate(-1), [navigate]);
  const openNewStudy = useCallback(
    () => navigate(routes.labFlow.path),
    [navigate],
  );
  const completedCount = history.filter(
    (session) => session.completed || session.currentStage === "completed",
  ).length;
  const inProgressCount = history.length - completedCount;
  return {
    data: {
      history,
      activeSession,
      loading,
      showOnboarding,
      onboardingStep,
      completedCount,
      inProgressCount,
    },
    actions: {
      goBack,
      dismissOnboarding,
      handleResumeStudy,
      handleReviewStudy,
      handleNewStudy,
      refresh: loadData,
      openNewStudy,
      setOnboardingStep,
    },
  };
}

export type LabHomePageModel = ReturnType<typeof useLabHome>;

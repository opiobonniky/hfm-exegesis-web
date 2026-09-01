// useDailyExegesisPage — all state, effects, derived values, and actions for DailyExegesis page
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { parsePassage, fmtDate } from "../helpers";
import type { DailyExegesisFull } from "../types";

const FALLBACK: DailyExegesisFull = {
  id: 0,
  title: "The Word That Leads Us Home",
  passageReference: "John 15:4-5",
  introduction: "Daily Exegesis will appear here once it is published.",
  contextSummary:
    "This placeholder keeps the screen useful while content is being prepared.",
  teachingBody:
    "The Lordsbook Daily Exegesis is designed to give the reader a focused passage, a short explanation, and a clear path into prayer and application.",
  application:
    "Read slowly, ask what the passage reveals about God, and write one faithful response in your journal.",
  prayer: "Lord, open my eyes to Your Word and teach me to abide faithfully today.",
  tags: "daily,exegesis",
  displayDate: new Date().toISOString(),
  createdOn: new Date().toISOString(),
  isPublished: true,
};

export function useDailyExegesisPage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exegesis, setExegesis] = useState<DailyExegesisFull | null>(null);
  const [series, setSeries] = useState<any[]>([]);

  const loadExegesis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayRes, listRes] = await Promise.all([
        sendPostRequest("bible", "get-todays-exegesis", {}),
        sendPostRequest("bible", "get-daily-exegesis-list", { page: 0, size: 10 }),
      ]);
      if (todayRes?.returnCode === 200) setExegesis(todayRes.returnData);
      if (listRes?.returnCode === 200) setSeries(listRes.returnData?.content || []);
    } catch {
      setError("Failed to load exegesis");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExegesis();
  }, [loadExegesis]);

  // ── Derived values ──
  const item = exegesis ?? FALLBACK;

  const passage = useMemo(
    () => parsePassage(item.passageReference),
    [item.passageReference],
  );

  const isUpcoming = useMemo(() => {
    try {
      return new Date(item.displayDate) >= new Date(new Date().toDateString());
    } catch {
      return false;
    }
  }, [item.displayDate]);

  const displayDate = useMemo(
    () => fmtDate(item.displayDate, "long"),
    [item.displayDate],
  );

  // ── Actions ──
  const goBack = useCallback(() => navigate(-1), [navigate]);

  const openInBible = useCallback(() => {
    if (!passage) return;
    navigate(
      `/bible-reader?book=${encodeURIComponent(passage.bookName)}&chapter=${passage.chapter}&verse=${passage.verseNumber}`,
    );
  }, [passage, navigate]);

  const saveToLedger = useCallback(() => {
    const params = new URLSearchParams({
      title: item.title,
      reflection: [item.introduction, item.contextSummary, item.teachingBody]
        .filter(Boolean)
        .join("\n\n"),
      prayer: item.prayer || "",
      application: item.application || "",
      tags: item.tags || "",
      passage: item.passageReference,
      source: "daily-exegesis",
      date: item.displayDate,
    });
    if (passage) {
      params.set("book", passage.bookName);
      params.set("chapter", String(passage.chapter));
      params.set("verse", String(passage.verseNumber));
    }
    navigate(`/journal/new?${params.toString()}`);
  }, [item, passage, navigate]);

  return {
    // Language
    t,
    isRtl,
    // State
    loading,
    error,
    item,
    series,
    // Derived
    passage,
    isUpcoming,
    displayDate,
    canOpenBible: !!passage,
    // Actions
    refresh: loadExegesis,
    goBack,
    openInBible,
    saveToLedger,
  };
}

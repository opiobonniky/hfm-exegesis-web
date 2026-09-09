// useDailyExegesisPage — all state, effects, derived values, and actions for DailyExegesis page
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { parsePassage, fmtDate } from "../helpers";
import { DAILY_EXEGESIS_FALLBACK } from "../constants/dailyExegesis";
import { getDailyExegesis } from "../services/daily-exegesis-service";
import type { DailyExegesisFull } from "../types";

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
      const result = await getDailyExegesis();
      setExegesis(result.item);
      setSeries(result.series);
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
  const item = exegesis ?? DAILY_EXEGESIS_FALLBACK;

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

  const selectSeriesItem = useCallback((selected: DailyExegesisFull) => {
    setExegesis(selected);
  }, []);

  return {
    data: {
      t,
      isRtl,
      loading,
      error,
      item,
      series,
      displayDate,
      isUpcoming,
      canOpenBible: !!passage,
      title: t.dailyExegesis?.title || "Daily Exegesis",
      subtitle: t.dailyExegesis?.subtitle || "Lordsbook teaching",
    },
    actions: {
      refresh: loadExegesis,
      goBack,
      openInBible,
      saveToLedger,
      selectSeriesItem,
    },
  };
}

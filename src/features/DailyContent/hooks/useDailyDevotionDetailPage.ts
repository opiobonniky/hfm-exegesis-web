import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fmtDate, parseList } from "../helpers/contentDetailHelpers";
import type { DailyDevotionDetailData } from "../types";

export function useDailyDevotionDetailPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  let devotion: DailyDevotionDetailData | null = null;
  try {
    const devotionParam = params.get("devotion");
    devotion = devotionParam ? JSON.parse(devotionParam) : null;
  } catch {
    devotion = null;
  }

  const goBack = useCallback(() => navigate(-1), [navigate]);
  const editDevotion = useCallback(() => {
    if (devotion) {
      navigate("/add-daily-devotion", { state: { devotion } });
    }
  }, [devotion, navigate]);

  const reference = devotion?.bookName
    ? `${devotion.bookName} ${devotion.chapter || ""}:${devotion.verseNumber || ""}`
    : null;

  return {
    devotion,
    goBack,
    editDevotion,
    reference,
    headerTitle: devotion?.title || "Daily Devotion",
    subtitle: fmtDate(devotion?.displayDate || null) || "",
    hasBackground: Boolean(
      devotion?.backgroundAuthor ||
      devotion?.backgroundBook ||
      devotion?.backgroundContext,
    ),
    practicalApplications: parseList(devotion?.practicalApplications),
    keyThemes: parseList(devotion?.keyThemes),
    crossReferences: parseList(devotion?.crossReferences),
    takeaways: parseList(devotion?.takeaways),
  };
}

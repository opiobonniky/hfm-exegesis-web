import { sendPostRequest } from "@/services/api";
import type { DailyDevotionItem, DailyExegesisFull } from "../types";

export async function getDailyDevotionVerses(
  bibleVersion: string,
  book: string,
  chapter: number,
) {
  const { bibleApi } = await import("@/services/bibleApi");
  return bibleApi.getVerses(bibleVersion, book, chapter);
}

export async function getDailyDevotionVerse(
  bibleVersion: string,
  book: string,
  chapter: number,
  verse: number,
) {
  const { bibleApi } = await import("@/services/bibleApi");
  return bibleApi.getVerse(bibleVersion, book, chapter, verse);
}

export async function saveDailyDevotion(payload: Partial<DailyDevotionItem>) {
  return sendPostRequest("admin", "add-daily-devotion", payload);
}

export async function checkDailyVerseDate(date: string, excludeId?: number | string) {
  return sendPostRequest("admin", "check-daily-verse-date", {
    date,
    ...(excludeId ? { excludeId } : {}),
  });
}

export async function saveDailyExegesis(payload: Partial<DailyExegesisFull>) {
  return sendPostRequest("admin", "add-daily-exegesis", payload);
}

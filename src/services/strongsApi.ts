import { sendPostRequest, sendGetRequest } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface StrongsWordData {
  wordOrder: number;
  surfaceText: string;
  strongsId: string | null;
  lemma: string | null;
  morphology: string | null;
  hasData: boolean;
  verseNumber?: number;
}

export interface StrongsEntry {
  strongsId: string;
  originalWord: string | null;
  transliteration: string | null;
  shortDefinition: string;
  fullDefinition: string | null;
  language: string;
  partOfSpeech: string | null;
  grammaticalCase: string | null;
  gender: string | null;
  number: string | null;
  usageCount: number | null;
  crossReferences: string | null;
  verseReferences?: Array<{
    bookName: string;
    chapter: number;
    verse: number | null;
    translation?: string;
    surfaceText?: string | null;
    adminExplanation?: string | null;
  }> | null;
  verseCount?: number;
}

// ── API Functions ───────────────────────────────────────────────────────────────

export const getVerseWords = async (
  bookName: string,
  chapter: number,
  verseNumber?: number,
  translation?: string,
): Promise<StrongsWordData[]> => {
  try {
    const res = await sendPostRequest<StrongsWordData[]>("strongs", "verse-words", {
      bookName,
      chapter,
      ...(verseNumber != null ? { verseNumber } : {}),
      translation: translation || "Berean",
    });
    if (res.returnCode === 200 && res.returnData) {
      return res.returnData.map((w: any) => ({
        ...w,
        verseNumber: w.verseNumber || verseNumber || 1,
      }));
    }
    return [];
  } catch {
    return [];
  }
};

export const getStrongsEntry = async (
  strongsId: string,
): Promise<StrongsEntry | null> => {
  try {
    const res = await sendGetRequest<StrongsEntry>("strongs", strongsId, {});
    if (res.returnCode === 200 && res.returnData) {
      return res.returnData;
    }
    return null;
  } catch {
    return null;
  }
};

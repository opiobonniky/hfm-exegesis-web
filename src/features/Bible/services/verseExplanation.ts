import { sendPostRequest } from "@/services/api";
import type { VerseExplanationData } from "../types";

export async function getVerseExplanation(
  bookName: string,
  chapter: number,
  verse: number,
): Promise<VerseExplanationData | null> {
  const response = await sendPostRequest("bible", "get-verse-explanation", {
    bookName,
    chapter,
    verseNumber: verse,
  });

  return response.returnCode === 200 && response.returnData
    ? response.returnData
    : null;
}

import { sendPostRequest } from "./api";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface StudyTool {
  id: number;
  bookName: string;
  chapter: number;
  toolType: "COMMAND" | "PROMISE" | "WARNING" | "REPEATED_WORD" | "TRANSITION" | "CONTRAST";
  label: string;
  description: string | null;
  verseRefs: string;
  strongsIds: string | null;
  order: number;
}

export interface ChapterStudyTools {
  COMMAND?: StudyTool[];
  PROMISE?: StudyTool[];
  WARNING?: StudyTool[];
  REPEATED_WORD?: StudyTool[];
  TRANSITION?: StudyTool[];
  CONTRAST?: StudyTool[];
}

// ── API Functions ──────────────────────────────────────────────────────────────

export const getChapterStudyTools = async (
  bookName: string,
  chapter: number,
): Promise<ChapterStudyTools> => {
  try {
    const res = await sendPostRequest<ChapterStudyTools>(
      "study-tools",
      "chapter-study-tools",
      { bookName, chapter },
    );
    if (res.returnCode === 200 && res.returnData) {
      return res.returnData;
    }
    return {};
  } catch {
    return {};
  }
};

import { sendPostRequest } from "./api";

// ── Types ──

export interface ExegesisSession {
  id: string;
  userId: string;
  passageRef: string;
  bookName: string;
  chapter: number;
  verseStart: number | null;
  verseEnd: number | null;
  currentStage: string;
  completed: boolean;
  lookNotes: string | null;
  listenDuration: number | null;
  listenElapsed: number | null;
  listenCompleted: boolean | null;
  learnNotes: string | null;
  abideReflection: string | null;
  abidePrayer: string | null;
  abideApplication: string | null;
  abideTags: string | null;
  strongsWords: string | null;
  strongsIds: string | null;
  isPublic: boolean | null;
  journalEntryId: string | null;
  createdOn: string;
  updatedOn: string;
}

export interface ExegesisHistory {
  data: ExegesisSession[];
  total: number;
  hasNext: boolean;
}

// ── API Functions ──

export const startSession = async (params: {
  bookName: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}): Promise<ExegesisSession | null> => {
  const res = await sendPostRequest<ExegesisSession>("exegesis", "start", params);
  if (res.returnCode === 200 && res.returnData) {
    return res.returnData;
  }
  return null;
};

export const getCurrentSession = async (): Promise<ExegesisSession | null> => {
  const res = await sendPostRequest<ExegesisSession>("exegesis", "current", {});
  if (res.returnCode === 200 && res.returnData) {
    return res.returnData;
  }
  return null;
};

export const getSessionHistory = async (
  page = 0,
  pageSize = 20,
): Promise<ExegesisHistory | null> => {
  const res = await sendPostRequest<ExegesisHistory>("exegesis", "history", {
    page,
    pageSize,
  });
  if (res.returnCode === 200 && res.returnData) {
    return res.returnData;
  }
  return null;
};

export const getSession = async (
  sessionId: string,
): Promise<ExegesisSession | null> => {
  const res = await sendPostRequest<ExegesisSession>(
    "exegesis",
    sessionId,
    {},
  );
  if (res.returnCode === 200 && res.returnData) {
    return res.returnData;
  }
  return null;
};

export const saveStageProgress = async (
  sessionId: string,
  stage: string,
  data: Record<string, any>,
): Promise<boolean> => {
  const res = await sendPostRequest(
    "exegesis",
    `${sessionId}/${stage}`,
    data,
  );
  return res.returnCode === 200;
};

export const saveProgress = async (
  sessionId: string,
  data: Record<string, any>,
): Promise<boolean> => {
  const res = await sendPostRequest(
    "exegesis",
    `${sessionId}/progress`,
    data,
  );
  return res.returnCode === 200;
};

export const abandonSession = async (
  sessionId: string,
): Promise<boolean> => {
  const res = await sendPostRequest(
    "exegesis",
    `${sessionId}/abandon`,
    {},
  );
  return res.returnCode === 200;
};

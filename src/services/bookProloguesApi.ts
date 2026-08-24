import { sendPostRequest } from "./api";

/** Full book prologue — matches the app's BookPrologue type */
export interface BookPrologue {
  bookName: string;
  author?: string | null;
  authorDetail?: string | null;
  audience?: string | null;
  dateWritten?: string | null;
  locationWritten?: string | null;
  purpose?: string | null;
  keyTheme?: string | null;
  summary?: string | null;
  background?: string | null;
  lessons?: string | null;
  chapters?: number | null;
  structure?: Array<{ range: string; title: string }> | null;
  applications?: string[] | null;
  keyScripture?: Array<{ reference: string; text: string }> | null;
  mainThemes?: string[] | null;
  keyPeople?: string[] | null;
  keyVerses?: string[] | null;
  christConnection?: string | null;
}

/** Fetch a single book prologue */
export const getBookPrologue = async (
  bookName: string,
): Promise<BookPrologue | null> => {
  try {
    const res = await sendPostRequest<BookPrologue>(
      "book-prologues",
      "get",
      { bookName },
    );
    if (res.returnCode !== 200)
      throw new Error(res.returnMessage || "Failed to fetch book prologue");
    return res.returnData ?? null;
  } catch (error: any) {
    if (error?.returnCode === 404) return null;
    throw error;
  }
};

/** Fetch all book prologues (paginated) */
export const getAllBookPrologues = async (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<{ data: BookPrologue[]; total: number; hasNext: boolean }> => {
  const res = await sendPostRequest<{
    data: BookPrologue[];
    total: number;
    hasNext: boolean;
  }>("book-prologues", "get-all", {
    page: params?.page ?? 0,
    pageSize: params?.pageSize ?? 12,
    search: params?.search || undefined,
  });
  if (res.returnCode !== 200)
    throw new Error(res.returnMessage || "Failed to fetch book prologues");
  return res.returnData ?? { data: [], total: 0, hasNext: false };
};

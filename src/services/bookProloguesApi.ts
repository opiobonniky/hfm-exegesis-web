import { sendPostRequest } from "./api";

export interface BookPrologue {
  bookName: string;
  author?: string | null;
  audience?: string | null;
  dateWritten?: string | null;
  locationWritten?: string | null;
  purpose?: string | null;
  keyTheme?: string | null;
  summary?: string | null;
  mainThemes?: string[] | null;
  christConnection?: string | null;
}

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

import type { DailyExegesisFull } from "../types";

export function parseDailyExegesisParam(value: string | null): DailyExegesisFull | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Partial<DailyExegesisFull>;
    if (
      typeof candidate.title !== "string" ||
      typeof candidate.passageReference !== "string"
    ) {
      return null;
    }

    return candidate as DailyExegesisFull;
  } catch {
    return null;
  }
}

// ─── Daily Content Helpers ────────────────────────────────────────────────────

const parseDate = (v: unknown): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return "";
  return String(v);
};

export const fmtDate = (v: any, format: "short" | "long" = "short"): string => {
  try {
    return new Date(parseDate(v)).toLocaleDateString("en-US", {
      weekday: format === "long" ? "short" : undefined,
      month: format, day: "numeric", year: "numeric",
    });
  } catch {
    return "";
  }
};

export const isToday = (v: any): boolean => {
  try {
    return new Date(parseDate(v)).toDateString() === new Date().toDateString();
  } catch {
    return false;
  }
};

export const parsePassage = (ref: string) => {
  const m = ref.match(/^(.+?)\s+(\d+)(?::(\d+))?/);
  return m ? { bookName: m[1].trim(), chapter: Number(m[2]), verseNumber: m[3] ? Number(m[3]) : 1 } : null;
};

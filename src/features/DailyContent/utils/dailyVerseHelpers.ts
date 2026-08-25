// ─── Date helpers for DailyVerse ───────────────────────────────────────────────

export const safeDate = (value: unknown): Date => {
  if (!value || typeof value === "object") return new Date();
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? new Date() : d;
};

export const toYMD = (d: Date): string =>
  [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");

export const getLocalDateString = (utcDateString: unknown): string =>
  toYMD(safeDate(utcDateString));

export const isToday = (utcDateString: unknown): boolean =>
  getLocalDateString(utcDateString) === toYMD(new Date());

export const isFuture = (utcDateString: unknown): boolean =>
  getLocalDateString(utcDateString) > toYMD(new Date());

export const formatDisplayDate = (utcDateString: unknown): string =>
  safeDate(utcDateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const formatShortDate = (utcDateString: unknown): string =>
  safeDate(utcDateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const addDays = (d: Date, days: number): Date => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};

export const getPresetRange = (preset: string): { from: string; to: string } => {
  const now = new Date();
  switch (preset) {
    case "this_week": {
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      return { from: toYMD(mon), to: toYMD(addDays(mon, 6)) };
    }
    case "this_month":
      return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), to: toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0)) };
    case "last_month":
      return { from: toYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: toYMD(new Date(now.getFullYear(), now.getMonth(), 0)) };
    case "last_7":
      return { from: toYMD(addDays(now, -6)), to: toYMD(now) };
    case "last_30":
      return { from: toYMD(addDays(now, -29)), to: toYMD(now) };
    default:
      return { from: "", to: "" };
  }
};

export const getConflictMessage = (conflict: any, t?: any): string => {
  if (!conflict) return "";
  const ref = conflict.existing?.bookName + " " + conflict.existing?.chapter + ":" + conflict.existing?.verseNumber;
  const date = conflict.existing?.displayDate || "";
  const dv = t?.dailyVerse;
  if (conflict.type === "date") {
    const msg = dv?.verseConflictForDate || "A verse already exists for this date ({ref}).";
    return msg.replace("{ref}", ref);
  }
  const msg = dv?.verseConflictForVerse || "This verse ({ref}) already exists for {date}.";
  return msg.replace("{ref}", ref).replace("{date}", date);
};

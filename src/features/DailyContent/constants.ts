// ─── DailyContent Constants ────────────────────────────────────────────────────

// ─── DailyVerse Constants ──────────────────────────────────────────────────────
export const SMART_PAGE_SIZE = 6;
export const SMART_FUTURE_DAYS = 2;
export const FILTERED_PAGE_SIZE = 12;
export const PRESETS = (t?: any) => [
  { value: "thisWeek", label: t?.dailyVerse?.thisWeek || "This Week" },
  { value: "thisMonth", label: t?.dailyVerse?.thisMonth || "This Month" },
  { value: "lastMonth", label: t?.dailyVerse?.lastMonth || "Last Month" },
  { value: "last7Days", label: t?.dailyVerse?.last7Days || "Last 7 Days" },
  { value: "last30Days", label: t?.dailyVerse?.last30Days || "Last 30 Days" },
  { value: "custom", label: t?.dailyVerse?.custom || "Custom Range" },
];
export const TESTAMENTS = (t?: any) => [
  { value: "Old", label: t?.dailyVerse?.oldTestament || "Old Testament" },
  { value: "New", label: t?.dailyVerse?.newTestament || "New Testament" },
export const OLD_TESTAMENT_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah",
  "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai",
  "Zechariah", "Malachi",
// ─── Date Helpers ─────────────────────────────────────────────────────────────
export const safeDate = (value: unknown): Date => {
  if (!value || typeof value === "object") return new Date();
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? new Date() : d;
};
export const toYMD = (d: Date): string =>
  d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
export const getLocalDateString = (utcDateString: unknown): string => toYMD(safeDate(utcDateString));
export const isToday = (utcDateString: unknown): boolean =>
  getLocalDateString(utcDateString) === getLocalDateString(new Date());
export const isFuture = (utcDateString: unknown): boolean =>
  getLocalDateString(utcDateString) > getLocalDateString(new Date());
export const formatDisplayDate = (utcDateString: unknown): string => {
  const d = safeDate(utcDateString);
  return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
export const formatShortDate = (utcDateString: unknown): string => {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
export const addDays = (d: Date, days: number): Date => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
export const getPresetRange = (preset: string): { from: string; to: string } => {
  const now = new Date();
  switch (preset) {
    case "thisWeek": {
      const mon = new Date(now);
      mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      return { from: toYMD(mon), to: toYMD(addDays(mon, 6)) };
    }
    case "thisMonth":
      return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), to: toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0)) };
    case "lastMonth":
      return { from: toYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: toYMD(new Date(now.getFullYear(), now.getMonth(), 0)) };
    case "last7Days":
      return { from: toYMD(addDays(now, -6)), to: toYMD(now) };
    case "last30Days":
      return { from: toYMD(addDays(now, -29)), to: toYMD(now) };
    default:
      return { from: "", to: "" };

// ─── Support utils ────────────────────────────────────────────────────────────

/** Image attachments preview inline; anything else shows as a file chip. */
export const isImageAttachment = (url?: string | null): boolean =>
  !!url && /\.(jpe?g|png|webp)(\?|$)/i.test(url);

export const formatSupportFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Read a picked file as base64 (the payload POST /support/upload expects). */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(String(reader.result ?? "").replace(/^data:[^;]+;base64,/, ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });

const sameCalendarDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

/** Compact conversation time: now, 2min, 3h, Yesterday, Tue, or Oct 1. */
export const formatSupportTime = (
  value: string,
  now = new Date(),
  locale?: string,
): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  if (elapsedMinutes < 1) return "now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}min`;
  if (sameCalendarDay(date, now)) return `${Math.floor(elapsedMinutes / 60)}h`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameCalendarDay(date, yesterday)) return "Yesterday";

  if (elapsedMs < 7 * 86_400_000) {
    return date.toLocaleDateString(locale, { weekday: "short" });
  }

  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
};

export const formatSupportDate = formatSupportTime;
export const formatSupportDateTime = formatSupportTime;

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

/** "12 Mar" — used in the conversation list. */
export const formatSupportDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

/** "12 Mar, 14:05" — used inside a conversation. */
export const formatSupportDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Support utils ────────────────────────────────────────────────────────────

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

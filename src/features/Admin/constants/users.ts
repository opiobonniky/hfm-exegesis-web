// ─── Admin Users Constants ────────────────────────────────────────────────────

export const USERS_PAGE_SIZE = 20;
export const USER_SEARCH_DEBOUNCE_MS = 300;

export const USER_ROLE_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Admin", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400" },
  2: { label: "User", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" },
};

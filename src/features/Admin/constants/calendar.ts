// ─── Admin Calendar Constants ─────────────────────────────────────────────────

export const CALENDAR_MODIFIERS = {
  sunday: (date: Date) => date.getDay() === 0,
  special: (date: Date) => date.getDate() === 1,
  today: (date: Date) => date.toDateString() === new Date().toDateString(),
};

export const CALENDAR_MODIFIER_CLASSES = {
  sunday: "text-red-600 dark:text-red-400 font-medium",
  special: "after:content-['★'] after:text-yellow-500 after:absolute after:bottom-0.5 after:right-0.5 after:text-[9px]",
  today: "bg-accent text-accent-foreground font-bold rounded-full",
};

export const CALENDAR_DISABLED = (date: Date) =>
  date > new Date("2026-12-31") || date < new Date("2020-01-01");

export const DEFAULT_FORM_DATE = () => {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  return d;
};

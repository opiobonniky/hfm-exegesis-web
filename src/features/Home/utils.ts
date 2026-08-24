// ─── Home Feature Helpers ──────────────────────────────────────────────────────

/** Time-of-day greeting */
export function getGreeting(t: any): string {
  const h = new Date().getHours();
  if (h < 5) return t?.userDashboard?.goodNight || "Good Night";
  if (h < 12) return t?.userDashboard?.goodMorning || "Good Morning";
  if (h < 17) return t?.userDashboard?.goodAfternoon || "Good Afternoon";
  return t?.userDashboard?.goodEvening || "Good Evening";
}

/** Relative time string (e.g. "5m ago") */
export function timeAgo(ds: string): string {
  if (!ds) return "";
  const diff = Date.now() - new Date(ds).getTime();
  const m = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(ds).toLocaleDateString();
}

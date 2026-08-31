// ─── Admin Dashboard Constants ────────────────────────────────────────────────

export interface AdminTool {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

export const ADMIN_TOOLS: AdminTool[] = [
  {
    title: "Trivia Management",
    description: "Create and manage Bible trivia questions and stats",
    icon: "Sparkles",
    path: "/admin/trivia",
    color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15",
  },
  {
    title: "Daily Content",
    description: "Manage daily verses, devotions, and exegesis",
    icon: "CalendarDays",
    path: "/admin/daily-content",
    color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15",
  },
  {
    title: "Subscriptions",
    description: "Manage subscription tiers and subscribers",
    icon: "CreditCard",
    path: "/admin/subscriptions",
    color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15",
  },
  {
    title: "Book Prologues",
    description: "Manage book introductions and overviews",
    icon: "ScrollText",
    path: "/admin/book-prologues",
    color: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15",
  },
  {
    title: "Verse Explanations",
    description: "Manage verse explanations and study notes",
    icon: "Lightbulb",
    path: "/admin/verse-explanations",
    color: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15",
  },
  {
    title: "Study Tools",
    description: "Words, resources, and cross-references",
    icon: "BookOpen",
    path: "/admin/study-tools",
    color: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15",
  },
];

export const ADMIN_QUICK_ACTIONS = [
  { label: "Add Daily Verse", description: "Schedule a new verse", icon: "Sun", path: "/add-daily-verse", color: "text-amber-500" },
  { label: "Add Devotion", description: "Create a new devotion", icon: "BookOpen", path: "/add-daily-devotion", color: "text-emerald-500" },
  { label: "Create Reading Plan", description: "Build a new plan", icon: "BookText", path: "/add-reading-plan", color: "text-sky-500" },
  { label: "Add Explanation", description: "Write verse explanation", icon: "BookMarked", path: "/add-explanation", color: "text-violet-500" },
  { label: "User Management", description: "Manage user accounts", icon: "Users", path: "/admin/users", color: "text-blue-500" },
  { label: "Journal Moderation", description: "Review journal entries", icon: "BookOpen", path: "/admin/journal-moderation", color: "text-rose-500" },
] as const;

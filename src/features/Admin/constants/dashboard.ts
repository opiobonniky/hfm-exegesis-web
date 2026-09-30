import { tt } from '@/components/languages/hardcodedTranslate';
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
    title: tt("Trivia Management"),
    description: tt("Create and manage Bible trivia questions and stats"),
    icon: "Sparkles",
    path: "/admin/trivia",
    color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15",
  },
  {
    title: tt("Daily Content"),
    description: tt("Manage daily verses, devotions, and exegesis"),
    icon: "CalendarDays",
    path: "/admin/daily-content",
    color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15",
  },
  {
    title: tt("Subscriptions"),
    description: tt("Manage subscription tiers and subscribers"),
    icon: "CreditCard",
    path: "/admin/subscriptions",
    color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15",
  },
  {
    title: tt("Book Prologues"),
    description: tt("Manage book introductions and overviews"),
    icon: "ScrollText",
    path: "/admin/book-prologues",
    color: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15",
  },
  {
    title: tt("Verse Explanations"),
    description: tt("Manage verse explanations and study notes"),
    icon: "Lightbulb",
    path: "/admin/verse-explanations",
    color: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15",
  },
  {
    title: tt("Study Tools"),
    description: tt("Words, resources, and cross-references"),
    icon: "BookOpen",
    path: "/admin/study-tools",
    color: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15",
  },
];

export const ADMIN_QUICK_ACTIONS = [
  { label: tt("Add Daily Verse"), description: tt("Schedule a new verse"), icon: "Sun", path: "/add-daily-verse", color: "text-amber-700 dark:text-amber-400" },
  { label: tt("Add Devotion"), description: tt("Create a new devotion"), icon: "BookOpen", path: "/add-daily-devotion", color: "text-emerald-700 dark:text-emerald-400" },
  { label: tt("Create Reading Plan"), description: tt("Build a new plan"), icon: "BookText", path: "/add-reading-plan", color: "text-sky-700 dark:text-sky-400" },
  { label: tt("Add Explanation"), description: tt("Write verse explanation"), icon: "BookMarked", path: "/add-explanation", color: "text-violet-700 dark:text-violet-400" },
  { label: tt("User Management"), description: tt("Manage user accounts"), icon: "Users", path: "/admin/users", color: "text-blue-700 dark:text-blue-400" },
  { label: tt("Journal Moderation"), description: tt("Review journal entries"), icon: "BookOpen", path: "/admin/journal-moderation", color: "text-rose-700 dark:text-rose-400" },
] as const;

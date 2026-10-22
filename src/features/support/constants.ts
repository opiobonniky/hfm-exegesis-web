// ─── Support constants ────────────────────────────────────────────────────────
import { tt } from "@/components/languages/hardcodedTranslate";
import type {
  SupportCategory,
  SupportFilter,
  SupportHelpItem,
  SupportHelpTopic,
  SupportHelpTopicId,
  SupportPriority,
  SupportStatus,
} from "./types";

export const SUPPORT_PAGE_SIZE = 20;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const SUPPORT_ATTACHMENT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
export const MAX_SUBJECT_LENGTH = 140;
export const MIN_SUBJECT_LENGTH = 3;
export const MAX_MESSAGE_LENGTH = 4000;
export const MIN_MESSAGE_LENGTH = 10;

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  technical: tt("App problem"),
  account: tt("Account"),
  bible: tt("Bible text"),
  content: tt("Study content"),
  subscription: tt("Subscription"),
  suggestion: tt("Suggestion"),
  other: tt("Something else"),
};

export const SUPPORT_CATEGORY_OPTIONS: {
  id: SupportCategory;
  label: string;
  className: string;
}[] = [
  { id: "technical", label: SUPPORT_CATEGORY_LABELS.technical, className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
  { id: "account", label: SUPPORT_CATEGORY_LABELS.account, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30" },
  { id: "bible", label: SUPPORT_CATEGORY_LABELS.bible, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  { id: "content", label: SUPPORT_CATEGORY_LABELS.content, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  { id: "subscription", label: SUPPORT_CATEGORY_LABELS.subscription, className: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30" },
  { id: "suggestion", label: SUPPORT_CATEGORY_LABELS.suggestion, className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  { id: "other", label: SUPPORT_CATEGORY_LABELS.other, className: "bg-slate-500/10 text-slate-500 border-slate-500/30" },
];

export const SUPPORT_STATUS_META: Record<
  SupportStatus,
  { label: string; className: string }
> = {
  open: { label: tt("Open"), className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
  in_progress: { label: tt("In progress"), className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" },
  resolved: { label: tt("Resolved"), className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  closed: { label: tt("Closed"), className: "bg-slate-500/10 text-slate-500 border-slate-500/30" },
};

export const SUPPORT_STATUS_OPTIONS: { id: SupportStatus; label: string }[] = [
  { id: "open", label: SUPPORT_STATUS_META.open.label },
  { id: "in_progress", label: SUPPORT_STATUS_META.in_progress.label },
  { id: "resolved", label: SUPPORT_STATUS_META.resolved.label },
  { id: "closed", label: SUPPORT_STATUS_META.closed.label },
];

export const SUPPORT_FILTERS: { id: SupportFilter; label: string }[] = [
  { id: "all", label: tt("All") },
  { id: "open", label: SUPPORT_STATUS_META.open.label },
  { id: "in_progress", label: SUPPORT_STATUS_META.in_progress.label },
  { id: "resolved", label: SUPPORT_STATUS_META.resolved.label },
];

export const SUPPORT_PRIORITIES: { id: SupportPriority; label: string }[] = [
  { id: "low", label: tt("Not urgent") },
  { id: "normal", label: tt("Normal") },
  { id: "high", label: tt("Blocking me") },
];

export const SUPPORT_QUICK_PROMPTS: string[] = [
  tt("The app closes when I open a chapter."),
  tt("My downloaded Bible disappeared after updating."),
  tt("A verse is missing text in my language."),
  tt("My subscription is active but content is locked."),
];

export const SUPPORT_ATTACH_LABEL = tt("Attach a screenshot");
export const SUPPORT_ATTACH_HINT = tt("Screenshots (jpg, png, webp) or PDF, up to 5MB.");
export const SUPPORT_REPLY_PLACEHOLDER = tt("Write a reply...");
export const SUPPORT_EXPECTED_REPLY_WINDOW = tt("We usually reply within 24 hours.");

// ─── Help centre (FAQ) ───────────────────────────────────────────────────────

/** How many featured answers appear before opening the full help centre. */
export const SUPPORT_HELP_FEATURED_LIMIT = 4;

export const SUPPORT_HELP_TOPICS: SupportHelpTopic[] = [
  {
    id: "account",
    label: tt("Account & profile"),
    description: tt("Profile details, photo, password, language and signing out"),
  },
  {
    id: "bible",
    label: tt("Reading the Bible"),
    description: tt("Versions, offline downloads, highlights, notes and audio"),
  },
  {
    id: "study",
    label: tt("Study tools"),
    description: tt("Reading plans, journal, trivia, Lab and Strong's"),
  },
  {
    id: "subscription",
    label: tt("Sower subscription"),
    description: tt("Tiers, billing, cancelling and locked content"),
  },
  {
    id: "notifications",
    label: tt("Notifications"),
    description: tt("Daily verse, plan reminders and time zone"),
  },
  {
    id: "support",
    label: tt("Contacting support"),
    description: tt("Messages, attachments and reply times"),
  },
];

export const SUPPORT_HELP_TOPIC_BY_ID: Record<SupportHelpTopicId, SupportHelpTopic> =
  SUPPORT_HELP_TOPICS.reduce(
    (acc, topic) => ({ ...acc, [topic.id]: topic }),
    {} as Record<SupportHelpTopicId, SupportHelpTopic>,
  );

export const SUPPORT_HELP_ITEMS: SupportHelpItem[] = [
  // ── Account & profile ────────────────────────────────────────────────────
  {
    id: "edit-profile",
    topic: "account",
    featured: true,
    question: tt("How do I edit my profile?"),
    answer: tt(
      "Your name, email, phone number, date of birth, gender and marital status can all be changed from the Edit Profile screen.",
    ),
    steps: [
      tt("Open Settings, then choose Edit Profile."),
      tt("Update the fields you want to change."),
      tt("Save your changes."),
    ],
    keywords: ["name", "email", "phone", "details", "update", "account"],
    category: "account",
    link: { label: tt("Open Settings"), route: "settings" },
  },
  {
    id: "forgot-password",
    topic: "account",
    featured: true,
    question: tt("I forgot my password. How do I reset it?"),
    answer: tt(
      "On the sign-in screen choose Forgot password. Enter your email, type the verification code we send you, then choose a new password.",
    ),
    steps: [
      tt("Sign out if you are still signed in, then choose Forgot password."),
      tt("Enter the email on your account and request a code."),
      tt("Enter the code, then set and confirm your new password."),
    ],
    keywords: ["password", "reset", "login", "sign in", "locked out", "code"],
    category: "account",
    link: { label: tt("Open Settings"), route: "settings" },
  },
  {
    id: "change-language",
    topic: "account",
    question: tt("How do I change the language or theme?"),
    answer: tt(
      "Open Settings to change the language and switch between light and dark mode. Right-to-left languages such as Arabic and Hebrew flip the layout automatically.",
    ),
    keywords: ["language", "translate", "rtl", "dark mode", "theme", "light mode"],
    category: "account",
    link: { label: tt("Open Settings"), route: "settings" },
  },
  {
    id: "change-username",
    topic: "account",
    question: tt("Can I change my username?"),
    answer: tt(
      "Usernames are fixed once an account is created. If yours needs to change, send us a message from this page using the Account category and we will help.",
    ),
    keywords: ["username", "handle", "rename"],
    category: "account",
  },
  {
    id: "delete-account",
    topic: "account",
    question: tt("How do I delete my account?"),
    answer: tt(
      "Account deletion is handled by our team. Send us a message with the Account category from the email on your account and we will confirm before anything is removed.",
    ),
    keywords: ["delete", "remove", "close account", "privacy", "gdpr"],
    category: "account",
  },

  // ── Reading the Bible ────────────────────────────────────────────────────
  {
    id: "switch-version",
    topic: "bible",
    featured: true,
    question: tt("How do I switch Bible versions?"),
    answer: tt(
      "While reading, open the Bible Library and pick the version you want. Downloaded versions switch instantly; others download first.",
    ),
    keywords: ["version", "translation", "kjv", "niv", "esv", "switch"],
    category: "bible",
    link: { label: tt("Open Bible Library"), route: "bibleBookSelectionLegacyLibrary" },
  },
  {
    id: "highlight-note",
    topic: "bible",
    question: tt("How do I highlight a verse or add a note?"),
    answer: tt(
      "Select a verse, then choose Highlight, Note or Favorite from the action bar. Everything you save appears under Highlights, Notes and Favorites.",
    ),
    keywords: ["highlight", "note", "favorite", "bookmark", "select"],
    category: "bible",
    link: { label: tt("Open Highlights"), route: "highlights" },
  },
  {
    id: "sync-devices",
    topic: "bible",
    question: tt("Do my highlights, notes and journal sync across devices?"),
    answer: tt(
      "Yes. They are saved to your account, so signing in on another phone or on the web shows the same highlights, notes, favorites and journal entries.",
    ),
    keywords: ["sync", "cloud", "devices", "backup", "lost"],
    category: "technical",
  },
  {
    id: "font-dark-mode",
    topic: "bible",
    question: tt("How do I change the text size?"),
    answer: tt(
      "Open Reading Settings to adjust the text size with a live preview.",
    ),
    keywords: ["font", "text size", "bigger", "reading"],
    category: "technical",
    link: { label: tt("Open Reading Settings"), route: "readingSettings" },
  },
  {
    id: "audio-bible",
    topic: "bible",
    question: tt("How do I listen to the Bible being read aloud?"),
    answer: tt(
      "Use the read-aloud control while reading a chapter. Voice, speed and pitch can be changed under Voice Settings, where you can also preview voices.",
    ),
    keywords: ["audio", "listen", "voice", "tts", "read aloud", "speed", "narration"],
    category: "technical",
    link: { label: tt("Open Voice Settings"), route: "voiceSettings" },
  },

  // ── Study tools ──────────────────────────────────────────────────────────
  {
    id: "start-reading-plan",
    topic: "study",
    featured: true,
    question: tt("How do I start a reading plan?"),
    answer: tt(
      "Open Reading Plans, pick a plan and start it. Each day lists the chapters to read and, for some plans, a short reflection or quiz.",
    ),
    keywords: ["plan", "reading plan", "daily reading", "schedule", "progress"],
    category: "content",
    link: { label: tt("Open Reading Plans"), route: "readingPlans" },
  },
  {
    id: "journal",
    topic: "study",
    question: tt("How do I write in my journal?"),
    answer: tt(
      "Open the Journal and create a new entry. You can start from a prompt or template, and entries are saved to your account.",
    ),
    keywords: ["journal", "diary", "entry", "reflection", "write"],
    category: "content",
    link: { label: tt("Open Journal"), route: "journal" },
  },
  {
    id: "trivia",
    topic: "study",
    question: tt("How does Bible Trivia work?"),
    answer: tt(
      "Pick a difficulty and answer questions to earn badges for milestones, streaks and exploration. Your best session and streak are kept on your account.",
    ),
    keywords: ["trivia", "quiz", "badges", "streak", "leaderboard", "score"],
    category: "content",
    link: { label: tt("Open Trivia"), route: "trivia" },
  },
  {
    id: "lab-strongs",
    topic: "study",
    question: tt("What are Bible Study (Lab) and Strong's Dictionary?"),
    answer: tt(
      "Bible Study walks you through a passage step by step with guided questions, and Strong's Dictionary lets you look up the original Hebrew and Greek words. Both are part of the Sower subscription.",
    ),
    keywords: ["lab", "study", "strongs", "hebrew", "greek", "word study", "concordance"],
    category: "content",
    link: { label: tt("Open Bible Study"), route: "bibleStudy" },
  },

  // ── Sower subscription ───────────────────────────────────────────────────
  {
    id: "what-is-sower",
    topic: "subscription",
    featured: true,
    question: tt("What is a Sower subscription and what does it unlock?"),
    answer: tt(
      "Sower is our supporter plan. Legacy Sower unlocks Strong's, verse explanations, Bible Study (Lab) and the journal; Covenant Sower adds priority support. Free accounts keep full Bible reading, the daily verse and basic tools.",
    ),
    keywords: ["sower", "premium", "tier", "legacy", "covenant", "unlock", "locked", "price"],
    category: "subscription",
    link: { label: tt("View Sower plans"), route: "sower" },
  },
  {
    id: "subscribe",
    topic: "subscription",
    question: tt("How do I subscribe?"),
    answer: tt(
      "Open the Sower page, choose a tier and subscribe. Checkout opens securely; once payment completes, return to the app and your access updates automatically.",
    ),
    keywords: ["subscribe", "pay", "checkout", "stripe", "upgrade"],
    category: "subscription",
    link: { label: tt("Open Sower"), route: "sower" },
  },
  {
    id: "manage-cancel",
    topic: "subscription",
    question: tt("How do I cancel, change my plan or update my card?"),
    answer: tt(
      "Open the billing portal from your subscription settings. You can cancel, switch tiers or change the payment method there; access continues until the end of the paid period.",
    ),
    keywords: ["cancel", "refund", "card", "billing", "portal", "downgrade", "invoice"],
    category: "subscription",
    link: { label: tt("Open Sower"), route: "sower" },
  },
  {
    id: "paid-but-locked",
    topic: "subscription",
    question: tt("I paid but content is still locked. What should I do?"),
    answer: tt(
      "Refresh the page or sign out and back in — access usually updates within a minute. If it is still locked, message us with the Subscription category and the email used at checkout.",
    ),
    keywords: ["locked", "paid", "not working", "access", "expired", "restore"],
    category: "subscription",
    link: { label: tt("Open Sower"), route: "sower" },
  },

  // ── Notifications ────────────────────────────────────────────────────────
  {
    id: "daily-verse-notification",
    topic: "notifications",
    question: tt("How do I turn the daily verse notification on or off?"),
    answer: tt(
      "Open Notification Settings. Toggle the daily verse reminder and pick the time you would like to receive it.",
    ),
    keywords: ["daily verse", "push", "notification", "reminder", "time"],
    category: "technical",
    link: { label: tt("Open Notification Settings"), route: "notificationSettings" },
  },
  {
    id: "plan-reminder",
    topic: "notifications",
    question: tt("Can I get a reminder for my reading plan?"),
    answer: tt(
      "Yes. In Notification Settings turn on the reading plan reminder and choose a time.",
    ),
    keywords: ["reminder", "plan", "behind", "nudge", "schedule"],
    category: "technical",
    link: { label: tt("Open Notification Settings"), route: "notificationSettings" },
  },
  {
    id: "notifications-not-arriving",
    topic: "notifications",
    question: tt("Notifications arrive at the wrong time or not at all."),
    answer: tt(
      "Check the time zone in Notification Settings matches where you are, and make sure notifications are allowed in your browser or device settings and battery optimisation is not blocking them.",
    ),
    keywords: ["time zone", "late", "missing", "not receiving", "permissions"],
    category: "technical",
    link: { label: tt("Open Notification Settings"), route: "notificationSettings" },
  },

  // ── Contacting support ───────────────────────────────────────────────────
  {
    id: "contact-support",
    topic: "support",
    question: tt("How do I contact the team?"),
    answer: tt(
      "Choose New message on this page, pick a category, describe the problem and send. You can attach a screenshot, and every reply shows up in the same conversation.",
    ),
    keywords: ["contact", "message", "ticket", "help", "complaint"],
    category: "other",
  },
  {
    id: "attachments",
    topic: "support",
    question: tt("What can I attach to a message?"),
    answer: tt(
      "Images (JPG, PNG or WebP) or PDFs up to 5MB. A screenshot of the problem helps us fix it much faster.",
    ),
    keywords: ["attachment", "screenshot", "image", "file", "size", "5mb"],
    category: "other",
  },
  {
    id: "reply-time",
    topic: "support",
    question: tt("How long does a reply take?"),
    answer: tt(
      "We usually reply within 24 hours. Marking a message as Blocking me tells us it is urgent, and you will see a badge when we answer.",
    ),
    keywords: ["reply", "response time", "wait", "urgent", "how long"],
    category: "other",
  },
  {
    id: "ticket-status",
    topic: "support",
    question: tt("What do the conversation statuses mean?"),
    answer: tt(
      "Open means we have not picked it up yet, In progress means a team member is working on it, Resolved means we believe it is fixed and Closed means the conversation is finished. Replying to a resolved or closed conversation reopens it.",
    ),
    keywords: ["status", "open", "in progress", "resolved", "closed", "reopen"],
    category: "other",
  },
];

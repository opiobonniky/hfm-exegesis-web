// ─── Support constants ────────────────────────────────────────────────────────
import { tt } from "@/components/languages/hardcodedTranslate";
import type {
  SupportCategory,
  SupportFilter,
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
  { id: "technical", label: SUPPORT_CATEGORY_LABELS.technical, className: "bg-sky-500/10 text-sky-600 border-sky-500/30" },
  { id: "account", label: SUPPORT_CATEGORY_LABELS.account, className: "bg-violet-500/10 text-violet-600 border-violet-500/30" },
  { id: "bible", label: SUPPORT_CATEGORY_LABELS.bible, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  { id: "content", label: SUPPORT_CATEGORY_LABELS.content, className: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { id: "subscription", label: SUPPORT_CATEGORY_LABELS.subscription, className: "bg-pink-500/10 text-pink-600 border-pink-500/30" },
  { id: "suggestion", label: SUPPORT_CATEGORY_LABELS.suggestion, className: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
  { id: "other", label: SUPPORT_CATEGORY_LABELS.other, className: "bg-slate-500/10 text-slate-500 border-slate-500/30" },
];

export const SUPPORT_STATUS_META: Record<
  SupportStatus,
  { label: string; className: string }
> = {
  open: { label: tt("Open"), className: "bg-sky-500/10 text-sky-600 border-sky-500/30" },
  in_progress: { label: tt("In progress"), className: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  resolved: { label: tt("Resolved"), className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
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
export const SUPPORT_REPLY_PLACEHOLDER = tt("Write a reply…");
export const SUPPORT_EXPECTED_REPLY_WINDOW = tt("We usually reply within 24 hours.");

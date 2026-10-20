import type { ReactNode } from "react";

// ─── Support types ────────────────────────────────────────────────────────────
// Mirror the backend /support module payloads (app + web share the shape).

export type SupportCategory =
  | "account"
  | "bible"
  | "content"
  | "subscription"
  | "technical"
  | "suggestion"
  | "other";

export type SupportPriority = "low" | "normal" | "high";

export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";

export type SupportSenderRole = "user" | "admin";

/** List filter — every status, or no status filter at all. */
export type SupportFilter = "all" | SupportStatus;

export interface SupportMessage {
  id: number;
  ticketId: number;
  senderId: string;
  senderRole: SupportSenderRole;
  body: string;
  attachment?: string | null;
  attachmentName?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdOn: string;
}

export interface SupportUserSummary {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email?: string | null;
  profilePhotoUrl?: string | null;
  subscriptionTier?: string | null;
}

export interface SupportTicketSummary {
  id: number;
  ticketCode: string;
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  adminUnread: boolean;
  userUnread: boolean;
  lastMessageAt: string;
  createdOn: string;
  updatedOn: string;
  resolvedAt: string | null;
  messageCount: number;
  lastMessage: {
    id?: number;
    body: string;
    senderRole: SupportSenderRole;
    createdOn: string;
    attachment?: string | null;
    attachmentName?: string | null;
    deliveredAt?: string | null;
    readAt?: string | null;
  } | null;
  user?: SupportUserSummary | null;
}

export interface SupportTicketDetail extends SupportTicketSummary {
  deviceInfo: string | null;
  userId?: string;
  messages: SupportMessage[];
}

export interface SupportTicketsPage {
  tickets: SupportTicketSummary[];
  totalCount: number;
  unreadCount?: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SupportStats {
  counts: Record<SupportStatus, number>;
  totalCount: number;
  unreadCount: number;
}

export interface SupportUnreadSummary {
  userUnreadCount: number;
  adminUnreadCount: number;
}

/** A file stored by POST /support/upload, ready to attach to a message. */
export interface SupportAttachment {
  url: string;
  name: string;
  size?: number;
  type?: string;
}

// ─── Component prop contracts (kept here by feature convention) ──────────────
export interface SupportTicketListProps {
  tickets: SupportTicketSummary[];
  onSelect: (ticket: SupportTicketSummary) => void;
  showUser?: boolean;
  emptyMessage?: string;
}

export interface SupportThreadProps {
  ticket: SupportTicketDetail;
  viewerRole?: SupportSenderRole;
  reply: string;
  sending: boolean;
  attachment: SupportAttachment | null;
  uploadingAttachment: boolean;
  onChangeReply: (value: string) => void;
  onSend: () => void;
  onSelectFile: (file: File) => void;
  onClearAttachment: () => void;
  onMessagesVisible?: () => void;
  footer?: ReactNode;
}

export interface SupportComposerProps {
  attachment: SupportAttachment | null;
  uploadingAttachment: boolean;
  onSelectFile: (file: File) => void;
  onClearAttachment: () => void;
  subject: string;
  message: string;
  category: SupportCategory;
  priority: SupportPriority;
  submitting: boolean;
  canSubmit: boolean;
  onChangeSubject: (value: string) => void;
  onChangeMessage: (value: string) => void;
  onChangeCategory: (value: SupportCategory) => void;
  onChangePriority: (value: SupportPriority) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface NewSupportTicketPayload {
  subject: string;
  message: string;
  category: SupportCategory;
  priority?: SupportPriority;
  deviceInfo?: string;
  attachment?: string | null;
  attachmentName?: string | null;
}

// ─── Help centre (FAQ) ───────────────────────────────────────────────────────

/** Grouping bucket for help articles — shown as chips above the list. */
export type SupportHelpTopicId =
  | "account"
  | "bible"
  | "study"
  | "subscription"
  | "notifications"
  | "support";

export interface SupportHelpTopic {
  id: SupportHelpTopicId;
  label: string;
  description: string;
}

/** In-app destination offered at the bottom of an answer ("Open settings"). */
export interface SupportHelpLink {
  label: string;
  /** Key into the app's route config (see @/components/Routes/routes). */
  route: string;
}

export interface SupportHelpItem {
  id: string;
  topic: SupportHelpTopicId;
  question: string;
  /** Short plain-language answer, shown first. */
  answer: string;
  /** Optional numbered steps shown under the answer. */
  steps?: string[];
  /** Extra words that should match this item when searching. */
  keywords?: string[];
  /** Pre-selected category when the reader still needs to message us. */
  category: SupportCategory;
  link?: SupportHelpLink;
  /** Surfaced on the Support page before opening the full help centre. */
  featured?: boolean;
}

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
    body: string;
    senderRole: SupportSenderRole;
    createdOn: string;
    attachment?: string | null;
    attachmentName?: string | null;
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
  reply: string;
  sending: boolean;
  attachment: SupportAttachment | null;
  uploadingAttachment: boolean;
  onChangeReply: (value: string) => void;
  onSend: () => void;
  onSelectFile: (file: File) => void;
  onClearAttachment: () => void;
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

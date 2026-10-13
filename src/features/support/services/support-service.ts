// ─── Support service ──────────────────────────────────────────────────────────
// The feature's single data-access entry — every call goes through the shared
// api helper so auth headers, retries and error shaping stay consistent.
import { sendPostRequest } from "@/services/api";
import type {
  NewSupportTicketPayload,
  SupportAttachment,
  SupportStats,
  SupportTicketDetail,
  SupportTicketsPage,
  SupportUnreadSummary,
} from "../types";

/** Store a screenshot/PDF so it can be attached to a message. */
export const uploadSupportAttachment = (attachment: {
  attachment: string;
  fileName: string;
}) => sendPostRequest<SupportAttachment>("support", "upload", attachment);

// ── Reader endpoints ─────────────────────────────────────────────────────────
export const createSupportTicket = (payload: NewSupportTicketPayload) =>
  sendPostRequest<SupportTicketDetail>("support", "create", payload);

export const getMySupportTickets = (params: {
  status?: string;
  page?: number;
  pageSize?: number;
}) => sendPostRequest<SupportTicketsPage>("support", "get-my-tickets", params);

export const getSupportTicket = (ticketId: number, markRead = true) =>
  sendPostRequest<SupportTicketDetail>("support", "get-ticket", {
    ticketId,
    markRead,
  });

export const getSupportUnreadSummary = () =>
  sendPostRequest<SupportUnreadSummary>("support", "get-unread", {});

export const replyToSupportTicket = (
  ticketId: number,
  message: string,
  attachment?: SupportAttachment | null,
) =>
  sendPostRequest<SupportTicketDetail>("support", "reply", {
    ticketId,
    message,
    attachment: attachment?.url ?? null,
    attachmentName: attachment?.name ?? null,
  });

// ── Admin endpoints ──────────────────────────────────────────────────────────
export const getAdminSupportTickets = (params: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) => sendPostRequest<SupportTicketsPage>("support", "admin/get-tickets", params);

export const getAdminSupportTicket = (ticketId: number, markRead = true) =>
  sendPostRequest<SupportTicketDetail>("support", "admin/get-ticket", {
    ticketId,
    markRead,
  });

export const adminReplyToTicket = (
  ticketId: number,
  message: string,
  attachment?: SupportAttachment | null,
) =>
  sendPostRequest<SupportTicketDetail>("support", "admin/reply", {
    ticketId,
    message,
    attachment: attachment?.url ?? null,
    attachmentName: attachment?.name ?? null,
  });

export const updateSupportTicketStatus = (
  ticketId: number,
  status: string,
) =>
  sendPostRequest<SupportTicketDetail>("support", "admin/update-status", {
    ticketId,
    status,
  });

export const getSupportStats = () =>
  sendPostRequest<SupportStats>("support", "admin/stats", {});

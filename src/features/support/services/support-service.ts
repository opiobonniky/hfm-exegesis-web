// ─── Support service ──────────────────────────────────────────────────────────
// The feature's single data-access entry — every call goes through the shared
// api helper so auth headers, retries and error shaping stay consistent.
import { sendPostRequest } from "@/services/api";
import type {
  NewSupportTicketPayload,
  SupportStats,
  SupportTicketDetail,
  SupportTicketsPage,
} from "../types";

// ── Reader endpoints ─────────────────────────────────────────────────────────
export const createSupportTicket = (payload: NewSupportTicketPayload) =>
  sendPostRequest<SupportTicketDetail>("support", "create", payload);

export const getMySupportTickets = (params: {
  status?: string;
  page?: number;
  pageSize?: number;
}) => sendPostRequest<SupportTicketsPage>("support", "get-my-tickets", params);

export const getSupportTicket = (ticketId: number) =>
  sendPostRequest<SupportTicketDetail>("support", "get-ticket", { ticketId });

export const replyToSupportTicket = (ticketId: number, message: string) =>
  sendPostRequest<SupportTicketDetail>("support", "reply", { ticketId, message });

// ── Admin endpoints ──────────────────────────────────────────────────────────
export const getAdminSupportTickets = (params: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) => sendPostRequest<SupportTicketsPage>("support", "admin/get-tickets", params);

export const getAdminSupportTicket = (ticketId: number) =>
  sendPostRequest<SupportTicketDetail>("support", "admin/get-ticket", { ticketId });

export const adminReplyToTicket = (ticketId: number, message: string) =>
  sendPostRequest<SupportTicketDetail>("support", "admin/reply", { ticketId, message });

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

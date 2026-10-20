import { describe, expect, it } from "vitest";
import {
  appendThreadMessage,
  formatSupportTime,
  mergeTicketSummary,
  mergeTicketSummaryIntoDetail,
  mergeThreadSnapshot,
} from "./utils";
import type { SupportMessage, SupportTicketDetail, SupportTicketSummary } from "./types";

const ticket = (
  overrides: Partial<SupportTicketSummary> = {},
): SupportTicketSummary => ({
  id: 1,
  ticketCode: "SUP-1",
  subject: "Help",
  category: "technical",
  priority: "normal",
  status: "open",
  adminUnread: false,
  userUnread: false,
  lastMessageAt: "2026-01-15T07:00:00.000Z",
  createdOn: "2026-01-15T06:00:00.000Z",
  updatedOn: "2026-01-15T07:00:00.000Z",
  resolvedAt: null,
  messageCount: 1,
  lastMessage: null,
  ...overrides,
});

const message = (overrides: Partial<SupportMessage> = {}): SupportMessage => ({
  id: 10,
  ticketId: 1,
  senderId: "admin-1",
  senderRole: "admin",
  body: "We fixed it.",
  createdOn: "2026-01-15T07:05:00.000Z",
  ...overrides,
});

describe("formatSupportTime", () => {
  const now = new Date(2026, 9, 16, 12, 0, 0);

  it("formats recent activity compactly", () => {
    expect(formatSupportTime(new Date(2026, 9, 16, 11, 59, 40).toISOString(), now)).toBe("now");
    expect(formatSupportTime(new Date(2026, 9, 16, 11, 58).toISOString(), now)).toBe("2min");
    expect(formatSupportTime(new Date(2026, 9, 16, 9).toISOString(), now)).toBe("3h");
  });

  it("formats older activity conversationally", () => {
    expect(formatSupportTime(new Date(2026, 9, 15, 10).toISOString(), now)).toBe("Yesterday");
    expect(formatSupportTime(new Date(2026, 9, 13, 10).toISOString(), now, "en-US")).toBe("Tue");
    expect(formatSupportTime(new Date(2026, 9, 1, 10).toISOString(), now, "en-US")).toBe("Oct 1");
  });
});

describe("mergeTicketSummary", () => {
  it("updates an existing ticket and moves it to the top", () => {
    const result = mergeTicketSummary(
      [ticket({ id: 1 }), ticket({ id: 2 })],
      ticket({ id: 2, subject: "Updated", userUnread: true }),
    );
    expect(result.map(item => item.id)).toEqual([2, 1]);
    expect(result[0].subject).toBe("Updated");
  });

  it("respects the status filter for inserts and removals", () => {
    expect(mergeTicketSummary([], ticket({ id: 9, status: "closed" }), { filter: "open" }))
      .toEqual([]);
    expect(
      mergeTicketSummary([ticket({ id: 1, status: "open" })], ticket({ id: 1, status: "closed" }), {
        filter: "open",
      }),
    ).toEqual([]);
  });

  it("can refuse to insert when the inbox is narrowed by search", () => {
    const result = mergeTicketSummary([], ticket({ id: 9 }), {
      filter: "all",
      allowInsert: false,
    });
    expect(result).toEqual([]);
  });
});

describe("appendThreadMessage", () => {
  it('preserves newer socket messages and receipts during snapshot recovery', () => {
    const current = { ...ticket(), messages: [message({ id: 1, readAt: '2026-01-15T07:07:00.000Z' }), message({ id: 2 })] };
    const result = mergeThreadSnapshot(current, { ...ticket(), messages: [message({ id: 1, readAt: null })] });
    expect(result.messages.map(item => item.id)).toEqual([1, 2]);
    expect(result.messages[0].readAt).toBe('2026-01-15T07:07:00.000Z');
  });
  it("appends new messages and ignores duplicates", () => {
    const existing = [message({ id: 1 })];
    expect(appendThreadMessage(existing, message({ id: 2 }))).toHaveLength(2);
    expect(appendThreadMessage(existing, message({ id: 1 }))).toBe(existing);
  });
});

describe("mergeTicketSummaryIntoDetail", () => {
  const detail: SupportTicketDetail = {
    ...ticket({ id: 1 }),
    deviceInfo: "web",
    messages: [message({ id: 1 })],
  };

  it("overlays summary fields while keeping messages", () => {
    const result = mergeTicketSummaryIntoDetail(
      detail,
      ticket({ id: 1, status: "in_progress", adminUnread: true }),
    );
    expect(result.status).toBe("in_progress");
    expect(result.messages).toBe(detail.messages);
  });

  it("applies the latest receipt to the matching bubble", () => {
    const result = mergeTicketSummaryIntoDetail(
      detail,
      ticket({
        id: 1,
        lastMessage: {
          id: 1,
          body: "We fixed it.",
          senderRole: "user",
          createdOn: "2026-01-15T07:05:00.000Z",
          deliveredAt: "2026-01-15T07:06:00.000Z",
          readAt: "2026-01-15T07:07:00.000Z",
        },
      }),
    );

    expect(result.messages[0]).toMatchObject({
      deliveredAt: "2026-01-15T07:06:00.000Z",
      readAt: "2026-01-15T07:07:00.000Z",
    });
  });

  it("ignores a summary for a different ticket", () => {
    expect(mergeTicketSummaryIntoDetail(detail, ticket({ id: 5 }))).toBe(detail);
  });
});

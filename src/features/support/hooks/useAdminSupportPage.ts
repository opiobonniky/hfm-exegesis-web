// State, effects and actions for the admin support inbox.
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { routes } from "@/components/Routes/routes";
import { tt } from "@/components/languages/hardcodedTranslate";
import {
  adminReplyToTicket,
  getAdminSupportTicket,
  getAdminSupportTickets,
  getSupportStats,
  updateSupportTicketStatus,
} from "../services/support-service";
import { SUPPORT_PAGE_SIZE } from "../constants";
import { useSupportAttachment } from "./useSupportAttachment";
import {
  appendThreadMessage,
  mergeTicketSummary,
  mergeTicketSummaryIntoDetail,
  mergeThreadSnapshot,
} from "../utils";
import type {
  SupportCategory,
  SupportFilter,
  SupportMessage,
  SupportStats,
  SupportStatus,
  SupportTicketDetail,
  SupportTicketSummary,
} from "../types";
import {
  useSupportRealtime,
  type SupportRealtimePayload,
} from "../contexts/SupportRealtimeContext";

export function useAdminSupportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUnread, subscribe, connected, syncThread } = useSupportRealtime();
  const [peerOnline, setPeerOnline] = useState(false);
  const attachmentPicker = useSupportAttachment();
  const pickedAttachment = attachmentPicker.data.attachment;
  const uploadingAttachment = attachmentPicker.data.uploading;
  const selectAttachment = attachmentPicker.actions.selectFile;
  const clearAttachment = attachmentPicker.actions.clear;

  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SupportFilter>("all");
  const [category, setCategory] = useState<SupportCategory | "all">("all");
  const [search, setSearch] = useState("");

  const [activeTicket, setActiveTicket] = useState<SupportTicketDetail | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const listRequestSequence = useRef(0);
  const threadRequestSequence = useRef(0);
  const activeId = useRef<number | undefined>();
  activeId.current = activeTicket?.id;
  const activeUserId = useRef<string | undefined>();
  activeUserId.current = activeTicket?.userId;
  const sendingRef = useRef(sending);
  sendingRef.current = sending;

  const load = useCallback(
    async (
      overrides?: { filter?: SupportFilter; category?: SupportCategory | "all"; search?: string },
      showLoading = false,
    ) => {
      const sequence = ++listRequestSequence.current;
      if (showLoading) setLoading(true);
      const activeFilter = overrides?.filter ?? filter;
      const activeCategory = overrides?.category ?? category;
      const activeSearch = overrides?.search ?? search;

      try {
        const [listRes, statsRes] = await Promise.all([
          getAdminSupportTickets({
            page: 1,
            pageSize: SUPPORT_PAGE_SIZE,
            ...(activeFilter === "all" ? {} : { status: activeFilter }),
            ...(activeCategory === "all" ? {} : { category: activeCategory }),
            ...(activeSearch.trim() ? { search: activeSearch.trim() } : {}),
          }),
          getSupportStats(),
        ]);

        if (sequence !== listRequestSequence.current) return;

        if (listRes.returnCode === 200 && listRes.returnData) {
          setTickets(listRes.returnData.tickets ?? []);
          setTotalCount(listRes.returnData.totalCount ?? 0);
          setError(null);
        } else {
          setError(listRes.returnMessage || tt("Could not load conversations."));
        }

        if (statsRes.returnCode === 200 && statsRes.returnData) {
          setStats(statsRes.returnData);
        }
      } catch (err) {
        if (sequence !== listRequestSequence.current) return;
        setError((err as Error)?.message || tt("Could not load conversations."));
      } finally {
        if (sequence === listRequestSequence.current) setLoading(false);
      }
    },
    [filter, category, search],
  );

  // Socket.IO does not replay missed events. Reconcile on reconnect/foreground
  // and periodically; use REST only when the socket/older server is unavailable.
  useEffect(() => {
    let disposed = false;
    let busy = false;
    const recover = async () => {
      if (busy || document.visibilityState !== 'visible') return;
      busy = true;
      const id = activeId.current;
      try {
        if (id && !sendingRef.current) {
          let ticket: SupportTicketDetail | undefined;
          try {
            const snapshot = await syncThread(id, false);
            ticket = snapshot.ticket;
            if (!disposed) setPeerOnline(snapshot.presence?.userOnline === true);
          } catch {
            const response = await getAdminSupportTicket(id, false);
            if (response.returnCode === 200) ticket = response.returnData;
            if (!disposed) setPeerOnline(false);
          }
          if (!disposed && activeId.current === id && ticket) {
            const snapshot = ticket;
            setActiveTicket(current => mergeThreadSnapshot(current, snapshot));
          }
        }
        if (!disposed) await load();
      } finally { busy = false; }
    };
    void recover();
    const timer = setInterval(() => { void recover(); }, 10000);
    document.addEventListener('visibilitychange', recover);
    return () => { disposed = true; clearInterval(timer); document.removeEventListener('visibilitychange', recover); };
  }, [connected, activeTicket?.id, syncThread, load]);

  useEffect(() => {
    load(undefined, true).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFilter = useCallback(
    (next: SupportFilter) => {
      setFilter(next);
      load({ filter: next }).catch(() => {});
    },
    [load],
  );

  const changeCategory = useCallback(
    (next: SupportCategory | "all") => {
      setCategory(next);
      load({ category: next }).catch(() => {});
    },
    [load],
  );

  const runSearch = useCallback(() => {
    load({ search }).catch(() => {});
  }, [load, search]);

  const openThread = useCallback(
    async (ticket: SupportTicketSummary) => {
      const sequence = ++threadRequestSequence.current;
      setLoadingThread(true);
      setActiveTicket(null);
      try {
        let res;
        try {
          const snapshot = await syncThread(ticket.id, false);
          res = { returnCode: 200, returnData: snapshot.ticket, returnMessage: '' };
          if (sequence === threadRequestSequence.current) setPeerOnline(snapshot.presence?.userOnline === true);
        } catch {
          res = await getAdminSupportTicket(ticket.id, false);
        }
        if (sequence !== threadRequestSequence.current) return;
        if (res.returnCode === 200 && res.returnData) {
          setActiveTicket(res.returnData);
        } else {
          toast({ title: tt("Could not open conversation"), description: res.returnMessage });
        }
      } catch (err) {
        if (sequence !== threadRequestSequence.current) return;
        toast({ title: tt("Could not open conversation"), description: (err as Error)?.message });
      } finally {
        if (sequence === threadRequestSequence.current) setLoadingThread(false);
      }
    },
    [toast, syncThread],
  );

  const markThreadRead = useCallback(async () => {
    const ticket = activeTicket;
    if (!ticket || document.visibilityState !== "visible") return;
    if (!ticket.adminUnread && !ticket.messages.some(message => message.senderRole === 'user' && !message.readAt)) return;
    const sequence = ++threadRequestSequence.current;
    try {
      let response;
      try {
        const snapshot = await syncThread(ticket.id, true);
        response = { returnCode: 200, returnData: snapshot.ticket };
      } catch {
        response = await getAdminSupportTicket(ticket.id, true);
      }
      if (
        sequence !== threadRequestSequence.current ||
        response.returnCode !== 200 ||
        !response.returnData
      ) return;
      setActiveTicket(current => current?.id === ticket.id ? mergeThreadSnapshot(current, response.returnData!) : current);
      setTickets(current =>
        current.map(item => item.id === ticket.id ? { ...item, adminUnread: false } : item),
      );
      load().catch(() => {});
      refreshUnread().catch(() => {});
    } catch {
      // A later realtime refresh retries the read acknowledgement.
    }
  }, [activeTicket, load, refreshUnread, syncThread]);

  const applyTicketDelta = useCallback(
    (incoming: SupportTicketSummary) => {
      // Only inject brand-new tickets when no narrowing filter is active.
      const allowInsert = filter === "all" && category === "all" && !search.trim();
      setTickets(current => mergeTicketSummary(current, incoming, { filter, allowInsert }));
      setActiveTicket(current =>
        current ? mergeTicketSummaryIntoDetail(current, incoming) : current,
      );
    },
    [filter, category, search],
  );

  const applyMessageDelta = useCallback((incoming: SupportMessage) => {
    setActiveTicket(current => {
      if (!current || String(current.id) !== String(incoming.ticketId)) return current;
      return { ...current, messages: appendThreadMessage(current.messages, incoming) };
    });
  }, []);

  // Apply socket payloads directly; only the small stats aggregate is refreshed.
  useEffect(
    () =>
      subscribe(payload => {
        const event = payload as SupportRealtimePayload;
        if (event.userId === activeUserId.current && typeof event.userOnline === 'boolean') {
          setPeerOnline(event.userOnline);
          return;
        }
        if (Array.isArray(event.messageIds)) {
          const ids = new Set(event.messageIds.map(String));
          const deliveredAt = event.deliveredAt ?? event.at;
          const readAt = event.readAt;
          setActiveTicket(current =>
            current
              ? {
                  ...current,
                  messages: current.messages.map(message => {
                    if (!ids.has(String(message.id))) return message;
                    return {
                      ...message,
                      ...(deliveredAt && !message.deliveredAt
                        ? { deliveredAt }
                        : {}),
                      ...(readAt && !message.readAt ? { readAt } : {}),
                    };
                  }),
                }
              : current,
          );
          return;
        }
        if (event.ticket) {
          applyTicketDelta(event.ticket as SupportTicketSummary);
          if (event.message) applyMessageDelta(event.message as SupportMessage);
          getSupportStats()
            .then(res => {
              if (res.returnCode === 200 && res.returnData) setStats(res.returnData);
            })
            .catch(() => {});
        }
      }),
    [subscribe, applyTicketDelta, applyMessageDelta],
  );

  const closeThread = useCallback(() => {
    threadRequestSequence.current += 1;
    setActiveTicket(null);
    setReply("");
  }, []);

  const sendReply = useCallback(async () => {
    const body = reply.trim();
    if ((!body && !pickedAttachment) || !activeTicket) return;
    setSending(true);
    try {
      const res = await adminReplyToTicket(activeTicket.id, body, pickedAttachment);
      if (res.returnCode === 200 && res.returnData) {
        const snapshot = res.returnData;
        setActiveTicket(current => mergeThreadSnapshot(current, snapshot));
        setReply("");
        clearAttachment();
        toast({ title: tt("Reply sent") });
        load().catch(() => {});
      } else {
        toast({ title: tt("Could not send reply"), description: res.returnMessage });
      }
    } catch (err) {
      toast({ title: tt("Could not send reply"), description: (err as Error)?.message });
    } finally {
      setSending(false);
    }
  }, [reply, activeTicket, toast, load, pickedAttachment, clearAttachment]);

  const changeStatus = useCallback(
    async (status: SupportStatus) => {
      if (!activeTicket) return;
      setUpdatingStatus(true);
      try {
        const res = await updateSupportTicketStatus(activeTicket.id, status);
        if (res.returnCode === 200 && res.returnData) {
          setActiveTicket(res.returnData);
          toast({ title: tt("Status updated") });
          load().catch(() => {});
        } else {
          toast({ title: tt("Could not update status"), description: res.returnMessage });
        }
      } catch (err) {
        toast({ title: tt("Could not update status"), description: (err as Error)?.message });
      } finally {
        setUpdatingStatus(false);
      }
    },
    [activeTicket, toast, load],
  );

  const goBack = useCallback(() => navigate(routes.landing.path), [navigate]);

  return {
    data: {
      tickets,
      totalCount,
      stats,
      loading,
      error,
      filter,
      category,
      search,
      activeTicket,
      loadingThread,
      reply,
      sending,
      updatingStatus,
      attachment: pickedAttachment,
      uploadingAttachment,
      connected,
      peerOnline,
    },
    actions: {
      selectAttachment,
      clearAttachment,
      setSearch,
      setReply,
      changeFilter,
      changeCategory,
      runSearch,
      openThread,
      closeThread,
      sendReply,
      markThreadRead,
      changeStatus,
      refresh: () => load(),
      goBack,
    },
  };
}

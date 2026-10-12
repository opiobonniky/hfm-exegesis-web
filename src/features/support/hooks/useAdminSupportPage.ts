// State, effects and actions for the admin support inbox.
import { useCallback, useEffect, useState } from "react";
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
import type {
  SupportCategory,
  SupportFilter,
  SupportStats,
  SupportStatus,
  SupportTicketDetail,
  SupportTicketSummary,
} from "../types";

export function useAdminSupportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const load = useCallback(
    async (overrides?: { filter?: SupportFilter; category?: SupportCategory | "all"; search?: string }) => {
      setLoading(true);
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
        setError((err as Error)?.message || tt("Could not load conversations."));
      } finally {
        setLoading(false);
      }
    },
    [filter, category, search],
  );

  useEffect(() => {
    load().catch(() => {});
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
      setLoadingThread(true);
      setActiveTicket(null);
      try {
        const res = await getAdminSupportTicket(ticket.id);
        if (res.returnCode === 200 && res.returnData) {
          setActiveTicket(res.returnData);
          setTickets(current =>
            current.map(item =>
              item.id === ticket.id ? { ...item, adminUnread: false } : item,
            ),
          );
          setStats(current =>
            current
              ? { ...current, unreadCount: Math.max(current.unreadCount - 1, 0) }
              : current,
          );
        } else {
          toast({ title: tt("Could not open conversation"), description: res.returnMessage });
        }
      } catch (err) {
        toast({ title: tt("Could not open conversation"), description: (err as Error)?.message });
      } finally {
        setLoadingThread(false);
      }
    },
    [toast],
  );

  const closeThread = useCallback(() => {
    setActiveTicket(null);
    setReply("");
  }, []);

  const sendReply = useCallback(async () => {
    const body = reply.trim();
    if (!body || !activeTicket) return;
    setSending(true);
    try {
      const res = await adminReplyToTicket(activeTicket.id, body);
      if (res.returnCode === 200 && res.returnData) {
        setActiveTicket(res.returnData);
        setReply("");
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
  }, [reply, activeTicket, toast, load]);

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
    },
    actions: {
      setSearch,
      setReply,
      changeFilter,
      changeCategory,
      runSearch,
      openThread,
      closeThread,
      sendReply,
      changeStatus,
      refresh: () => load(),
      goBack,
    },
  };
}

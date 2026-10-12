// All state, effects and actions for the reader Support page.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { routes } from "@/components/Routes/routes";
import { tt } from "@/components/languages/hardcodedTranslate";
import {
  createSupportTicket,
  getMySupportTickets,
  getSupportTicket,
  replyToSupportTicket,
} from "../services/support-service";
import {
  MAX_MESSAGE_LENGTH,
  MAX_SUBJECT_LENGTH,
  MIN_MESSAGE_LENGTH,
  MIN_SUBJECT_LENGTH,
  SUPPORT_PAGE_SIZE,
} from "../constants";
import type {
  SupportCategory,
  SupportFilter,
  SupportPriority,
  SupportTicketDetail,
  SupportTicketSummary,
} from "../types";

const deviceInfo = () =>
  typeof navigator === "undefined" ? "web" : `web · ${navigator.userAgent.slice(0, 120)}`;

export function useSupportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SupportFilter>("all");

  const [composerOpen, setComposerOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<SupportCategory>("technical");
  const [priority, setPriority] = useState<SupportPriority>("normal");
  const [submitting, setSubmitting] = useState(false);

  const [activeTicket, setActiveTicket] = useState<SupportTicketDetail | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(
    async (activeFilter: SupportFilter = filter) => {
      setLoading(true);
      try {
        const res = await getMySupportTickets({
          page: 1,
          pageSize: SUPPORT_PAGE_SIZE,
          ...(activeFilter === "all" ? {} : { status: activeFilter }),
        });
        if (res.returnCode === 200 && res.returnData) {
          setTickets(res.returnData.tickets ?? []);
          setTotalCount(res.returnData.totalCount ?? 0);
          setUnreadCount(res.returnData.unreadCount ?? 0);
          setError(null);
        } else {
          setError(res.returnMessage || tt("Could not load your messages."));
        }
      } catch (err) {
        setError((err as Error)?.message || tt("Could not load your messages."));
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const changeFilter = useCallback(
    (next: SupportFilter) => {
      setFilter(next);
      load(next).catch(() => {});
    },
    [load],
  );

  const openThread = useCallback(async (ticket: SupportTicketSummary) => {
    setLoadingThread(true);
    setActiveTicket(null);
    try {
      const res = await getSupportTicket(ticket.id);
      if (res.returnCode === 200 && res.returnData) {
        setActiveTicket(res.returnData);
        setTickets(current =>
          current.map(item =>
            item.id === ticket.id ? { ...item, userUnread: false } : item,
          ),
        );
      } else {
        toast({ title: tt("Could not open conversation"), description: res.returnMessage });
      }
    } catch (err) {
      toast({ title: tt("Could not open conversation"), description: (err as Error)?.message });
    } finally {
      setLoadingThread(false);
    }
  }, [toast]);

  const closeThread = useCallback(() => {
    setActiveTicket(null);
    setReply("");
  }, []);

  const sendReply = useCallback(async () => {
    const body = reply.trim();
    if (!body || !activeTicket) return;
    setSending(true);
    try {
      const res = await replyToSupportTicket(activeTicket.id, body);
      if (res.returnCode === 200 && res.returnData) {
        setActiveTicket(res.returnData);
        setReply("");
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

  const canSubmit = useMemo(
    () =>
      subject.trim().length >= MIN_SUBJECT_LENGTH &&
      message.trim().length >= MIN_MESSAGE_LENGTH &&
      !submitting,
    [subject, message, submitting],
  );

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await createSupportTicket({
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
        deviceInfo: deviceInfo(),
      });
      if (res.returnCode === 201 || res.returnCode === 200) {
        toast({
          title: tt("Message sent"),
          description: res.returnMessage || tt("Our team will reply soon."),
        });
        setComposerOpen(false);
        setSubject("");
        setMessage("");
        setCategory("technical");
        setPriority("normal");
        await load();
        if (res.returnData?.id) {
          const detail = await getSupportTicket(res.returnData.id);
          if (detail.returnCode === 200 && detail.returnData) {
            setActiveTicket(detail.returnData);
          }
        }
      } else {
        toast({ title: tt("Could not send message"), description: res.returnMessage });
      }
    } catch (err) {
      toast({ title: tt("Could not send message"), description: (err as Error)?.message });
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, subject, message, category, priority, toast, load]);

  const goToSettings = useCallback(() => navigate(routes.settings.path), [navigate]);

  return {
    data: {
      tickets,
      totalCount,
      unreadCount,
      loading,
      error,
      filter,
      composerOpen,
      subject,
      message,
      category,
      priority,
      submitting,
      canSubmit,
      activeTicket,
      loadingThread,
      reply,
      sending,
    },
    actions: {
      setSubject,
      setMessage,
      setCategory,
      setPriority,
      setReply,
      changeFilter,
      openComposer: () => setComposerOpen(true),
      closeComposer: () => setComposerOpen(false),
      submit,
      openThread,
      closeThread,
      sendReply,
      refresh: () => load(),
      goToSettings,
    },
    limits: { MAX_SUBJECT_LENGTH, MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH },
  };
}

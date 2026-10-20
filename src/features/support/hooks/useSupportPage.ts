// All state, effects and actions for the reader Support page.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useSupportAttachment } from "./useSupportAttachment";
import { useSupportNotificationTarget } from './useSupportNotificationTarget';
import {
  appendThreadMessage,
  mergeTicketSummary,
  mergeTicketSummaryIntoDetail,
} from "../utils";
import type {
  SupportCategory,
  SupportFilter,
  SupportMessage,
  SupportPriority,
  SupportTicketDetail,
  SupportTicketSummary,
} from "../types";
import {
  useSupportRealtime,
  type SupportRealtimePayload,
} from "../contexts/SupportRealtimeContext";

const deviceInfo = () =>
  typeof navigator === "undefined" ? "web" : `web · ${navigator.userAgent.slice(0, 120)}`;

export function useSupportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUnread, subscribe } = useSupportRealtime();
  const attachmentPicker = useSupportAttachment();
  const pickedAttachment = attachmentPicker.data.attachment;
  const uploadingAttachment = attachmentPicker.data.uploading;
  const selectAttachment = attachmentPicker.actions.selectFile;
  const clearAttachment = attachmentPicker.actions.clear;

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
  const listRequestSequence = useRef(0);
  const threadRequestSequence = useRef(0);

  const load = useCallback(
    async (activeFilter: SupportFilter = filter, showLoading = false) => {
      const sequence = ++listRequestSequence.current;
      if (showLoading) setLoading(true);
      try {
        const res = await getMySupportTickets({
          page: 1,
          pageSize: SUPPORT_PAGE_SIZE,
          ...(activeFilter === "all" ? {} : { status: activeFilter }),
        });
        if (sequence !== listRequestSequence.current) return;
        if (res.returnCode === 200 && res.returnData) {
          setTickets(res.returnData.tickets ?? []);
          setTotalCount(res.returnData.totalCount ?? 0);
          setUnreadCount(res.returnData.unreadCount ?? 0);
          setError(null);
        } else {
          setError(res.returnMessage || tt("Could not load your messages."));
        }
      } catch (err) {
        if (sequence !== listRequestSequence.current) return;
        setError((err as Error)?.message || tt("Could not load your messages."));
      } finally {
        if (sequence === listRequestSequence.current) setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    load("all", true).catch(() => {});
    // Initial loading is the only fetch that replaces the list with a loader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFilter = useCallback(
    (next: SupportFilter) => {
      setFilter(next);
      load(next).catch(() => {});
    },
    [load],
  );

  const openThread = useCallback(async (ticket: Pick<SupportTicketSummary, 'id'>) => {
    const sequence = ++threadRequestSequence.current;
    setLoadingThread(true);
    setActiveTicket(null);
    try {
      const res = await getSupportTicket(ticket.id, false);
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
  }, [toast]);

  useSupportNotificationTarget(openThread);

  const markThreadRead = useCallback(async () => {
    const ticket = activeTicket;
    if (!ticket?.userUnread || document.visibilityState !== "visible") return;
    const sequence = ++threadRequestSequence.current;
    try {
      const response = await getSupportTicket(ticket.id, true);
      if (
        sequence !== threadRequestSequence.current ||
        response.returnCode !== 200 ||
        !response.returnData
      ) return;
      setActiveTicket(current => current?.id === ticket.id ? response.returnData! : current);
      setTickets(current =>
        current.map(item => item.id === ticket.id ? { ...item, userUnread: false } : item),
      );
      load(filter).catch(() => {});
      refreshUnread().catch(() => {});
    } catch {
      // A later realtime refresh retries the read acknowledgement.
    }
  }, [activeTicket, filter, load, refreshUnread]);

  const applyTicketDelta = useCallback(
    (incoming: SupportTicketSummary) => {
      setTickets(current => mergeTicketSummary(current, incoming, { filter }));
      setActiveTicket(current =>
        current ? mergeTicketSummaryIntoDetail(current, incoming) : current,
      );
    },
    [filter],
  );

  const applyMessageDelta = useCallback((incoming: SupportMessage) => {
    setActiveTicket(current => {
      if (!current || String(current.id) !== String(incoming.ticketId)) return current;
      return { ...current, messages: appendThreadMessage(current.messages, incoming) };
    });
  }, []);

  // Apply socket payloads directly so replies appear without a refetch.
  useEffect(
    () =>
      subscribe(payload => {
        const event = payload as SupportRealtimePayload;
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
      const res = await replyToSupportTicket(activeTicket.id, body, pickedAttachment);
      if (res.returnCode === 200 && res.returnData) {
        setActiveTicket(res.returnData);
        setReply("");
        clearAttachment();
        load(filter).catch(() => {});
      } else {
        toast({ title: tt("Could not send reply"), description: res.returnMessage });
      }
    } catch (err) {
      toast({ title: tt("Could not send reply"), description: (err as Error)?.message });
    } finally {
      setSending(false);
    }
  }, [reply, activeTicket, toast, load, filter, pickedAttachment, clearAttachment]);

  const canSubmit = useMemo(
    () =>
      subject.trim().length >= MIN_SUBJECT_LENGTH &&
      (message.trim().length >= MIN_MESSAGE_LENGTH || !!pickedAttachment) &&
      !submitting &&
      !uploadingAttachment,
    [subject, message, submitting, pickedAttachment, uploadingAttachment],
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
        attachment: pickedAttachment?.url ?? null,
        attachmentName: pickedAttachment?.name ?? null,
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
        clearAttachment();
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
  }, [canSubmit, subject, message, category, priority, toast, load, pickedAttachment, clearAttachment]);

  const goToSettings = useCallback(() => navigate(routes.settings.path), [navigate]);

  /** The help centre can open the composer with a category and ready-made subject. */
  const openComposerWith = useCallback(
    (prefill: { category?: SupportCategory; subject?: string }) => {
      if (prefill.category) setCategory(prefill.category);
      if (prefill.subject) setSubject(prefill.subject);
      setComposerOpen(true);
    },
    [],
  );

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
      attachment: pickedAttachment,
      uploadingAttachment,
    },
    actions: {
      selectAttachment,
      clearAttachment,
      setSubject,
      setMessage,
      setCategory,
      setPriority,
      setReply,
      changeFilter,
      openComposer: () => setComposerOpen(true),
      openComposerWith,
      closeComposer: () => setComposerOpen(false),
      submit,
      openThread,
      closeThread,
      sendReply,
      markThreadRead,
      refresh: () => load(),
      goToSettings,
    },
    limits: { MAX_SUBJECT_LENGTH, MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH },
  };
}

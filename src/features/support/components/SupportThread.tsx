import { useEffect, useRef } from "react";
import { Check, CheckCheck, Loader2, Paperclip, SendHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import {
  SUPPORT_ATTACHMENT_ACCEPT,
  SUPPORT_ATTACH_HINT,
  SUPPORT_REPLY_PLACEHOLDER,
} from "../constants";
import type { SupportThreadProps } from "../types";
import { formatSupportDateTime, formatSupportFileSize, isImageAttachment } from "../utils";
import { displayDateTime } from "@/services/numberLocale/format";
import { SupportCategoryBadge, SupportStatusBadge } from "./SupportStatusBadge";

export function SupportThread({
  ticket,
  viewerRole = "user",
  reply,
  sending,
  attachment,
  uploadingAttachment,
  onChangeReply,
  onSend,
  onSelectFile,
  onClearAttachment,
  onMessagesVisible,
  footer,
}: SupportThreadProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const previousTicketId = useRef<number | null>(null);
  const lastMessageId = ticket.messages.at(-1)?.id;

  useEffect(() => {
    const messages = messagesRef.current;
    const openedTicket = previousTicketId.current !== ticket.id;
    previousTicketId.current = ticket.id;
    if (messages && (openedTicket || nearBottomRef.current)) {
      messages.scrollTo({ top: messages.scrollHeight });
    }
  }, [ticket.id, lastMessageId]);

  useEffect(() => {
    const end = endRef.current;
    if (!end || !onMessagesVisible) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) onMessagesVisible();
      },
      { root: messagesRef.current, threshold: 1 },
    );
    observer.observe(end);
    return () => observer.disconnect();
  }, [lastMessageId, onMessagesVisible, ticket.id]);

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">{ticket.subject}</h2>
          <SupportStatusBadge status={ticket.status} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{ticket.ticketCode}</span>
          <SupportCategoryBadge category={ticket.category} />
          {ticket.user && (
            <span>
              {[ticket.user.firstName, ticket.user.lastName].filter(Boolean).join(" ") ||
                ticket.user.username ||
                ticket.user.email}
            </span>
          )}
        </div>
        {ticket.deviceInfo && (
          <p className="mt-2 truncate text-xs text-muted-foreground/80">{ticket.deviceInfo}</p>
        )}
        {footer}
      </div>

      <div
        ref={messagesRef}
        onScroll={event => {
          const target = event.currentTarget;
          nearBottomRef.current =
            target.scrollHeight - target.scrollTop - target.clientHeight < 48;
        }}
        className="mt-4 min-h-48 max-h-[60dvh] flex-1 space-y-3 overflow-y-auto pr-1"
      >
        {ticket.messages.map(message => {
          const mine = message.senderRole === viewerRole;
          return (
            <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl border px-3.5 py-2.5 text-sm",
                  message.senderRole === "admin"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                    : "border-sky-500/30 bg-sky-500/10 text-foreground",
                )}
              >
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {mine
                    ? tt("You")
                    : viewerRole === "admin"
                      ? tt("Reader")
                      : tt("Support team")}
                </div>
                {!!message.attachment &&
                  (isImageAttachment(message.attachment) ? (
                    <a href={message.attachment} target="_blank" rel="noreferrer">
                      <img
                        src={message.attachment}
                        alt={message.attachmentName || tt("Attachment")}
                        className="mb-2 max-h-56 rounded-lg border border-border object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={message.attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-2 inline-flex items-center gap-2 rounded-lg border border-border px-2 py-1 text-xs font-medium text-primary hover:bg-muted"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      {message.attachmentName || tt("Attachment")}
                    </a>
                  ))}
                {!!message.body && (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                )}
                <div className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                  <time
                    dateTime={message.createdOn}
                    title={displayDateTime(message.createdOn)}
                  >
                    {formatSupportDateTime(message.createdOn)}
                  </time>
                  {mine && (
                    <span
                      title={message.readAt ? tt("Read") : message.deliveredAt ? tt("Delivered") : tt("Sent")}
                      className={cn(message.readAt && "text-emerald-500")}
                    >
                      {message.deliveredAt ? (
                        <CheckCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} className="h-px" aria-hidden="true" />
      </div>

      {!!attachment && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-2">
          <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-xs text-foreground">
            {attachment.name}
            {attachment.size ? ` · ${formatSupportFileSize(attachment.size)}` : ""}
          </span>
          <button
            type="button"
            onClick={onClearAttachment}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mt-4 flex items-end gap-2 border-t border-border pt-3">
        <label
          title={SUPPORT_ATTACH_HINT}
          className={cn(
            "inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted",
            uploadingAttachment && "cursor-wait opacity-50",
          )}
        >
          <input
            type="file"
            accept={SUPPORT_ATTACHMENT_ACCEPT}
            className="hidden"
            disabled={uploadingAttachment}
            onChange={e => {
              const picked = e.target.files?.[0];
              if (picked) onSelectFile(picked);
              e.target.value = "";
            }}
          />
          {uploadingAttachment ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </label>
        <textarea
          value={reply}
          onChange={e => onChangeReply(e.target.value)}
          placeholder={SUPPORT_REPLY_PLACEHOLDER}
          rows={2}
          className="min-h-11 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={(!reply.trim() && !attachment) || sending || uploadingAttachment}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

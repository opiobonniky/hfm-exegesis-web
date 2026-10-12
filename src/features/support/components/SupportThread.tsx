import { Loader2, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import { SUPPORT_REPLY_PLACEHOLDER } from "../constants";
import type { SupportThreadProps } from "../types";
import { formatSupportDateTime } from "../utils";
import { SupportCategoryBadge, SupportStatusBadge } from "./SupportStatusBadge";

export function SupportThread({
  ticket,
  reply,
  sending,
  onChangeReply,
  onSend,
  footer,
}: SupportThreadProps) {
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

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {ticket.messages.map(message => {
          const mine = message.senderRole === "user";
          return (
            <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl border px-3.5 py-2.5 text-sm",
                  mine
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-muted/40 text-foreground",
                )}
              >
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {mine ? tt("User") : tt("Support team")}
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                <div className="mt-1.5 text-right text-[11px] text-muted-foreground">
                  {formatSupportDateTime(message.createdOn)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-end gap-2 border-t border-border pt-3">
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
          disabled={!reply.trim() || sending}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

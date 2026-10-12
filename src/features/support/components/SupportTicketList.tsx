import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { SupportTicketListProps } from "../types";
import { formatSupportDate } from "../utils";
import { SupportCategoryBadge, SupportPriorityDot, SupportStatusBadge } from "./SupportStatusBadge";

export function SupportTicketList({
  tickets,
  onSelect,
  showUser = false,
  emptyMessage,
}: SupportTicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
        {emptyMessage ?? tt("No conversations yet")}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {tickets.map(ticket => {
        const unread = showUser ? ticket.adminUnread : ticket.userUnread;
        const preview = ticket.lastMessage?.body ?? "";
        const fromTeam = ticket.lastMessage?.senderRole === "admin";

        return (
          <button
            key={ticket.id}
            type="button"
            onClick={() => onSelect(ticket)}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
              unread && "bg-primary/5",
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                <span className="truncate text-sm font-semibold text-foreground">
                  {ticket.subject}
                </span>
                <SupportStatusBadge status={ticket.status} />
              </div>

              {!!preview && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {fromTeam ? `${tt("Support")}: ` : `${tt("You")}: `}
                  {preview}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <SupportCategoryBadge category={ticket.category} />
                <SupportPriorityDot priority={ticket.priority} />
                {showUser && ticket.user && (
                  <span className="truncate">
                    {[ticket.user.firstName, ticket.user.lastName].filter(Boolean).join(" ") ||
                      ticket.user.username ||
                      ticket.user.email}
                  </span>
                )}
                <span>· {ticket.messageCount} {tt("messages")}</span>
                <span>· {formatSupportDate(ticket.lastMessageAt || ticket.createdOn)}</span>
              </div>
            </div>

            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}

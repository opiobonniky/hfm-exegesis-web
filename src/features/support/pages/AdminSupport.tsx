// AdminSupport — admin inbox for reader complaints / messages (thin page).
"use client";

import { Inbox, LifeBuoy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import { useAdminSupportPage } from "../hooks/useAdminSupportPage";
import { SupportThread, SupportTicketList } from "../components";
import {
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_FILTERS,
  SUPPORT_STATUS_OPTIONS,
} from "../constants";

export default function AdminSupport() {
  const { data, actions } = useAdminSupportPage();
  const h = { ...data, ...actions };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <Inbox className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-foreground">{tt("Support Inbox")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {h.totalCount} {tt("conversations")}
              {h.stats?.unreadCount ? ` · ${h.stats.unreadCount} ${tt("awaiting reply")}` : ""}
            </p>
          </div>
        </div>

        {h.stats && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {SUPPORT_STATUS_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => h.changeFilter(option.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  h.filter === option.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                )}
              >
                <div className="text-2xl font-bold text-foreground">
                  {h.stats?.counts?.[option.id] ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">{option.label}</div>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={h.search}
            onChange={e => h.setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && h.runSearch()}
            placeholder={tt("Search subject, code or email…")}
            className="min-h-11 min-w-[240px] flex-1 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={h.category}
            onChange={e => h.changeCategory(e.target.value as never)}
            className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="all">{tt("All categories")}</option>
            {SUPPORT_CATEGORY_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {SUPPORT_FILTERS.map(filter => (
              <button
                key={filter.id}
                type="button"
                onClick={() => h.changeFilter(filter.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  h.filter === filter.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/60",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div>
            {h.loading ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                {tt("Loading conversations…")}
              </div>
            ) : h.error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {h.error}
                <button type="button" onClick={h.refresh} className="ml-2 font-semibold underline">
                  {tt("Try again")}
                </button>
              </div>
            ) : (
              <SupportTicketList
                tickets={h.tickets}
                onSelect={h.openThread}
                showUser
                emptyMessage={tt("No conversations match these filters.")}
              />
            )}
          </div>

          <div className="min-h-[320px]">
            {h.loadingThread ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-border text-sm text-muted-foreground">
                {tt("Loading conversation…")}
              </div>
            ) : h.activeTicket ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <SupportThread
                  ticket={h.activeTicket}
                  reply={h.reply}
                  sending={h.sending}
                  attachment={h.attachment}
                  uploadingAttachment={h.uploadingAttachment}
                  onChangeReply={h.setReply}
                  onSend={h.sendReply}
                  onSelectFile={h.selectAttachment}
                  onClearAttachment={h.clearAttachment}
                  footer={
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      {SUPPORT_STATUS_OPTIONS.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          disabled={h.updatingStatus || h.activeTicket?.status === option.id}
                          onClick={() => h.changeStatus(option.id)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                            h.activeTicket?.status === option.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted/60",
                            "disabled:opacity-60",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={h.closeThread}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        {tt("Close panel")}
                      </button>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
                <LifeBuoy className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  {tt("Select a conversation")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tt("Reply to a reader or update the ticket status.")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
